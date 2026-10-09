import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { loginForServer } from '#lib/api/admin';
import type { Actions, PageServerLoad } from './$types';

/** El panel no tiene sentido si ya hay sesión: se entra directo. */
export const load: PageServerLoad = async ({ url }) => {
	return { next: url.searchParams.get('next') ?? '/admin' };
};

/** Una semana, igual que la vida de la sesión en la API. */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const next = String(form.get('next') ?? '/admin');

		if (!email || !password) {
			return fail(400, { email, error: 'Escribe tu correo y tu contraseña.' });
		}

		let result;
		try {
			result = await loginForServer(email, password);
		} catch (error) {
			if (error instanceof ApiRequestError && error.status === 0) {
				return fail(503, {
					email,
					error: 'No pudimos conectar con el servidor. Inténtalo de nuevo.'
				});
			}
			throw error;
		}

		if (!result) {
			return fail(401, { email, error: 'Correo o contraseña incorrectos.' });
		}

		// El token ya venía en la cabecera de la API; aquí se pone la cookie en
		// la respuesta al navegador, que es lo que mantiene la sesión.
		cookies.set('dm_session', result.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});

		// Solo rutas internas del panel: evita redirecciones abiertas.
		const safeNext = next.startsWith('/admin') ? next : '/admin';
		redirect(303, safeNext);
	}
};
