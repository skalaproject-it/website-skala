export const partnershipOptions = [
	{ value: 'CSR/TJSL', title: 'Program CSR/TJSL', description: 'Merancang, menjalankan, dan mengevaluasi program tanggung jawab sosial perusahaan bersama komunitas.' },
	{ value: 'Pemberdayaan Masyarakat', title: 'Pemberdayaan Masyarakat', description: 'Mendampingi kelompok tani, UMKM, perempuan, dan pemuda untuk mengembangkan kapasitas serta ekonomi lokal.' },
	{ value: 'Konservasi Lingkungan', title: 'Konservasi & Rehabilitasi Lingkungan', description: 'Membahas pemulihan lahan, konservasi air dan tanah, serta pelestarian lingkungan berbasis komunitas.' },
	{ value: 'Riset dan Pemetaan Sosial', title: 'Riset & Pemetaan Sosial', description: 'Memahami kebutuhan, potensi, dan pemangku kepentingan sebagai dasar perencanaan program.' },
];

export const partnershipTypes = [...partnershipOptions.map((option) => option.value), 'Perlu Diskusi'];
export const partnershipLimits = { name: 120, organization: 200, email: 254, phone: 40, project_interest: 300, message: 4000 };

export function validatePartnership(input: unknown) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return { error: 'Data formulir tidak valid.', field: '' } as const;
	}
	const body = input as Record<string, unknown>;
	const field = (key: string) => typeof body[key] === 'string' ? body[key].trim() : '';
	const data = {
		name: field('name'), organization: field('organization'), email: field('email'),
		phone: field('phone'), partner_type: field('partner_type'),
		project_interest: field('project_interest'), message: field('message'),
	};
	for (const [key, label] of [['name', 'nama'], ['email', 'email'], ['partner_type', 'bidang kerja sama'], ['message', 'gambaran kebutuhan']] as const) {
		if (!data[key]) return { error: `Mohon isi ${label}.`, field: key } as const;
	}
	for (const key of Object.keys(partnershipLimits) as (keyof typeof partnershipLimits)[]) {
		if (data[key].length > partnershipLimits[key]) {
			return { error: `Isian terlalu panjang. Batasnya ${partnershipLimits[key]} karakter.`, field: key } as const;
		}
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
		return { error: 'Masukkan alamat email yang valid, misalnya nama@instansi.id.', field: 'email' } as const;
	}
	if (!partnershipTypes.includes(data.partner_type)) {
		return { error: 'Pilih bidang kerja sama yang tersedia.', field: 'partner_type' } as const;
	}
	return { data } as const;
}
