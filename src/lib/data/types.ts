/**
 * Tipos del dominio, espejo del contrato del backend.
 *
 * La fuente de verdad es `Server/src/types.ts`. Si cambias algo allí,
 * actualiza también este archivo para que los componentes sigan tipados.
 */

export type Slug = string;
export type ISODate = string;
export type Cents = number;
export type PhotoPath = string | null;

// ---------------------------------------------------------------- Perritos

export type DogStatus = 'en-adopcion' | 'hogar-temporal' | 'adoptado' | 'en-memoria';
export type DogSize = 'pequeño' | 'mediano' | 'grande';
export type DogSex = 'macho' | 'hembra';
export type DogEnergy = 'tranquilo' | 'moderado' | 'juguetón';

export interface DogGoodWith {
	kids: boolean;
	dogs: boolean;
	cats: boolean;
}

export interface Dog {
	slug: Slug;
	name: string;
	breed: string;
	ageYears: number;
	ageLabel: string;
	sex: DogSex;
	size: DogSize;
	energy: DogEnergy;
	goodWith: DogGoodWith;
	vaccinated: boolean;
	sterilized: boolean;
	status: DogStatus;
	arrival: ISODate;
	traits: string[];
	story: string;
	/** Ruta en /static cuando haya foto real. Null = avatar con inicial. */
	photo: PhotoPath;
	featured?: boolean;
}

/** Vista de la manada: vivos o en el cielo. */
export type PackView = 'alive' | 'heaven';

/** Un perrito al que se puede dirigir una donación. */
export interface DonationTarget {
	dog: Dog;
	/** Meta de recaudación en centavos, si existe. */
	goalCents?: Cents;
}

// ------------------------------------------------------------------ Tienda

/** Categoría de la tienda solidaria. `slug` se usa en la ruta /tienda/[slug]. */
export interface ShopCategory {
	slug: Slug;
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
	priceCents?: Cents;
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
	slug: Slug;
	name: string;
	/** Slug de la categoría a la que pertenece. */
	category: Slug;
	/** Precio base en centavos. Las variantes pueden sobreescribirlo. */
	priceCents: Cents;
	/** Descripción corta para la tarjeta y el modal. */
	description: string;
	/** Detalles largos mostrados en el modal. */
	details: string;
	/** Ruta en /static cuando haya foto real. Null = holder ilustrado. */
	photo: PhotoPath;
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

export type ShippingId = 'recogida' | 'domicilio';

export interface ShippingOption {
	id: ShippingId;
	label: string;
	detail: string;
	costCents: Cents;
}

// ----------------------------------------------------------------- Pedidos

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
	slug: Slug;
	variantId: string | null;
	quantity: number;
}

/** Payload que el frontend envía a createOrder(). */
export interface OrderPayload {
	customer: OrderCustomer;
	lines: OrderLineInput[];
	shipping: ShippingId;
}

/** Una línea del pedido tal como quedó registrada. */
export interface OrderLineResult {
	name: string;
	quantity: number;
	totalCents: Cents;
}

/** Respuesta del backend al crear el pedido. */
export interface OrderResult {
	orderNumber: string;
	subtotalCents: Cents;
	shippingCents: Cents;
	totalCents: Cents;
	/** Resumen de líneas tal como quedaron registradas. */
	lines: OrderLineResult[];
	shippingLabel: string;
}

export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export type PaymentStatus = 'sin-pago' | 'en-revision' | 'pagado' | 'rechazado';

/** Pedido completo tal como vive en el servidor. */
export interface Order extends OrderResult {
	customer: OrderCustomer;
	shipping: ShippingId;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	createdAt: ISODate;
}

// ---------------------------------------------------------------- Noticias

/** Categoría de una noticia. `slug` para filtros, `label` para la UI. */
export type NewsCategory = 'rescate' | 'adopcion' | 'salud' | 'evento' | 'tienda';

/** Noticia de la fundación. `slug` se usa en la ruta /noticias/[slug]. */
export interface NewsItem {
	slug: Slug;
	title: string;
	/** Bajada corta para la tarjeta del feed. */
	excerpt: string;
	/** Historia completa en párrafos. */
	body: string[];
	/** Fecha ISO (YYYY-MM-DD). Ordena el feed: más reciente primero. */
	date: ISODate;
	category: NewsCategory;
	/** Etiquetas cortas para la tarjeta. */
	tags: string[];
	/** Ruta en /static cuando haya foto real. Null = portada ilustrada. */
	photo: PhotoPath;
	/** Emoji de respaldo mientras no hay foto real. */
	emoji: string;
	/** Slugs de perritos relacionados. */
	relatedDogSlugs: Slug[];
	featured?: boolean;
}

/** Página del feed de noticias para el scroll infinito. */
export interface NewsPage {
	items: NewsItem[];
	hasMore: boolean;
}

/** Categoría de noticia con su etiqueta visible. */
export interface NewsCategoryInfo {
	slug: NewsCategory;
	label: string;
	emoji: string;
}

// ------------------------------------------------------- Donaciones y sitio

/** Medio por el que se puede pagar: define la etiqueta del badge. */
export type PaymentMethod = 'transferencia' | 'billetera' | 'internacional';

/** Un dato de la cuenta. Solo `copyable` ofrece botón de copiar. */
export interface AccountField {
	label: string;
	value: string;
	copyable?: boolean;
}

/**
 * Cuenta bancaria para transferencias.
 *
 * `id` es interno: la web pública no lo usa, pero el panel lo necesita para
 * editar y borrar una cuenta concreta.
 */
export interface BankAccount {
	id?: number;
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
	priceCents: Cents;
	currency: string;
	blurb: string;
	perks: string[];
}

/**
 * Testimonio de adopción o voluntariado.
 *
 * `id` es interno: la web pública no lo usa, pero el panel lo necesita para
 * editar y borrar un testimonio concreto.
 */
export interface Testimonial {
	id?: number;
	name: string;
	role: string;
	quote: string;
	dog?: Slug;
}

export interface SiteStats {
	rescued: number;
	adopted: number;
	sterilized: number;
	inCare: number;
}

export interface SiteContent {
	aboutBlurb: string;
	stats: SiteStats;
}

/** Una red social o canal de contacto, con su icono. */
export interface ContactChannel {
	label: string;
	/** Icono en /static, ej. /icons/whatsapp.png */
	icon: string;
	href: string;
}

/**
 * Datos de contacto de la fundación. El número de WhatsApp viene del backend
 * para no repetirlo en plantillas, placeholders y enlaces.
 */
export interface SiteContact {
	/** Número internacional sin signos: 573226438857 */
	whatsappNumber: string;
	/** El mismo número para mostrar: 322 643 8857 */
	whatsappDisplay: string;
	/** Enlace listo para usar, sin texto. */
	whatsappUrl: string;
	email: string;
	socials: ContactChannel[];
}

// ------------------------------------------------------------- Carrito

/** Línea del carrito: producto + variante opcional + cantidad elegida. */
export interface CartLine {
	item: ShopItem;
	/** Variante elegida, o null si el producto es simple. */
	variant: ShopVariant | null;
	quantity: number;
}

/** Resumen de totales de la compra. Todos los valores en centavos. */
export interface CartTotals {
	subtotalCents: Cents;
	shippingCents: Cents;
	totalCents: Cents;
}
