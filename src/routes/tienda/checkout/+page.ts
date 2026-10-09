import { getBankAccounts } from '#lib/api/site';

/**
 * Cuentas bancarias para el paso final de la compra.
 *
 * Las opciones de envío no se cargan aquí: las publica el layout, porque el
 * carrito también las necesita.
 */
export async function load() {
	const accounts = await getBankAccounts();
	return { accounts };
}
