import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { Order, OrderPage, OrderStatus, PaymentStatus } from '#lib/data/types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Pedidos.
 *
 * A diferencia del catálogo, aquí no se crea ni se borra nada: los pedidos los
 * genera la tienda y son un registro histórico. El panel los consulta y cambia
 * su estado (y el de pago).
 */

const ORDER_STATUSES: OrderStatus[] = [
	'pendiente',
	'confirmado',
	'enviado',
	'entregado',
	'cancelado'
];

const PAYMENT_STATUSES: PaymentStatus[] = ['sin-pago', 'en-revision', 'pagado', 'rechazado'];

export const load: PageServerLoad = async ({ cookies, url }) => {
	// Los filtros viven en la URL para que se puedan compartir y recargar.
	const status = url.searchParams.get('status') ?? '';
	const paymentStatus = url.searchParams.get('paymentStatus') ?? '';
	const q = url.searchParams.get('q') ?? '';

	const params = new URLSearchParams();
	if (status) params.set('status', status);
	if (paymentStatus) params.set('paymentStatus', paymentStatus);
	if (q) params.set('q', q);
	params.set('limit', '100');

	let page: OrderPage = { orders: [], total: 0 };
	try {
		page = await serverApi.get<OrderPage>(`/api/admin/orders?${params}`, cookies);
	} catch {
		// Si la API no responde, la lista sale vacía en vez de romperse.
	}

	return {
		orders: page.orders,
		total: page.total,
		filters: { status, paymentStatus, q },
		statuses: ORDER_STATUSES,
		paymentStatuses: PAYMENT_STATUSES
	};
};

function text(value: FormDataEntryValue | null): string | undefined {
	if (value === null) return undefined;
	const trimmed = String(value).trim();
	return trimmed === '' ? undefined : trimmed;
}

function actionError(error: unknown, fallback: string): string {
	if (error instanceof ApiRequestError) {
		if (error.status === 401) return 'Tu sesión caducó. Vuelve a entrar.';
		return error.message;
	}
	return fallback;
}

export const actions: Actions = {
	/**
	 * Cambia el estado y/o el estado de pago de un pedido.
	 *
	 * Se envía solo lo que cambió: el backend acepta uno o los dos campos.
	 */
	updateStatus: async ({ request, cookies }) => {
		const form = await request.formData();
		const orderNumber = text(form.get('orderNumber'));
		if (!orderNumber) return fail(400, { error: 'Falta el pedido.' });

		const status = text(form.get('status'));
		const paymentStatus = text(form.get('paymentStatus'));

		if (!status && !paymentStatus) {
			return fail(400, { error: 'No se envió ningún cambio.' });
		}

		if (status && !ORDER_STATUSES.includes(status as OrderStatus)) {
			return fail(400, { error: `Estado inválido: ${status}.` });
		}
		if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus as PaymentStatus)) {
			return fail(400, { error: `Estado de pago inválido: ${paymentStatus}.` });
		}

		try {
			await serverApi.patch<Order>(
				`/api/admin/orders/${encodeURIComponent(orderNumber)}`,
				cookies,
				{
					...(status ? { status } : {}),
					...(paymentStatus ? { paymentStatus } : {})
				}
			);
			return { success: true, message: `Pedido ${orderNumber} actualizado.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el pedido.') });
		}
	}
};
