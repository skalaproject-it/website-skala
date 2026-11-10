export type ProjectCategory = 'reboisasi' | 'konservasi' | 'kemitraan';

export type AreaValue = number | '[ISI DATA]' | undefined;
export type FundingValue = number | '[ISI DATA]' | undefined;

export const projectCategories: ProjectCategory[] = ['reboisasi', 'konservasi', 'kemitraan'];

export const categoryLabel: Record<ProjectCategory, string> = {
	reboisasi: 'Reboisasi',
	konservasi: 'Konservasi',
	kemitraan: 'Kemitraan CSR/TJSL',
};

export const statusLabel: Record<string, string> = {
	planned: 'Direncanakan',
	active: 'Berjalan',
	completed: 'Selesai',
	fundraising: 'Mencari Mitra Pendanaan',
};

export const fmtArea = (value: AreaValue): string =>
	typeof value === 'number' ? `${value.toLocaleString('id-ID')} hektare` : 'Belum ditetapkan';

export const fmtFunding = (value: FundingValue): string =>
	typeof value === 'number' ? `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}` : 'Belum ditetapkan';

/** Matches an unfilled editorial marker such as `[ISI DATA]` or `[TBD]`. */
const PLACEHOLDER_MARKER = /^\[.+\]$/;

/** Renders optional free-text frontmatter, falling back to the same wording as
 *  `fmtArea`/`fmtFunding` so no raw marker ever reaches the page. */
export const placeholder = (value: string | undefined | null): string => {
	const text = value?.trim();
	if (!text || PLACEHOLDER_MARKER.test(text)) return 'Belum ditetapkan';
	return text;
};

export const progressLabel = (progress: number): string =>
	progress <= 0 ? 'Menunggu pendanaan' : progress >= 100 ? 'Selesai' : 'Sedang berjalan';