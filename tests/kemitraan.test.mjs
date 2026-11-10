import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let POST;
let outbound;
let provider;
const originalFetch = globalThis.fetch;
const valid = { name: ' Calon Mitra ', email: 'mitra@example.org', partner_type: 'CSR/TJSL', message: 'Pendampingan UMKM di Garut.', phone: '+62 812 0000 0000' };
const request = (body) => POST({ request: new Request('http://localhost/api/kemitraan', {
	method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}) });

before(async () => {
	server = await createServer({
		configFile: false, envFile: false, server: { middlewareMode: true, hmr: false },
		define: { 'import.meta.env.RESEND_API_KEY': JSON.stringify('test-only'), 'import.meta.env.CONTACT_EMAIL': JSON.stringify('office@example.org') },
	});
	({ POST } = await server.ssrLoadModule('/src/pages/api/kemitraan.ts'));
	// All provider requests are intercepted: these tests never send email.
	globalThis.fetch = async (url, options) => {
		assert.equal(url, 'https://api.resend.com/emails');
		outbound = JSON.parse(options.body);
		return provider();
	};
});
after(async () => { globalThis.fetch = originalFetch; await server?.close(); });

test('rejects malformed JSON and non-object payloads before sending email', async () => {
	outbound = undefined;
	for (const body of [null, [], 'text', 42]) assert.equal((await request(body)).status, 400);
	const res = await POST({ request: new Request('http://localhost/api/kemitraan', { method: 'POST', body: '{' }) });
	assert.equal(res.status, 400);
	assert.equal(outbound, undefined);
});

test('rejects missing fields, invalid email, unknown type, and oversized content', async () => {
	outbound = undefined;
	for (const [field, value] of [['name', '  '], ['email', 'invalid'], ['partner_type', 'Unknown'], ['message', ''], ['message', 'a'.repeat(4001)]]) {
		const res = await request({ ...valid, [field]: value });
		assert.equal(res.status, 400);
		assert.equal((await res.json()).field, field);
	}
	assert.equal(outbound, undefined);
});

test('sends normalized details and optional phone to SKALA with correct reply-to', async () => {
	provider = () => new Response(JSON.stringify({ id: 'mock-email-id' }), { status: 200 });
	const res = await request(valid);
	assert.equal(res.status, 200);
	assert.equal((await res.json()).ok, true);
	assert.equal(outbound.reply_to, valid.email);
	assert.deepEqual(outbound.to, ['office@example.org']);
	assert.match(outbound.text, /Nama:\nCalon Mitra\n/);
	assert.ok(outbound.text.includes(valid.phone));
	assert.ok(outbound.text.includes(valid.message));
});

test('allows initial discussion without organization, phone, or a location', async () => {
	provider = () => new Response('{}', { status: 200 });
	const { phone, ...minimal } = valid;
	assert.equal((await request({ ...minimal, partner_type: 'Perlu Diskusi' })).status, 200);
});

test('provider rejection is reported as failure, not success', async () => {
	provider = () => new Response('{}', { status: 422 });
	const res = await request(valid);
	assert.equal(res.status, 502);
	assert.equal((await res.json()).ok, false);
});

test('network failure returns a recoverable error', async () => {
	provider = () => { throw new Error('Simulated network failure'); };
	const res = await request(valid);
	assert.equal(res.status, 500);
	assert.equal((await res.json()).ok, false);
});
