import { getContext, setContext } from 'svelte';
import type { CartLine, CartTotals, ShopItem } from '#lib/data/types';
import { SHIPPING_COST, type ShippingId } from '#lib/data/shop';

const STORAGE_KEY = 'droopy-cart';
const SHIPPING_KEY = 'droopy-cart-shipping';

function loadLines(): CartLine[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(line): line is CartLine =>
				line && typeof line === 'object' && line.item && typeof line.quantity === 'number'
		);
	} catch {
		return [];
	}
}

function loadShipping(): ShippingId {
	if (typeof localStorage === 'undefined') return 'recogida';
	const value = localStorage.getItem(SHIPPING_KEY);
	return value === 'domicilio' ? 'domicilio' : 'recogida';
}

/**
 * Carrito reactivo con runes. Se instala una sola vez en el layout y se
 * comparte con el resto del árbol mediante el contexto de Svelte.
 */
export class CartStore {
	lines = $state<CartLine[]>(loadLines());
	shipping = $state<ShippingId>(loadShipping());

	constructor() {
		// Persistencia simple: cada cambio se refleja en localStorage.
		$effect.root(() => {
			$effect(() => {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines));
			});
			$effect(() => {
				localStorage.setItem(SHIPPING_KEY, this.shipping);
			});
		});
	}

	count = $derived(this.lines.reduce((sum, line) => sum + line.quantity, 0));

	subtotal = $derived(
		this.lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0)
	);

	shippingCost = $derived(this.shipping === 'domicilio' ? SHIPPING_COST : 0);

	totals = $derived<CartTotals>({
		subtotal: this.subtotal,
		shipping: this.shippingCost,
		total: this.subtotal + this.shippingCost
	});

	has(slug: string): boolean {
		return this.lines.some((line) => line.item.slug === slug);
	}

	quantityOf(slug: string): number {
		return this.lines.find((line) => line.item.slug === slug)?.quantity ?? 0;
	}

	add(item: ShopItem, quantity = 1) {
		const existing = this.lines.find((line) => line.item.slug === item.slug);
		if (existing) {
			existing.quantity += quantity;
		} else {
			this.lines.push({ item, quantity });
		}
	}

	setQuantity(slug: string, quantity: number) {
		const line = this.lines.find((entry) => entry.item.slug === slug);
		if (!line) return;
		if (quantity <= 0) {
			this.remove(slug);
			return;
		}
		line.quantity = quantity;
	}

	remove(slug: string) {
		this.lines = this.lines.filter((line) => line.item.slug !== slug);
	}

	clear() {
		this.lines = [];
		this.shipping = 'recogida';
	}

	setShipping(id: ShippingId) {
		this.shipping = id;
	}
}

const CART_KEY = Symbol('cart');

/** Crea el carrito y lo publica en el contexto. Llamar una vez en el layout. */
export function initCart(): CartStore {
	return setContext(CART_KEY, new CartStore());
}

/** Recupera el carrito desde cualquier componente hijo. */
export function useCart(): CartStore {
	const cart = getContext<CartStore>(CART_KEY);
	if (!cart) {
		throw new Error('useCart() requiere que initCart() se haya llamado antes en un layout.');
	}
	return cart;
}
