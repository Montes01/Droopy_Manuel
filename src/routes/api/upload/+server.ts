import { del, put } from '@vercel/blob';
import { error, json } from '@sveltejs/kit';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
import { serverGet } from '#lib/api/server';
import type { RequestHandler } from './$types';

/**
 * Subida de imágenes del panel a Vercel Blob.
 *
 * Solo sesión válida (cookie `dm_session` reenviada a la API). Devuelve
 * `{ url }` pública, que el formulario guarda como `photo` igual que antes.
 * El backend no cambia: sigue recibiendo un string.
 */

/** Tope del cuerpo en serverless de Vercel (hobby: 4.5 MB). */
const MAX_BYTES = 4 * 1024 * 1024;

const FOLDERS = new Set(['manada', 'tienda', 'noticias']);

function slugify(filename: string): string {
	const dot = filename.lastIndexOf('.');
	const base = (dot > 0 ? filename.slice(0, dot) : filename)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	const ext = dot > 0 ? filename.slice(dot).toLowerCase() : '';
	return `${base || 'imagen'}${ext}`;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const me = await serverGet<unknown>('/api/auth/me', cookies);
	if (!me) throw error(401, 'Necesitas iniciar sesión.');

	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) throw error(400, 'Sin archivo.');
	if (!file.type.startsWith('image/')) throw error(400, 'Solo se permiten imágenes.');
	if (file.size > MAX_BYTES) throw error(413, 'Máximo 4 MB por imagen.');

	const folderRaw = form.get('folder');
	const folder =
		typeof folderRaw === 'string' && FOLDERS.has(folderRaw) ? folderRaw : 'admin';

	let url: string;
	try {
		if (!BLOB_READ_WRITE_TOKEN) {
			throw error(
				500,
				'Falta BLOB_READ_WRITE_TOKEN en el servidor (Front/.env en local, dashboard en Vercel).'
			);
		}
		const blob = await put(`admin/${folder}/${slugify(file.name)}`, file, {
			access: 'public',
			addRandomSuffix: true,
			token: BLOB_READ_WRITE_TOKEN
		});
		url = blob.url;

		// Limpieza best-effort del blob reemplazado. Solo URLs de nuestro
		// store; jamás rutas locales o externas. Si falla, la subida igual vale.
		const previousRaw = form.get('previousUrl');
		if (typeof previousRaw === 'string' && previousRaw !== url) {
			try {
				if (new URL(previousRaw).hostname.endsWith('.blob.vercel-storage.com')) {
					await del(previousRaw, { token: BLOB_READ_WRITE_TOKEN });
				}
			} catch {
				// huérfano: se puede purgar luego desde el dashboard
			}
		}
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		const detail =
			err instanceof Error ? err.message.replace(/^Vercel Blob:\s*/, '') : String(err);
		throw error(502, `Blob rechazó la subida: ${detail.slice(0, 160)}`);
	}

	return json({ url });
};
