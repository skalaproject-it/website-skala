import type { ImageMetadata } from 'astro';

import hutanKanopi from '../assets/photos/hutan-kanopi.jpg';
import hutanAerial from '../assets/photos/hutan-aerial.jpg';
import hutanJabar from '../assets/photos/hutan-jabar.jpg';
import aspekLembah from '../assets/photos/aspek-lembah.jpg';
import kanopiAerial from '../assets/photos/kanopi-aerial.jpg';
import tanganSapling from '../assets/photos/tangan-sapling.jpg';
import tanamBersama from '../assets/photos/tanam-bersama.jpg';
import tanamSapar from '../assets/photos/tanam-sapar.jpg';
import semaiTeras from '../assets/photos/semai-teras.jpg';
import semaiGreenhouse from '../assets/photos/semai-greenhouse.jpg';
import semaiInterior from '../assets/photos/semai-interior.jpg';
import ukurPohon from '../assets/photos/ukur-pohon.jpg';
import penelitianLapangan from '../assets/photos/penelitian-lapangan.jpg';
import komunitasKampung from '../assets/photos/gotong-royong-masyarakat.jpg';
import gotongRoyongBudaya from '../assets/photos/gotong-royong-budaya.jpg';
import musdesPerencanaan from '../assets/photos/musdes-perencanaan-desa.jpg';
import rapatMasyarakat from '../assets/photos/musyawarah-desa.jpg';
import rapatTradisi from '../assets/photos/rapat-tradisi.jpg';
import sukarelawan from '../assets/photos/relawan-bersihkan-sungai.jpg';
import workshopLapangan from '../assets/photos/workshop-lapangan.jpg';
import anakPohon from '../assets/photos/anak-pohon.jpg';
import umkmTenun from '../assets/photos/umkm-tenun.jpg';
import petaniSawah from '../assets/photos/petani-sawah.jpg';

/**
 * Kredit & lisensi foto (Wikimedia Commons).
 *
 *musyawarah-desa.jpg          -> "Musyawarah" oleh Yohere, CC0 1.0 (public domain)
 * relicawan-bersihkan-sungai.jpg -> "Gotong Royong Membersihkan Sungai" oleh Galeri ega, CC BY-SA 4.0
 * gotong-royong-masyarakat.jpg -> "Gotong Royong Culture" oleh Ivuvisual, CC BY-SA 4.0
 * musdes-perencanaan-desa.jpg  -> "Musdes Penetapan Rencana Kerja Pembangunan Desa Beluk 2020"
 *                                 oleh Jayengrono, CC BY-SA 4.0 (hero /tata-kelola)
 * gotong-royong-budaya.jpg     -> "Gotong Royong adalah warisan budaya" oleh Andesta Saputra,
 *                                 CC BY-SA 4.0 (hero /komunitas)
 *
 * Atribusi wajib untuk foto berlisensi CC BY-SA:
 * - "Gotong Royong Membersihkan Sungai" oleh Galeri ega, lisensi CC BY-SA 4.0,
 *   https://commons.wikimedia.org/wiki/File:Gotong_Royong_Membersihkan_Sungai.jpg
 * - "Gotong Royong Culture" oleh Ivuvisual, lisensi CC BY-SA 4.0,
 *   https://commons.wikimedia.org/wiki/File:Gotong_Royong_Culture.jpg
 * - "Musdes Penetapan Rencana Kerja Pembangunan Desa Beluk 2020" oleh Jayengrono,
 *   lisensi CC BY-SA 4.0,
 *   https://commons.wikimedia.org/wiki/File:Musdes_Penetapan_Rencana_Kerja_Pembangunan_Desa_Beluk_2020.jpg
 * - "Gotong Royong adalah warisan budaya" oleh Andesta Saputra, lisensi CC BY-SA 4.0,
 *   https://commons.wikimedia.org/wiki/File:Gotong_Royong_adalah_warisan_budaya.jpg
 *
 * Catatan: repo ini belum memuat halaman kredit publik. Sebelumhibitkan di
 * produksi, tambahkan halaman /kredit/ atau blok kredit di footer yang
 * menampilkan keempat atribusi di atas, agar syarat CC BY-SA terpenuhi.
 */

export const photos = {
	hutanKanopi,
	hutanAerial,
	hutanJabar,
	aspekLembah,
	kanopiAerial,
	tanganSapling,
	tanamBersama,
	tanamSapar,
	semaiTeras,
	semaiGreenhouse,
	semaiInterior,
	ukurPohon,
	penelitianLapangan,
	komunitasKampung,
	gotongRoyongBudaya,
	musdesPerencanaan,
	rapatMasyarakat,
	rapatTradisi,
	sukarelawan,
	workshopLapangan,
	anakPohon,
	umkmTenun,
	petaniSawah,
} satisfies Record<string, ImageMetadata>;

export type PhotoKey = keyof typeof photos;

/**
 * Alt text card program, diseragamkan sebagai
 * "[Nama program] di [lokasi] — dokumentasi SKALA".
 * Dipakai bersama oleh /program, hero /program/[slug], dan card program di beranda.
 */
export const photoByProject: Record<string, { image: ImageMetadata; alt: string }> = {
	garut: {
		image: petaniSawah,
		alt: 'Konservasi dan Reboisasi Garut di Kabupaten Garut, Jawa Barat — dokumentasi SKALA',
	},
	'pln-kamojang-darajat': {
		image: workshopLapangan,
		alt: 'Program CSR PLN Indonesia Power UBP Kamojang u.p. PLTP Darajat di Kabupaten Garut, Jawa Barat — dokumentasi SKALA',
	},
	'pln-kamojang-ulubelu': {
		image: sukarelawan,
		alt: 'Program CSR PLN Indonesia Power UBP Kamojang u.p. PLTP Ulubelu di Tanggamus, Lampung — dokumentasi SKALA',
	},
	'social-mapping-darajat': {
		image: penelitianLapangan,
		alt: 'Pemetaan Sosial Desa Padaawas dan Karyamekar di Kabupaten Garut, Jawa Barat — dokumentasi SKALA',
	},
};

export const photoByPartner: Record<string, { image: ImageMetadata; alt: string }> = {
	'kth-mitra-garut': {
		image: hutanJabar,
		alt: 'Ilustrasi kawasan hutan di Jawa Barat',
	},
};
