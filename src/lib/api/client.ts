/**
 * Cliente HTTP base de la API de Droopy Manuel.
 *
 * La URL del backend se configura con `PUBLIC_API_URL`. Si no se define,
 * en desarrollo apuntamos al servidor local del backend.
 */

const FALLBACK_DEV_URL = 'http://localhost:3100';

function resolveBaseUrl(): string {
	const fromEnv = import.meta.env.PUBLIC_API_URL as string | undefined;

	if (fromEnv && fromEnv.trim() !== '') {
		return fromEnv.replace(/\/+$/, '');
	}

	// Sin variable de entorno, hablamos con el server local. En producción
	// conviene definir PUBLIC_API_URL (ver README).
	return FALLBACK_DEV_URL;
}

export const API_BASE_URL = resolveBaseUrl();

/** Error de API con el status HTTP y el mensaje que devolvió el servidor. */
export class ApiRequestError extends Error {
	readonly status: number;
	readonly path: string;

	constructor(path: string, status: number, message: string) {
		super(message);
		this.name = 'ApiRequestError';
		this.status = status;
		this.path = path;
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const url = `${API_BASE_URL}${path}`;

	let response: Response;
	try {
		response = await fetch(url, {
			...init,
			headers: {
				Accept: 'application/json',
				...(init?.body ? { 'Content-Type': 'application/json' } : {}),
				...init?.headers
			}
		});
	} catch {
		// Falla de red: el backend no está levantado o no es alcanzable.
		throw new ApiRequestError(
			path,
			0,
			`No se pudo conectar con la API en ${API_BASE_URL}. ¿Está el servidor encendido?`
		);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	const raw = await response.text();
	let body: unknown = null;
	if (raw) {
		try {
			body = JSON.parse(raw);
		} catch {
			body = raw;
		}
	}

	if (!response.ok) {
		const message =
			body && typeof body === 'object' && 'message' in body
				? String((body as { message: unknown }).message)
				: `La API respondió ${response.status}.`;
		throw new ApiRequestError(path, response.status, message);
	}

	return body as T;
}

/** GET que devuelve `null` ante un 404, en vez de lanzar. */
async function getOrNull<T>(path: string): Promise<T | null> {
	try {
		return await request<T>(path);
	} catch (error) {
		if (error instanceof ApiRequestError && error.status === 404) return null;
		throw error;
	}
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	getOrNull,
	post: <T>(path: string, body: unknown) =>
		request<T>(path, { method: 'POST', body: JSON.stringify(body) })
};
