/**
 * Scroll-reveal utility (Intersection Observer):
 * - `[data-reveal]`           single element reveal (fade + translate-y)
 * - `[data-reveal-group]`     container; reveals its `[data-reveal]` children with stagger
 * - `[data-image-reveal]`     visual block / hero image; scale 1.05 -> 1 + fade
 * - `[data-count-up]`         animates number text from 0 to `data-count-to`
 *
 * Group stagger defaults to 70ms per item and can be tuned per section with
 * `data-reveal-stagger="<ms>"`. Count-up starts only after its reveal host is
 * visible, so the number never animates before the card that contains it.
 *
 * `revealViewport()` is a utility that instantly reveals everything
 * intersecting the viewport. It is NOT called on `astro:after-swap` anymore:
 * instant reveal meant client-side navigations showed no animation at all
 * (only reloads did). Navigation now runs `initMotion()` directly, so the
 * new page animates the same way a reload does.
 *
 * All motion is skipped (instant reveal) when prefers-reduced-motion is set.
 */

type Easing = (t: number) => number;

const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3);

export function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyCountValue(el: HTMLElement, value: number): void {
	const prefix = el.dataset.countPrefix ?? '';
	const suffix = el.dataset.countSuffix ?? '';
	const decimals = Number.parseInt(el.dataset.countDecimals ?? '0', 10);
	const locale = el.dataset.countLocale ?? 'id-ID';
	const formatter = new Intl.NumberFormat(locale, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
	el.textContent = `${prefix}${formatter.format(value)}${suffix}`;
}

export function animateCountUp(el: HTMLElement): void {
	const target = Number.parseFloat(el.dataset.countTo ?? '0') || 0;

	if (prefersReducedMotion()) {
		applyCountValue(el, target);
		return;
	}

	const duration = Number.parseInt(el.dataset.countDuration ?? '1600', 10);
	const start = performance.now();

	const tick = (now: number): void => {
		const progress = Math.min((now - start) / duration, 1);
		applyCountValue(el, target * easeOutCubic(progress));
		if (progress < 1) requestAnimationFrame(tick);
	};

	requestAnimationFrame(tick);
}

function countHost(el: HTMLElement): HTMLElement | null {
	return el.closest<HTMLElement>('[data-reveal], [data-reveal-group], [data-image-reveal]');
}

function startCountUpWhenHostVisible(el: HTMLElement): void {
	if (prefersReducedMotion()) {
		applyCountValue(el, Number.parseFloat(el.dataset.countTo ?? '0') || 0);
		return;
	}

	const host = countHost(el);
	const begin = () => window.setTimeout(() => animateCountUp(el), 50);

	if (!host || host.classList.contains('is-revealed')) {
		requestAnimationFrame(begin);
		return;
	}

	let tries = 0;
	const wait = (): void => {
		const ready = host.classList.contains('is-revealed');
		if (ready || tries >= 90) {
			begin();
		} else {
			tries += 1;
			requestAnimationFrame(wait);
		}
	};
	if (host) requestAnimationFrame(wait);
}

interface MotionOptions {
	threshold?: number;
	staggerStep?: number;
	rootMargin?: string;
}

let teardown: (() => void) | null = null;

function revealQuietly(root: Document | HTMLElement): void {
	root.querySelectorAll<HTMLElement>('[data-reveal-group], [data-reveal], [data-image-reveal]').forEach(
		(el) => el.classList.add('is-revealed'),
	);
	root.querySelectorAll<HTMLElement>('[data-count-up]').forEach((el) => {
		const target = Number.parseFloat(el.dataset.countTo ?? '0') || 0;
		applyCountValue(el, target);
	});
}

/**
 * Instantly reveal elements intersecting the current viewport. Runs on the live
 * document after a client-side swap so the new page's above-fold content is
 * visible the moment it renders (below-fold keeps its scroll reveal).
 */
export function revealViewport(root: Document | HTMLElement, margin = 128): void {
	const vh = window.innerHeight || document.documentElement.clientHeight;
	const intersects = (el: HTMLElement): boolean => {
		const rect = el.getBoundingClientRect();
		return rect.top < vh + margin && rect.bottom > -margin;
	};

	const groups = root.querySelectorAll<HTMLElement>('[data-reveal-group]');
	for (const group of groups) {
		if (!intersects(group)) continue;
		group.classList.add('is-revealed');
		group
			.querySelectorAll<HTMLElement>('[data-reveal], [data-image-reveal]')
			.forEach((child) => child.classList.add('is-revealed'));
	}

	const singles = root.querySelectorAll<HTMLElement>(
		'[data-reveal]:not([data-reveal-group] [data-reveal]), [data-image-reveal]:not([data-reveal-group] [data-image-reveal])',
	);
	for (const el of singles) {
		if (intersects(el)) el.classList.add('is-revealed');
	}
}

export function initMotion(
	root: Document | HTMLElement = document,
	opts: MotionOptions = {},
): () => void {
	if (teardown) teardown();

	const { threshold = 0.2, staggerStep = 70, rootMargin = '0px 0px -8% 0px' } = opts;

	if (prefersReducedMotion()) {
		revealQuietly(root);
		return () => {};
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target as HTMLElement;
				io.unobserve(el);

				if (el.hasAttribute('data-reveal-group')) {
					const rawStep = Number.parseFloat(el.dataset.revealStagger ?? '');
					const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : staggerStep;
					const children = el.querySelectorAll<HTMLElement>('[data-reveal], [data-image-reveal]');
					children.forEach((child, index) => {
						const base = Number.parseFloat(child.dataset.revealDelay ?? '0');
						window.setTimeout(() => child.classList.add('is-revealed'), Number.isFinite(base) ? base + index * step : index * step);
					});
				} else if (el.hasAttribute('data-image-reveal')) {
					const delay = Number.parseFloat(el.dataset.revealDelay ?? '0');
					window.setTimeout(() => el.classList.add('is-revealed'), Number.isFinite(delay) ? delay : 0);
				} else if (el.hasAttribute('data-reveal')) {
					const delay = Number.parseFloat(el.dataset.revealDelay ?? '0');
					window.setTimeout(() => el.classList.add('is-revealed'), Number.isFinite(delay) ? delay : 0);
				} else if (el.hasAttribute('data-count-up')) {
					startCountUpWhenHostVisible(el);
				}
			}
		},
		{ threshold, rootMargin },
	);

	root
		.querySelectorAll<HTMLElement>('[data-reveal-group]')
		.forEach((el) => io.observe(el));

	root
		.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-group] [data-reveal])')
		.forEach((el) => io.observe(el));

	root
		.querySelectorAll<HTMLElement>('[data-image-reveal]:not([data-reveal-group] [data-image-reveal])')
		.forEach((el) => io.observe(el));

	root.querySelectorAll<HTMLElement>('[data-count-up]').forEach((el) => io.observe(el));

	teardown = () => io.disconnect();
	return teardown;
}

/** Matches the original 32s / 1238px cadence so the perceived speed is unchanged. */
const MARQUEE_SPEED_PX_PER_SEC = 38.7;

/**
 * Partner-logo marquee.
 *
 * The track holds several repetitions (`.a-marquee-set`) of the logo list. For a
 * seamless loop the shift has to be an exact multiple of one repetition, and it
 * has to be at least as wide as the container — otherwise the seam shows empty
 * space. Both are measured at runtime and written to the track as custom
 * properties, which keeps the keyframe a single `translateX`.
 */
export function initMarquees(root: Document | HTMLElement = document): () => void {
	const apply = (wrap: HTMLElement): void => {
		const track = wrap.querySelector<HTMLElement>('.a-marquee-track');
		const set = wrap.querySelector<HTMLElement>('[data-marquee-set]');
		if (!track || !set) return;

		const setCount = track.querySelectorAll('.a-marquee-set').length;
		if (setCount < 2) return;

		const setW = set.getBoundingClientRect().width;
		const containerW = wrap.clientWidth;
		if (setW < 1 || containerW < 1) return;

		// Fewest whole repetitions that still cover the container…
		const copies = Math.max(1, Math.ceil(containerW / setW));
		// …but never more than half the track, and only while enough content
		// remains on the far side of the seam to fill the container.
		if (copies > Math.floor(setCount / 2)) return;
		if ((setCount - copies) * setW < containerW) return;

		track.style.setProperty('--marquee-shift', `${copies * setW}px`);
		track.style.setProperty(
			'--marquee-duration',
			`${(copies * setW / MARQUEE_SPEED_PX_PER_SEC).toFixed(2)}s`,
		);
	};

	const all = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[data-marquee]')];
	all().forEach(apply);

	if (prefersReducedMotion() || all().length === 0) return () => {};

	// Webfonts and lazy images change a repetition's width, so re-measure once
	// they have settled and again on resize.
	void document.fonts?.ready.then(() => all().forEach(apply));

	// Logos inside the track may still be decoding when `initMarquees` runs, and
	// an unsized <img> collapses its set to a fraction of the real width. Re-measure
	// once every image has settled so the shift always covers the container.
	const remeasureWhenSettled = (): void => {
		const pending = all().flatMap((wrap) => [...wrap.querySelectorAll('img')]);
		if (!pending.length) return;
		const done = (): void => all().forEach(apply);
		if (pending.every((img) => img.complete)) {
			done();
			return;
		}
		let left = pending.length;
		const onSettled = (): void => {
			left -= 1;
			if (left <= 0) done();
		};
		for (const img of pending) {
			img.addEventListener('load', onSettled, { once: true });
			img.addEventListener('error', onSettled, { once: true });
		}
	};
	remeasureWhenSettled();

	let frame = 0;
	const onResize = (): void => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => all().forEach(apply));
	};
	window.addEventListener('resize', onResize);

	return () => {
		cancelAnimationFrame(frame);
		window.removeEventListener('resize', onResize);
	};
}