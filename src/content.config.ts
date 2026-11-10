import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		location: z.string(),
		category: z.enum(['reboisasi', 'konservasi', 'kemitraan']),
		area_hectares: z.union([z.number().positive(), z.literal('[ISI DATA]')]).optional(),
		status: z.enum(['planned', 'active', 'completed', 'fundraising']),
		description: z.string(),
		excerpt: z.string().max(120),
		community_partners: z.array(z.string()),
		funding_needed: z.union([z.number().positive(), z.literal('[ISI DATA]')]).optional(),
		progress: z.number().int().min(0).max(100).optional(),
		land_status: z.string().optional(),
		land_condition: z.string().optional(),
		impact_target: z.string().optional(),
		client: z.string().optional(),
		focus: z.string().optional(),
		period: z.string().optional(),
	}),
});

const partners = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/partners' }),
	schema: z.object({
		name: z.string(),
		location: z.string(),
		description: z.string(),
		established_year: z.number().int().min(1900).max(2100).optional(),
	}),
});

const news = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			date: z.coerce.date(),
			excerpt: z.string().max(120),
			category: z.enum([
				'pemberdayaan',
				'pelestarian',
				'penanaman',
				'pembibitan',
				'monitoring',
				'kemitraan',
			]),
			location: z.string(),
			featured: z.boolean().default(false),
			cover: image().optional(),
			// Ringkasan 3 poin untuk kotak "Sorotan" di atas artikel. Wajib
			// diturunkan dari isi artikel, bukan dari klaim capaian — sebagian
			// artikel memang belum punya hasil, jadi jangan mengarang angka.
			highlights: z.array(z.string().min(8)).max(4).optional(),
			// Slug project di src/content/projects yang benar-benar disebut di
			// dalam artikel. Kosongkan bila artikel tidak menyebut mitra program.
			projects: z.array(z.string()).max(3).optional(),
			tags: z.array(z.string()).max(6).optional(),
		}),
});

export const collections = { projects, partners, news };
