import type { Cents, ISODate, ShopItem, ShopVariant } from './types';

/**
 * Utilidades de presentación y cálculo del frontend.
 *
 * Todo lo que vive aquí es puro y no depende del backend: formatear dinero y
 * resolver precio/stock de una variante. Los datos del catálogo vienen de la
 * API (`#lib/api/shop`), no de este módulo.
 */

/** Formatea la edad de un perro a partir de su fecha de nacimiento y bandera approx. */
export function formatDogAge(birthDate: ISODate | null, isApprox: boolean): string {
	if (!birthDate) return 'Desconocida';
	const today = new Date();
	const birth = new Date(birthDate);
	const years = today.getFullYear() - birth.getFullYear();
	const months = today.getMonth() - birth.getMonth();
	const totalMonths = years * 12 + months;
	if (totalMonths < 0) return 'Por confirmar';
	if (isApprox) {
		if (totalMonths < 12) return `${totalMonths} mes${totalMonths !== 1 ? 'es' : 'e'} (aprox.)`;
		const y = Math.floor(totalMonths / 12);
		const m = totalMonths % 12;
		if (m === 0) return `${y} año${y !== 1 ? 's' : ''} (aprox.)`;
		return `${y} año${y !== 1 ? 's' : ''} y ${m} mes${m !== 1 ? 'es' : ''} (aprox.)`;
	}
	// isApprox === false: fecha conocida, mostrar normal
	if (totalMonths < 12) return `${totalMonths} mes${totalMonths !== 1 ? 'es' : 'e'}`;
	const y = Math.floor(totalMonths / 12);
	const m = totalMonths % 12;
	if (m === 0) return `${y} año${y !== 1 ? 's' : ''}`;
	if (y === 0) return `${m} mes${m !== 1 ? 'es' : 'e'}`;
	return `${y} año${y !== 1 ? 's' : ''} y ${m} mes${m !== 1 ? 'es' : ''}`;
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
