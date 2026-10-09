/**
 * Tipos del panel de administración.
 *
 * Espejo de lo que devuelve la API en `/api/auth` y `/api/admin`. La fuente de
 * verdad está en `Server/src/types.ts`; si cambia allí, cámbialo aquí.
 */
import type {
	BankAccount,
	Dog,
	DonationTier,
	NewsItem,
	Order,
	OrderCustomer,
	OrderStatus,
	PaymentStatus,
	ShippingId,
	ShopCategory,
	ShopItem,
	ShopVariant,
	Testimonial
} from './types';

/** Persona con acceso al panel. */
export interface AdminUser {
	id: number;
	email: string;
	name: string;
	role: 'admin' | 'editor';
	active?: boolean;
	lastLoginAt?: string | null;
}

/** Respuesta de `GET /api/auth/me`. */
export interface SessionInfo {
	user: AdminUser;
	/** Cómo se autenticó: por sesión o por token de script. */
	source: 'session' | 'token';
}

/** Una sesión abierta, para que la persona pueda revisarlas. */
export interface AdminSessionInfo {
	id: number;
	createdAt: string;
	expiresAt: string;
	userAgent: string | null;
}

/** Entrada del registro de auditoría. */
export interface AuditEntry {
	id: number;
	userId: number | null;
	entity: string;
	entityKey: string;
	action: 'crear' | 'editar' | 'borrar';
	createdAt: string;
}

/** Listado paginado de pedidos. */
export interface OrderPage {
	orders: Order[];
	total: number;
}

/** Filtros que acepta el listado de pedidos. */
export interface OrderFilters {
	status?: OrderStatus | '';
	paymentStatus?: PaymentStatus | '';
	q?: string;
	limit?: number;
	offset?: number;
}

// ----------------------------------------------- Formularios de escritura

/**
 * Campos que acepta el panel al crear o editar.
 *
 * Todos opcionales porque al editar se envía solo lo que cambió; el backend
 * valida lo que reciba.
 */
export interface DogInput {
	slug?: string;
	name?: string;
	breed?: string;
	ageYears?: number;
	ageLabel?: string;
	sex?: Dog['sex'];
	size?: Dog['size'];
	energy?: Dog['energy'];
	goodWith?: Partial<Dog['goodWith']>;
	vaccinated?: boolean;
	sterilized?: boolean;
	status?: Dog['status'];
	arrival?: string;
	traits?: string[];
	story?: string;
	photo?: string | null;
	featured?: boolean;
	sortOrder?: number;
}

export interface ShopCategoryInput {
	slug?: string;
	name?: string;
	emoji?: string;
	blurb?: string;
	sortOrder?: number;
}

export interface ShopVariantInput {
	id?: string;
	label?: string;
	priceCents?: number | null;
	stock?: number;
	sku?: string | null;
}

export interface ShopItemInput {
	slug?: string;
	name?: string;
	category?: string;
	priceCents?: number;
	description?: string;
	details?: string;
	photo?: string | null;
	emoji?: string;
	tags?: string[];
	stock?: number;
	featured?: boolean;
	sortOrder?: number;
	variants?: ShopVariantInput[];
}

export interface NewsInput {
	slug?: string;
	title?: string;
	excerpt?: string;
	body?: string[];
	date?: string;
	category?: NewsItem['category'];
	tags?: string[];
	photo?: string | null;
	emoji?: string;
	featured?: boolean;
	relatedDogSlugs?: string[];
}

export interface ContactChannelInput {
	label?: string;
	icon?: string;
	href?: string;
	phoneNumber?: string | null;
	sortOrder?: number;
}

export interface DonationTierInput {
	stars?: number;
	name?: string;
	priceCents?: number;
	currency?: string;
	blurb?: string;
	perks?: string[];
	sortOrder?: number;
}

export interface TestimonialInput {
	name?: string;
	role?: string;
	quote?: string;
	dog?: string | null;
	sortOrder?: number;
}

export interface BankAccountInput {
	bank?: string;
	emoji?: string;
	method?: BankAccount['method'];
	holder?: string;
	fields?: { label: string; value: string; copyable?: boolean }[];
	sortOrder?: number;
}

/** Estadísticas del sitio que el panel puede editar. */
export interface SiteStatsInput {
	rescued: number;
	adopted: number;
	sterilized: number;
	inCare: number;
}

export type {
	BankAccount,
	Dog,
	DonationTier,
	NewsItem,
	Order,
	OrderCustomer,
	OrderStatus,
	PaymentStatus,
	ShippingId,
	ShopCategory,
	ShopItem,
	ShopVariant,
	Testimonial
};
