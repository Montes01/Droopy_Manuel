import { redirect } from '@sveltejs/kit';
import { serverGet } from '#lib/api/server';
import type { SessionInfo } from '#lib/data/admin-types';
import type { LayoutServerLoad } from './$types';

/**
 * Guard del panel.
 *
 * Todo lo que cuelga de `/admin` exige sesión, salvo la pantalla de login. La
 * comprobación se hace en el servidor, así que quien no tenga sesión nunca
 * llega a ver el HTML del panel: se le redirige antes.
 *
 * Nota: durante el SSR las cookies del navegador no viajan solas, por eso se
 * usa `serverGet`, que reenvía la cabecera `Cookie` a la API.
 */
export const load: LayoutServerLoad = async ({ url, cookies }) => {
	// El login no necesita sesión, y exigirla aquí causaría un bucle.
	if (url.pathname === '/admin/login') {
		return { user: null };
	}

	const session = await serverGet<SessionInfo>('/api/auth/me', cookies);

	if (!session) {
		// Guarda a dónde iba, para volver allí después de entrar.
		const next = url.pathname + url.search;
		redirect(303, `/admin/login?next=${encodeURIComponent(next)}`);
	}

	return { user: session.user, source: session.source };
};
