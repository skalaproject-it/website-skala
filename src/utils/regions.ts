/**
 * Pemetaan lokasi program ke koordinat geografis.
 *
 * Koordinat diambil dari field `geo` (WGS84) pada dataset
 * open-admin-data/indonesia-administrative-divisions (CC-BY-4.0), yaitu titik
 * pusat kabupaten|kota. Menambah lokasi program baru requires menambah entri
 * di bawah; `regionCoordinate` mengembalikan undefined untuk lokasi yang belum
 * dipetakan sehingga peta tetap ter-render tanpa marker.
 */

export interface RegionCoordinate {
	lat: number;
	lon: number;
}

/**
 * Kunci adalah nama kabupaten|kota tanpa prefiks jabatan, sudah lowercase.
 * Pencocokan menormalkan prefiks "Kabupaten"/"Kota", jadi "Kabupaten Garut" dan
 * "Tanggamus" sama-sama cocok dengan kunci `garut`.
 */
export const regionCoordinates: Record<string, RegionCoordinate> = {
	garut: { lat: -7.203, lon: 107.886 },
	tanggamus: { lat: -4.977, lon: 105.21 },
};

const OFFICE_PREFIX = /^(kabupaten|kota|kotamadya|administrasi)\s+/;

/** Kunci normalisasi nama kabupaten|kota: lowercase, spasi rapat, tanpa prefiks jabatan. */
export function locationKey(regency: string): string {
	return regency
		.trim()
		.toLowerCase()
		.replace(OFFICE_PREFIX, '')
		.replace(/\s+/g, ' ');
}

export function regionCoordinate(location: string): RegionCoordinate | undefined {
	return regionCoordinates[locationKey(splitLocation(location).regency)];
}

export interface SplitLocation {
	regency: string;
	province: string;
}

/**
 * "Kabupaten Garut, Jawa Barat" -> regency "Kabupaten Garut", province "Jawa Barat".
 * Lokasi tanpa koma diperlakukan seluruhnya sebagai nama wilayah.
 */
export function splitLocation(location: string): SplitLocation {
	const parts = location
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts.length === 0) return { regency: location.trim(), province: '' };
	if (parts.length === 1) return { regency: parts[0], province: '' };
	return { regency: parts.slice(0, -1).join(', '), province: parts[parts.length - 1] };
}
