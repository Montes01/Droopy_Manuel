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

/** Slug de una categoría de la tienda. Define la URL /tienda/[categoria]. */
export type ShopCategorySlug =
	| 'camisetas'
	| 'gorras'
	| 'juguetes'
	| 'libros'
	| 'llaveros'
	| 'mugs';

export interface ShopCategory {
	slug: ShopCategorySlug;
	name: string;
	emoji: string;
	blurb: string;
}

export interface Product {
	/** Único dentro de su categoría. Define ?articulo= en la URL. */
	slug: string;
	category: ShopCategorySlug;
	name: string;
	price: number;
	/** COP por defecto. */
	currency: string;
	/** Texto corto para la tarjeta. */
	tagline: string;
	description: string;
	/** Ruta en /static cuando haya foto real. Null = avatar con inicial. */
	photo: string | null;
	stock: number;
	sizes?: string[];
}

/** Una línea del carrito: producto + cantidad + talla elegida. */
export interface CartLine {
	slug: string;
	category: ShopCategorySlug;
	quantity: number;
	size?: string;
}

/** Opción de envío. Define subtotal de envío y total del pedido. */
export interface ShippingOption {
	id: string;
	label: string;
	detail: string;
	price: number;
}

export interface CheckoutForm {
	firstName: string;
	lastName: string;
	country: string;
	address: string;
	city: string;
	phone: string;
	email: string;
	notes: string;
}
