import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Variables de entorno explícitas (SvelteKit 3).
 *
 * Sin esta declaración, `$app/env/*` se genera vacío y el frontend
 * cae al fallback local aunque `.env` exista.
 */
export const variables = defineEnvVars({
	PUBLIC_API_URL: {
		public: true,
		static: true,
		description: 'URL base del backend (Droopy Manuel API)',
		schema: (value) => value?.trim() || 'http://localhost:3100'
	}
});
