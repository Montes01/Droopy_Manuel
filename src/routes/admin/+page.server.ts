import { redirect } from '@sveltejs/kit';
import { serverGet } from '#lib/api/server';
import type { Dog, NewsItem, OrderPage, ShopItem } from '#lib/data/admin-types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Resumen del panel.
 *
 * Los datos se piden **con la sesión del navegador reenviada** (`serverGet`),
 * porque los pedidos exigen autenticación y durante el SSR las cookies no
 * viajan solas.
 *
 * Cada contador es independiente: si uno falla, queda en `null` y la interfaz
 * muestra «—». Un panel que no carga porque un contador falló es peor que uno
 * al que le falta un número.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	const [dogs, featured, items, news, pending, paid, allOrders] = await Promise.all([
		serverGet<Dog[]>('/api/dogs', cookies),
		serverGet<Dog[]>('/api/dogs/featured', cookies),
		serverGet<ShopItem[]>('/api/shop/items', cookies),
		serverGet<NewsItem[]>('/api/news', cookies),
		serverGet<OrderPage>('/api/admin/orders?limit=1&status=pendiente', cookies),
		serverGet<OrderPage>('/api/admin/orders?limit=1&paymentStatus=pagado', cookies),
		serverGet<OrderPage>('/api/admin/orders?limit=1', cookies)
	]);

	return {
		counts: {
			dogs: dogs?.length ?? null,
			featured: featured?.length ?? null,
			items: items?.length ?? null,
			news: news?.length ?? null,
			orders: allOrders?.total ?? null,
			pendingOrders: pending?.total ?? null,
			paidOrders: paid?.total ?? null
		}
	};
};

/**
 * Acciones del panel.
 *
 * De momento solo cerrar sesión: borra la cookie local y avisa a la API para
 * que invalide la sesión en la base (así el token no sirve aunque alguien lo
 * hubiera copiado).
 */
export const actions: Actions = {
	logout: async ({ cookies, fetch }) => {
		const token = cookies.get('dm_session');

		if (token) {
			try {
				const base = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3100';
				await fetch(`${base}/api/auth/logout`, {
					method: 'POST',
					headers: { Cookie: `dm_session=${token}` }
				});
			} catch {
				// Si la API no responde, igual cerramos sesión localmente: es
				// preferible que la persona pueda salir.
			}
		}

		cookies.delete('dm_session', { path: '/' });
		redirect(303, '/admin/login');
	}
};
