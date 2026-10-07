import {
	SHIPPING_COST_CENTS,
	categoryBySlug,
	itemBySlug,
	itemsByCategory,
	shopCategories,
	shopItems,
	shippingOptions,
	type ShippingId
} from '#lib/data/shop';
import { cartLineKey, unitPriceCents } from '#lib/data/types';
import type {
	OrderPayload,
	OrderResult,
	ShopCategory,
	ShopItem
} from '#lib/data/types';

/**
 * Capa de acceso a datos de la tienda.
 *
 * Todo es asíncrono para que, cuando exista el backend, solo se cambie el
 * cuerpo de estas funciones por llamadas HTTP reales. Los componentes ya
 * consumen promesas a través de `load()`, sin cambios.
 *
 * Hoy resuelven el catálogo mock de `#lib/data/shop`.
 */

/** Simula latencia de red para que la UI se comporte como con un backend. */
function delay<T>(value: T): Promise<T> {
	return Promise.resolve(value);
}

export async function getCategories(): Promise<ShopCategory[]> {
	return delay(shopCategories);
}

export async function getCategory(slug: string): Promise<ShopCategory | null> {
	return delay(categoryBySlug(slug) ?? null);
}

/** Productos de una categoría, o todos si no se pasa slug. */
export async function getItems(categorySlug?: string): Promise<ShopItem[]> {
	return delay(categorySlug ? itemsByCategory(categorySlug) : shopItems);
}

export async function getItem(slug: string): Promise<ShopItem | null> {
	return delay(itemBySlug(slug) ?? null);
}

export async function getFeaturedItems(): Promise<ShopItem[]> {
	return delay(shopItems.filter((item) => item.featured));
}

export async function getShippingOptions() {
	return delay(shippingOptions);
}

/**
 * Crea el pedido. Hoy es mock: calcula los totales en el frontend y devuelve
 * un número de pedido. Cuando exista el backend, esto hará
 * `POST /orders` con `OrderPayload` y devolverá el `OrderResult` real.
 */
export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
	const lines = payload.lines.map((line) => {
		const item = itemBySlug(line.slug);
		const variant =
			item?.variants.find((entry) => entry.id === line.variantId) ?? null;
		const name = item
			? variant
				? `${item.name} · ${variant.label}`
				: item.name
			: line.slug;
		const unit = item ? unitPriceCents(item, variant) : 0;
		return {
			key: cartLineKey(line.slug, line.variantId),
			name,
			quantity: line.quantity,
			totalCents: unit * line.quantity
		};
	});

	const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);
	const shippingCents = payload.shipping === 'domicilio' ? SHIPPING_COST_CENTS : 0;
	const shippingLabel =
		shippingOptions.find((option) => option.id === payload.shipping)?.label ?? '';

	return delay({
		orderNumber: 'DM-' + Date.now().toString(36).toUpperCase().slice(-6),
		subtotalCents,
		shippingCents,
		totalCents: subtotalCents + shippingCents,
		lines: lines.map(({ name, quantity, totalCents }) => ({ name, quantity, totalCents })),
		shippingLabel
	});
}

export type { ShippingId };
