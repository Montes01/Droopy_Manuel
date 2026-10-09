import type {
	OrderPayload,
	OrderResult,
	ShippingId,
	ShippingOption,
	ShopCategory,
	ShopItem
} from '#lib/data/types';
import { api } from './client';

/**
 * Capa de acceso a datos de la tienda.
 *
 * Todas las funciones hablan con el backend. Los precios y totales del pedido
 * los calcula el servidor: el frontend solo manda slugs, variantes y cantidades.
 */

export async function getCategories(): Promise<ShopCategory[]> {
	return api.get<ShopCategory[]>('/api/shop/categories');
}

export async function getCategory(slug: string): Promise<ShopCategory | null> {
	return api.getOrNull<ShopCategory>(`/api/shop/categories/${encodeURIComponent(slug)}`);
}

/** Productos de una categoría, o todos si no se pasa slug. */
export async function getItems(categorySlug?: string): Promise<ShopItem[]> {
	const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : '';
	return api.get<ShopItem[]>(`/api/shop/items${query}`);
}

export async function getItem(slug: string): Promise<ShopItem | null> {
	return api.getOrNull<ShopItem>(`/api/shop/items/${encodeURIComponent(slug)}`);
}

export async function getFeaturedItems(): Promise<ShopItem[]> {
	return api.get<ShopItem[]>('/api/shop/items/featured');
}

export async function getShippingOptions(): Promise<ShippingOption[]> {
	return api.get<ShippingOption[]>('/api/shop/shipping');
}

/**
 * Crea el pedido en el backend.
 *
 * El servidor recalcula precios, envío y totales a partir de su catálogo, y
 * valida stock y variantes. Devuelve el `OrderResult` real.
 */
export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
	return api.post<OrderResult>('/api/orders', payload);
}

export type { ShippingId };