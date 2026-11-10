import type { CollectionEntry } from 'astro:content';

export type NewsEntry = CollectionEntry<'news'>;
export type NewsCategory = NewsEntry['data']['category'];

export const PAGE_SIZE = 6;

export const categoryLabels: Record<NewsCategory, string> = {
	pemberdayaan: 'Pemberdayaan Masyarakat',
	pelestarian: 'Pelestarian Lingkungan',
	penanaman: 'Penanaman & Restorasi',
	pembibitan: 'Pembibitan & Kapabilitas',
	monitoring: 'Monitoring & Kajian',
	kemitraan: 'Kemitraan & CSR',
};

export const categoryOrder: NewsCategory[] = [
	'pemberdayaan',
	'pelestarian',
	'penanaman',
	'pembibitan',
	'monitoring',
	'kemitraan',
];

export const categoryHref = (category: NewsCategory): string => `/berita/kategori/${category}`;

export const yearHref = (year: number): string => `/berita/tahun/${year}`;

export const newsHref = (item: NewsEntry): string => `/berita/${item.id}`;

export const byDateDesc = (a: NewsEntry, b: NewsEntry): number =>
	b.data.date.valueOf() - a.data.date.valueOf();

export const sortNews = (items: NewsEntry[]): NewsEntry[] => [...items].sort(byDateDesc);

export const categoriesOf = (items: NewsEntry[]): NewsCategory[] => {
	const present = new Set(items.map((item) => item.data.category));
	return categoryOrder.filter((category) => present.has(category));
};

export const yearsOf = (items: NewsEntry[]): number[] =>
	[...new Set(items.map((item) => item.data.date.getFullYear()))].sort((a, b) => b - a);

export const countByCategory = (items: NewsEntry[]): Record<string, number> =>
	items.reduce<Record<string, number>>((acc, item) => {
		acc[item.data.category] = (acc[item.data.category] ?? 0) + 1;
		return acc;
	}, {});

export const monthKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}`;

export const monthLabel = (date: Date): string =>
	date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export type MonthGroup = { key: string; label: string; items: NewsEntry[] };

export const groupByMonth = (items: NewsEntry[]): MonthGroup[] => {
	const groups = new Map<string, MonthGroup>();
	for (const item of sortNews(items)) {
		const key = monthKey(item.data.date);
		const existing = groups.get(key);
		if (existing) {
			existing.items.push(item);
		} else {
			groups.set(key, { key, label: monthLabel(item.data.date), items: [item] });
		}
	}
	return [...groups.values()];
};

const WORDS_PER_MINUTE = 200;

export const readingTime = (body: string): number => {
	const words = body.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export const formatDate = (date: Date): string =>
	date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateLong = (date: Date): string =>
	date.toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

/**
 * Mengubah markdown mentah menjadi teks polos untuk data terstruktur.
 * Dipakai untuk `articleBody` pada NewsArticle JSON-LD, bukan untuk tampilannya
 * (untuk tampilan tetap pakai <Content />). Sengaja dibatasi agar tidak membocor
 * hal yang tidak relevan ke mesin telusur.
 */
export const toPlainText = (body: string, maxLength = 4000): string =>
	body
		// blok kode dan import markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/^---[\s\S]*?---\s*/m, ' ')
		// tautan dan gambar: simpan teksnya saja
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		// penanda emphasised
		.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
		// heading, kutip, list, tabel, garis
		.replace(/^\s{0,3}#{1,6}\s+/gm, '')
		.replace(/^\s{0,3}>\s?/gm, '')
		.replace(/^\s{0,3}[-*+]\s+/gm, '')
		.replace(/^\s{0,3}\d+\.\s+/gm, '')
		.replace(/^\s*\|.*\|\s*$/gm, ' ')
		.replace(/^\s*[-:| ]{4,}\s*$/gm, ' ')
		.replace(/^\s*(?:---|\*\*\*|___)\s*$/gm, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);

export const wordCount = (plain: string): number =>
	plain.split(/\s+/).filter(Boolean).length;
