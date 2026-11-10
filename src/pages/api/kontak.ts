import type { APIRoute } from 'astro';

export const prerender = false;

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

const json = (ok: boolean, message: string, status: number) =>
	new Response(JSON.stringify({ ok, message }), { status, headers: JSON_HEADERS });

export const POST: APIRoute = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json(false, 'Payload tidak valid.', 400);
	}

	const field = (key: string) => (typeof body[key] === 'string' ? (body[key] as string).trim() : '');

	const name = field('name');
	const email = field('email');
	const subject = field('subject');
	const message = field('message');

	if (!name || !email || !message) {
		return json(false, 'Lengkapi nama, email, dan pesan Anda.', 400);
	}

	const apiKey = import.meta.env.RESEND_API_KEY;
	if (!apiKey) {
		return json(false, 'Server belum dikonfigurasi untuk mengirim email.', 500);
	}

	const to = import.meta.env.CONTACT_EMAIL || 'office@skalapro.or.id';
	const from = import.meta.env.RESEND_FROM_EMAIL || 'Kontak SKALA <onboarding@resend.dev>';

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
				subject: `[Kontak] ${subject || 'Pesan umum'} — ${name}`,
				text: [
					'Nama:', name,
					'Email kontak:', email,
					'Subjek:', subject || '(tidak diisi)',
					'',
					'Pesan:',
					message,
				].join('\n'),
			}),
		});

		if (!res.ok) {
			return json(false, 'Gagal mengirim email. Coba lagi beberapa saat.', 502);
		}

		return json(true, 'Pesan terkirim. Kami akan membalas sesegera mungkin.', 200);
	} catch {
		return json(false, 'Terjadi kesalahan koneksi. Coba lagi beberapa saat.', 500);
	}
};