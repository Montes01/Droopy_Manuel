import { getShippingOptions } from '#lib/api/shop';
import { getSiteContact } from '#lib/api/site';

/**
 * Datos que necesita toda la app: contacto (WhatsApp, redes) y las opciones
 * de entrega con sus costos.
 *
 * Se cargan una sola vez aquí y el layout los publica en contexto, para que
 * ninguna plantilla repita el número de WhatsApp ni el precio del envío.
 */
export async function load() {
	const [contact, shippingOptions] = await Promise.all([
		getSiteContact(),
		getShippingOptions()
	]);

	return { contact, shippingOptions };
}
