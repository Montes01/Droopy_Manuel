import { products } from '#lib/data/shop';
import type { CartLine, Product } from '#lib/data/types';

const STORAGE_KEY = 'droopy-cart-v1';

/**
 * ¿Estamos en el navegador? Equivale a `browser` de `$app/environment` sin
 * depender de los tipos ambientales de Kit, que en v3 no exponen ese módulo.
 */
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/** Línea del carrito ya resuelta contra el catálogo, lista para pintar. */
export interface CartItem extends CartLine {
	product: Product;
	lineTotal: number;
}

/**
 * Carrito persistente de la tienda. Un único store global (rune basado en
 * clase) que sobrevive a la navegación y, en el cliente, a recargas gracias a
 * localStorage. Es agnóstico del backend: el día que exista una API real solo
 * hay que cambiar `load()` y `persist()`.
 */
class CartStore {
	lines = $state<CartLine[]>([]);

	/** Ligado a los cambios de `lines` para escribir en localStorage. */
	#ready = false;

	constructor() {
		if (isBrowser) {
			this.lines = this.#load();
			this.#ready = true;
			$effect.root(() => {
				$effect(() => {
					// Leer `lines` dentro del efecto lo vuelve dependencia.
					this.#persist(this.lines);
				});
			});
		}
	}

	/** Líneas resueltas contra el catálogo (ignora productos retirados). */
	get items(): CartItem[] {
		return this.lines
			.map((line) => {
				const product = products.find(
					(p) => p.slug === line.slug && p.category === line.category
				);
				if (!product) return null;
				return { ...line, product, lineTotal: product.price * line.quantity };
			})
			.filter((item): item is CartItem => item !== null);
	}

	get count(): number {
		return this.lines.reduce((total, line) => total + line.quantity, 0);
	}

	get subtotal(): number {
		return this.items.reduce((total, item) => total + item.lineTotal, 0);
	}

	get isEmpty(): boolean {
		return this.lines.length === 0;
	}

	/** Suma una unidad. Si ya existe la misma combinación, sube la cantidad. */
	add(product: Product, quantity = 1, size?: string) {
		const existing = this.lines.find(
			(line) => line.slug === product.slug && line.category === product.category && line.size === size
		);
		if (existing) {
			existing.quantity += quantity;
			return;
		}
		this.lines.push({ slug: product.slug, category: product.category, quantity, size });
	}

	remove(category: string, slug: string, size?: string) {
		this.lines = this.lines.filter(
			(line) => !(line.slug === slug && line.category === category && line.size === size)
		);
	}

	/** Fija la cantidad; 0 o menos elimina la línea. */
	setQuantity(category: string, slug: string, quantity: number, size?: string) {
		if (quantity <= 0) {
			this.remove(category, slug, size);
			return;
		}
		const line = this.lines.find(
			(l) => l.slug === slug && l.category === category && l.size === size
		);
		if (line) line.quantity = quantity;
	}

	clear() {
		this.lines = [];
	}

	#load(): CartLine[] {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
		} catch {
			// JSON corrupto o storage bloqueado: arrancamos vacío.
			return [];
		}
	}

	#persist(lines: CartLine[]) {
		if (!this.#ready) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
		} catch {
			// Cuota llena o modo privado: el carrito sigue en memoria.
		}
	}
}

export const cart = new CartStore();
