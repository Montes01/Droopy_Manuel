export type DogStatus = 'en-adopcion' | 'hogar-temporal' | 'adoptado' | 'en-memoria';

export type DogSize = 'pequeño' | 'mediano' | 'grande';

export interface Dog {
	slug: string;
	name: string;
	breed: string;
	ageYears: number;
	ageLabel: string;
	sex: 'macho' | 'hembra';
	size: DogSize;
	energy: 'tranquilo' | 'moderado' | 'juguetón';
	goodWith: { kids: boolean; dogs: boolean; cats: boolean };
	vaccinated: boolean;
	sterilized: boolean;
	status: DogStatus;
	arrival: string;
	traits: string[];
	story: string;
	/** Ruta en /static cuando haya foto real. Null = avatar con inicial. */
	photo: string | null;
	featured?: boolean;
}

/** Medio por el que se puede pagar: define la etiqueta del badge. */
export type PaymentMethod = 'transferencia' | 'billetera' | 'internacional';

/** Un dato de la cuenta. Solo `copyable` ofrece botón de copiar. */
export interface AccountField {
	label: string;
	value: string;
	copyable?: boolean;
}

export interface BankAccount {
	bank: string;
	emoji: string;
	method: PaymentMethod;
	holder: string;
	/** El campo con `copyable` es el que la persona transcribe al transferir. */
	fields: AccountField[];
}

export interface DonationTier {
	stars: number;
	name: string;
	price: number;
	currency: string;
	blurb: string;
	perks: string[];
}

export interface Testimonial {
	name: string;
	role: string;
	quote: string;
	dog?: string;
}

export interface SiteStats {
	rescued: number;
	adopted: number;
	sterilized: number;
	inCare: number;
}

/** Categoría de la tienda solidaria. `slug` se usa en la ruta /tienda/[slug]. */
export interface ShopCategory {
	slug: string;
	name: string;
	emoji: string;
	blurb: string;
}

/**
 * Variante de un producto (talla, color…). Si un producto no tiene
 * variantes, su stock vive directo en `ShopItem.stock`.
 */
export interface ShopVariant {
	/** Identificador único dentro del producto. */
	id: string;
	/** Etiqueta visible, ej. "Talla M" o "Rojo". */
	label: string;
	/** Precio propio en centavos. Si falta, usa el del producto. */
	priceCents?: number;
	/** Unidades disponibles. 0 = agotado. */
	stock: number;
	/** Código de referencia opcional. */
	sku?: string;
}

/**
 * Producto de la tienda. Precios en centavos de COP (entero), nunca
 * decimales: 4500000 === $45.000. Así el dinero se suma sin errores.
 */
export interface ShopItem {
	slug: string;
	name: string;
	/** Slug de la categoría a la que pertenece. */
	category: string;
	/** Precio base en centavos. Las variantes pueden sobreescribirlo. */
	priceCents: number;
	/** Descripción corta para la tarjeta y el modal. */
	description: string;
	/** Detalles largos mostrados en el modal. */
	details: string;
	/** Ruta en /static cuando haya foto real. Null = holder ilustrado. */
	photo: string | null;
	/** Emoji de respaldo mientras no hay foto real. */
	emoji: string;
	/** Etiquetas rápidas (material, presentación, etc.). */
	tags: string[];
	/** Variantes (talla, color…). Lista vacía = producto simple. */
	variants: ShopVariant[];
	/** Unidades disponibles cuando no hay variantes. */
	stock: number;
	featured?: boolean;
}

/** Clave estable de una línea del carrito: producto + variante. */
export function cartLineKey(slug: string, variantId: string | null): string {
	return variantId ? `${slug}::${variantId}` : slug;
}

/** Precio efectivo de un producto según su variante (en centavos). */
export function unitPriceCents(item: ShopItem, variant: ShopVariant | null): number {
	return variant?.priceCents ?? item.priceCents;
}

/** Stock efectivo de un producto según su variante. */
export function unitStock(item: ShopItem, variant: ShopVariant | null): number {
	return variant ? variant.stock : item.stock;
}

/** Línea del carrito: producto + variante opcional + cantidad elegida. */
export interface CartLine {
	item: ShopItem;
	/** Variante elegida, o null si el producto es simple. */
	variant: ShopVariant | null;
	quantity: number;
}

/** Resumen de totales de la compra. Todos los valores en centavos. */
export interface CartTotals {
	subtotalCents: number;
	shippingCents: number;
	totalCents: number;
}

/** Datos del comprador para el pedido. */
export interface OrderCustomer {
	nombres: string;
	apellidos: string;
	pais: string;
	direccion: string;
	ciudad: string;
	telefono: string;
	email: string;
	notas?: string;
}

/** Línea enviada al backend al crear el pedido. */
export interface OrderLineInput {
	slug: string;
	variantId: string | null;
	quantity: number;
}

/** Payload que el frontend enviará a createOrder(). */
export interface OrderPayload {
	customer: OrderCustomer;
	lines: OrderLineInput[];
	shipping: 'recogida' | 'domicilio';
}

/** Respuesta del backend al crear el pedido. */
export interface OrderResult {
	orderNumber: string;
	subtotalCents: number;
	shippingCents: number;
	totalCents: number;
	/** Resumen de líneas tal como quedaron registradas. */
	lines: { name: string; quantity: number; totalCents: number }[];
	shippingLabel: string;
}
