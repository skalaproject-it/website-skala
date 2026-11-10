import type { APIRoute } from 'astro';
import { validatePartnership } from '../../data/partnership';

export const prerender = false;

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

const json = (ok: boolean, message: string, status: number, field?: string) =>
	new Response(JSON.stringify({ ok, message, field }), { status, headers: JSON_HEADERS });

export const POST: APIRoute = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json(false, 'Payload tidak valid.', 400);
	}

	const result = validatePartnership(body);
	if (result.error) return json(false, result.error, 400, result.field);
	const { name, email, phone, partner_type: partnerType, organization, project_interest: projectInterest, message } = result.data;

	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		return json(false, 'Formulir belum tersedia untuk pengiriman. Silakan kirim kebutuhan Anda ke office@skalapro.or.id.', 503);
	}

	const to = import.meta.env.CONTACT_EMAIL || 'office@skalapro.or.id';
	const from = import.meta.env.RESEND_FROM_EMAIL || 'Kemitraan SKALA <onboarding@resend.dev>';

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from,
				to: [to],
				reply_to: email,
				subject: `[Kemitraan] ${partnerType} — ${name}${organization ? ` (${organization})` : ''}`,
				text: [
					'Nama:', name,
					'Organisasi:', organization || '(tidak diisi)',
					'Email kontak:', email,
					'Telepon/WhatsApp:', phone || '(tidak diisi)',
					'Jenis kemitraan:', partnerType,
					'Lokasi/Program diminati:', projectInterest || '(tidak diisi)',
					'',
					'Pesan:',
					message || '(tidak diisi)',
				].join('\n'),
			}),
		});

		if (!res.ok) {
			return json(false, 'Gagal mengirim email. Coba lagi beberapa saat.', 502);
		}

		return json(true, 'Pesan terkirim. Tim SKALA akan menghubungi Anda.', 200);
	} catch {
		return json(false, 'Terjadi kesalahan koneksi. Coba lagi beberapa saat.', 500);
	}
};
