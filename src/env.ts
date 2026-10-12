import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Variables de entorno explícitas (SvelteKit 3).
 *
 * `BLOB_READ_WRITE_TOKEN` es solo-servidor: Vite nunca lo pone en
 * `process.env` en dev, así que se declara aquí y se pasa explícito al SDK.
 */
export const variables = defineEnvVars({
	BLOB_READ_WRITE_TOKEN: {
		description: 'Token de Vercel Blob para subir imágenes (solo servidor)',
		schema: (value) => value?.trim().replace(/^["']|["']$/g, '') || undefined
	}
});
