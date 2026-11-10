export interface NavChild {
	label: string;
	href: string;
}

export interface NavItem {
	label: string;
	href: string;
	children?: NavChild[];
}

export const navigation: NavItem[] = [
	{ label: 'Beranda', href: '/' },
	{
		label: 'Tentang',
		href: '/tentang',
		children: [
			{ label: 'Tentang Kami', href: '/tentang' },
			{ label: 'Metodologi & Sains', href: '/metodologi' },
			{ label: 'Tata Kelola', href: '/tata-kelola' },
			{ label: 'Komunitas & Mitra KTH', href: '/komunitas' },
		],
	},
  { label: 'Program', href: '/program' },
	{
		label: 'Publikasi',
		href: '/publikasi',
		children: [
			{ label: 'Publikasi', href: '/publikasi' },
			{ label: 'Dampak', href: '/dampak' },
		],
	},
	{ label: 'Berita', href: '/berita' },
	{ label: 'Kontak', href: '/kontak' },
];