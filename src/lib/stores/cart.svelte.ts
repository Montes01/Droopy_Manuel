import { getContext, setContext } from 'svelte';
import { cartLineKey, unitPriceCents, unitStock } from '#lib/data/format';
import type {
	CartLine,
	CartTotals,
	ShippingId,
	ShippingOption,
	ShopItem,
	ShopVariant
} from '#lib/data/types';

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
				line &&
				typeof line === 'object' &&
				line.item &&
				typeof line.quantity === 'number' &&
				'variant' in line
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
 *
 * Cada línea se identifica por `cartLineKey(slug, variantId)`: un mismo
 * producto con variantes distintas son líneas separadas.
 */
export class CartStore {
	lines = $state<CartLine[]>(loadLines());
	shipping = $state<ShippingId>(loadShipping());

	/**
	 * Opciones de entrega con sus costos, tal como las sirve la API.
	 * Las fija el layout al arrancar; hasta entonces no hay costo que mostrar.
	 */
	shippingOptions = $state<ShippingOption[]>([]);

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

	subtotalCents = $derived(
		this.lines.reduce(
			(sum, line) => sum + unitPriceCents(line.item, line.variant) * line.quantity,
			0
		)
	);

	/**
	 * Costo del envío elegido, tomado de las opciones de la API.
	 *
	 * No hay copia local del precio: si el backend cambia el costo, el carrito
	 * lo refleja sin tocar código. El pedido final lo recalcula el servidor.
	 */
	shippingCents = $derived(
		this.shippingOptions.find((option) => option.id === this.shipping)?.costCents ?? 0
	);

	totals = $derived<CartTotals>({
		subtotalCents: this.subtotalCents,
		shippingCents: this.shippingCents,
		totalCents: this.subtotalCents + this.shippingCents
	});

	/** Línea concreta por producto + variante. */
	lineFor(slug: string, variantId: string | null): CartLine | undefined {
		const key = cartLineKey(slug, variantId);
		return this.lines.find((line) => cartLineKey(line.item.slug, line.variant?.id ?? null) === key);
	}

	has(slug: string): boolean {
		return this.lines.some((line) => line.item.slug === slug);
	}

	quantityOf(slug: string, variantId: string | null = null): number {
		return this.lineFor(slug, variantId)?.quantity ?? 0;
	}

	/** Unidades ya en el carrito para un producto (sumando variantes). */
	totalQuantityOf(slug: string): number {
		return this.lines
			.filter((line) => line.item.slug === slug)
			.reduce((sum, line) => sum + line.quantity, 0);
	}

	add(item: ShopItem, variant: ShopVariant | null = null, quantity = 1) {
		const existing = this.lineFor(item.slug, variant?.id ?? null);
		if (existing) {
			existing.quantity = Math.min(existing.quantity + quantity, unitStock(item, variant));
		} else {
			this.lines.push({
				item,
				variant,
				quantity: Math.min(quantity, unitStock(item, variant))
			});
		}
	}

	setQuantity(slug: string, variantId: string | null, quantity: number) {
		const line = this.lineFor(slug, variantId);
		if (!line) return;
		if (quantity <= 0) {
			this.remove(slug, variantId);
			return;
		}
		line.quantity = Math.min(quantity, unitStock(line.item, line.variant));
	}

	remove(slug: string, variantId: string | null = null) {
		const key = cartLineKey(slug, variantId);
		this.lines = this.lines.filter(
			(line) => cartLineKey(line.item.slug, line.variant?.id ?? null) !== key
		);
	}

	clear() {
		this.lines = [];
		this.shipping = 'recogida';
	}

	setShipping(id: ShippingId) {
		this.shipping = id;
	}

	/** Publica las opciones de entrega que vienen de la API. */
	setShippingOptions(options: ShippingOption[]) {
		this.shippingOptions = options;
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
