import type { Cookies } from '@sveltejs/kit';

/**
 * Acceso a la API desde el servidor de SvelteKit (SSR).
 *
 * Durante el renderizado en servidor, `fetch` **no** lleva las cookies del
 * navegador: no hay `credentials: 'include'` que valga porque no hay navegador.
 * Por eso aquí reenviamos explícitamente la cabecera `Cookie` a la API.
 *
 * El cliente del navegador (`client.ts`) sigue siendo el que usan los
 * componentes; esto es solo para los `load` que corren en servidor.
 */

const FALLBACK_DEV_URL = 'http://localhost:3100';

function baseUrl(): string {
	const fromEnv = import.meta.env.PUBLIC_API_URL as string | undefined;
	return fromEnv && fromEnv.trim() !== '' ? fromEnv.replace(/\/+$/, '') : FALLBACK_DEV_URL;
}

/** Cabeceras mínimas para llamar a la API desde el servidor. */
function headersWith(cookies: Cookies, extra?: Record<string, string>): Headers {
	const headers = new Headers({ Accept: 'application/json' });
	for (const [name, value] of Object.entries(extra ?? {})) headers.set(name, value);

	// Reenvía las cookies del navegador tal cual, incluida `dm_session`.
	const cookieHeader = cookies
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ');
	if (cookieHeader) headers.set('Cookie', cookieHeader);

	return headers;
}

/**
 * GET desde el servidor, reenviando la sesión.
 *
 * Devuelve `null` ante 401 o 404: los `load` preguntan «¿hay sesión?» y no
 * quieren que eso sea una excepción.
 */
export async function serverGet<T>(
	path: string,
	cookies: Cookies
): Promise<T | null> {
	let response: Response;
	try {
		response = await fetch(`${baseUrl()}${path}`, { headers: headersWith(cookies) });
	} catch {
		// La API no responde: mejor tratarlo como «sin datos» que romper el render.
		return null;
	}

	if (response.status === 401 || response.status === 404) return null;
	if (!response.ok) return null;

	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text) as T;
	} catch {
		return null;
	}
}
