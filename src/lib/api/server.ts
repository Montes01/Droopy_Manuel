import type { Cookies } from '@sveltejs/kit';
import { ApiRequestError } from './client';

/**
 * Acceso a la API desde el servidor de SvelteKit (SSR).
 *
 * Durante el renderizado en servidor, `fetch` **no** lleva las cookies del
 * navegador: no hay `credentials: 'include'` que valga porque no hay navegador.
 * Por eso aquí reenviamos explícitamente la cabecera `Cookie` a la API.
 *
 * Los `load` y las `actions` que necesiten sesión deben usar `serverApi`; los
 * componentes del navegador siguen usando el cliente normal (`client.ts`).
 */

const FALLBACK_DEV_URL = 'http://localhost:3100';

function baseUrl(): string {
	const fromEnv = import.meta.env.PUBLIC_API_URL as string | undefined;
	return fromEnv && fromEnv.trim() !== '' ? fromEnv.replace(/\/+$/, '') : FALLBACK_DEV_URL;
}

/** Cabeceras para llamar a la API desde el servidor, con la sesión reenviada. */
function headersWith(cookies: Cookies, hasBody: boolean): Headers {
	const headers = new Headers({ Accept: 'application/json' });
	if (hasBody) headers.set('Content-Type', 'application/json');

	// Reenvía las cookies del navegador tal cual, incluida `dm_session`.
	const cookieHeader = cookies
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join('; ');
	if (cookieHeader) headers.set('Cookie', cookieHeader);

	return headers;
}

/** Extrae el cuerpo JSON, o `null` si venía vacío. */
function parseBody(raw: string): unknown {
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return raw;
	}
}

/**
 * Llama a la API desde el servidor y **lanza** si la respuesta no es 2xx.
 *
 * A diferencia de `serverGet`, aquí el error sí importa: una acción que no
 * pudo guardar debe decírselo a quien la usó, no fallar en silencio.
 */
async function serverRequest<T>(
	path: string,
	cookies: Cookies,
	method: string,
	body?: unknown
): Promise<T> {
	const hasBody = body !== undefined;

	let response: Response;
	try {
		response = await fetch(`${baseUrl()}${path}`, {
			method,
			headers: headersWith(cookies, hasBody),
			...(hasBody ? { body: JSON.stringify(body) } : {})
		});
	} catch {
		throw new ApiRequestError(path, 0, 'No se pudo conectar con el servidor.');
	}

	if (response.status === 204) return undefined as T;

	const parsed = parseBody(await response.text());

	if (!response.ok) {
		const message =
			parsed && typeof parsed === 'object' && 'message' in parsed
				? String((parsed as { message: unknown }).message)
				: `La API respondió ${response.status}.`;
		throw new ApiRequestError(path, response.status, message);
	}

	return parsed as T;
}

/**
 * Cliente de escritura para `load` y `actions`.
 *
 * Cada método reenvía la cookie de sesión, así que funciona en SSR y en las
 * acciones de formulario (que también corren en el servidor).
 */
export const serverApi = {
	get: <T>(path: string, cookies: Cookies) => serverRequest<T>(path, cookies, 'GET'),
	post: <T>(path: string, cookies: Cookies, body?: unknown) =>
		serverRequest<T>(path, cookies, 'POST', body),
	patch: <T>(path: string, cookies: Cookies, body: unknown) =>
		serverRequest<T>(path, cookies, 'PATCH', body),
	put: <T>(path: string, cookies: Cookies, body: unknown) =>
		serverRequest<T>(path, cookies, 'PUT', body),
	delete: <T>(path: string, cookies: Cookies) => serverRequest<T>(path, cookies, 'DELETE')
};

/**
 * GET tolerante: devuelve `null` ante 401 o 404.
 *
 * Para los `load` que preguntan «¿hay sesión?» o «¿existe esto?», donde un
 * «no» es una respuesta válida y no un error.
 */
export async function serverGet<T>(path: string, cookies: Cookies): Promise<T | null> {
	try {
		return await serverApi.get<T>(path, cookies);
	} catch (error) {
		if (error instanceof ApiRequestError && (error.status === 401 || error.status === 404)) {
			return null;
		}
		// Cualquier otro fallo (API caída, 500) tampoco debe romper el render.
		if (error instanceof ApiRequestError) return null;
		throw error;
	}
}
