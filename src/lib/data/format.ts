import type { Cents, ShopItem, ShopVariant } from './types';

/**
 * Utilidades de presentación y cálculo del frontend.
 *
 * Todo lo que vive aquí es puro y no depende del backend: formatear dinero y
 * resolver precio/stock de una variante. Los datos del catálogo vienen de la
 * API (`#lib/api/shop`), no de este módulo.
 */

/** Formatea centavos en pesos colombianos: 4500000 → "$45.000". */
export function formatCOP(cents: Cents): string {
	return '$' + Math.round(cents / 100).toLocaleString('es-CO');
}

/** Clave estable de una línea del carrito: producto + variante. */
export function cartLineKey(slug: string, variantId: string | null): string {
	return variantId ? `${slug}::${variantId}` : slug;
}

/** Precio efectivo de un producto según su variante (en centavos). */
export function unitPriceCents(item: ShopItem, variant: ShopVariant | null): Cents {
	return variant?.priceCents ?? item.priceCents;
}

/** Stock efectivo de un producto según su variante. */
export function unitStock(item: ShopItem, variant: ShopVariant | null): number {
	return variant ? variant.stock : item.stock;
}
