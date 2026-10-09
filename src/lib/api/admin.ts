import { API_BASE_URL, ApiRequestError, api } from './client';
import type {
	AdminSessionInfo,
	AuditEntry,
	BankAccount,
	BankAccountInput,
	ContactChannelInput,
	Dog,
	DogInput,
	DonationTier,
	DonationTierInput,
	NewsInput,
	NewsItem,
	Order,
	OrderFilters,
	OrderPage,
	SessionInfo,
	ShopCategory,
	ShopCategoryInput,
	ShopItem,
	ShopItemInput,
	SiteStatsInput,
	Testimonial,
	TestimonialInput
} from '#lib/data/admin-types';

/**
 * Capa de acceso al panel de administración.
 *
 * Todo exige sesión (cookie `dm_session`), que el cliente HTTP ya envía con
 * `credentials: 'include'`. Si la sesión caduca, la API responde 401 y el
 * `ApiRequestError` llega con `status: 401` para que la interfaz reaccione.
 */

// ------------------------------------------------------------------ Sesión

export async function login(email: string, password: string): Promise<SessionInfo> {
	return api.post<SessionInfo>('/api/auth/login', { email, password });
}

/**
 * Inicia sesión desde el servidor y devuelve el token de sesión.
 *
 * El `login()` normal descarta las cabeceras, pero una acción de SvelteKit
 * necesita el token para poner la cookie en la respuesta al navegador: durante
 * el SSR la cookie de la API no llega sola.
 *
 * Devuelve `null` si las credenciales son incorrectas.
 */
export async function loginForServer(
	email: string,
	password: string
): Promise<{ session: SessionInfo; token: string } | null> {
	const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		body: JSON.stringify({ email, password })
	});

	if (response.status === 401) return null;
	if (!response.ok) {
		throw new ApiRequestError('/api/auth/login', response.status, 'No se pudo iniciar sesión.');
	}

	const session = (await response.json()) as SessionInfo;

	// El token viene en Set-Cookie: dm_session=...
	const cookieHeader = response.headers.getSetCookie?.() ?? [];
	const token = cookieHeader
		.map((entry) => entry.split(';')[0] ?? '')
		.find((pair) => pair.startsWith('dm_session='))
		?.slice('dm_session='.length);

	if (!token) {
		throw new ApiRequestError(
			'/api/auth/login',
			500,
			'El servidor no devolvió la cookie de sesión.'
		);
	}

	return { session, token };
}

export async function logout(): Promise<void> {
	await api.post('/api/auth/logout');
}

/**
 * Quién soy.
 *
 * Devuelve `null` si no hay sesión (401), en vez de lanzar: el guard de rutas
 * necesita preguntar sin que sea un error.
 */
export async function getSession(): Promise<SessionInfo | null> {
	try {
		return await api.get<SessionInfo>('/api/auth/me');
	} catch (error) {
		if (error instanceof Error && 'status' in error && error.status === 401) return null;
		throw error;
	}
}

export async function getSessions(): Promise<AdminSessionInfo[]> {
	const result = await api.get<{ sessions: AdminSessionInfo[] }>('/api/auth/sessions');
	return result.sessions;
}

export async function getAudit(): Promise<AuditEntry[]> {
	const result = await api.get<{ entries: AuditEntry[] }>('/api/auth/audit');
	return result.entries;
}

// ------------------------------------------------------------------ Manada

export async function createDog(input: DogInput): Promise<Dog> {
	return api.post<Dog>('/api/admin/dogs', input);
}

export async function updateDog(slug: string, input: DogInput): Promise<Dog> {
	return api.patch<Dog>(`/api/admin/dogs/${encodeURIComponent(slug)}`, input);
}

export async function deleteDog(slug: string): Promise<void> {
	await api.delete(`/api/admin/dogs/${encodeURIComponent(slug)}`);
}

export async function reorderDogs(slugs: string[]): Promise<Dog[]> {
	return api.put<Dog[]>('/api/admin/dogs/order', { slugs });
}

// ------------------------------------------------------------------ Tienda

export async function createCategory(input: ShopCategoryInput): Promise<ShopCategory> {
	return api.post<ShopCategory>('/api/admin/shop/categories', input);
}

export async function updateCategory(
	slug: string,
	input: ShopCategoryInput
): Promise<ShopCategory> {
	return api.patch<ShopCategory>(`/api/admin/shop/categories/${encodeURIComponent(slug)}`, input);
}

export async function deleteCategory(slug: string): Promise<void> {
	await api.delete(`/api/admin/shop/categories/${encodeURIComponent(slug)}`);
}

export async function createItem(input: ShopItemInput): Promise<ShopItem> {
	return api.post<ShopItem>('/api/admin/shop/items', input);
}

export async function updateItem(slug: string, input: ShopItemInput): Promise<ShopItem> {
	return api.patch<ShopItem>(`/api/admin/shop/items/${encodeURIComponent(slug)}`, input);
}

export async function deleteItem(slug: string): Promise<void> {
	await api.delete(`/api/admin/shop/items/${encodeURIComponent(slug)}`);
}

/** Ajusta el stock de una variante (o del producto si `variantId` es null). */
export async function setStock(
	slug: string,
	variantId: string | null,
	stock: number
): Promise<ShopItem> {
	return api.patch<ShopItem>(`/api/admin/shop/items/${encodeURIComponent(slug)}/stock`, {
		variantId,
		stock
	});
}

// ---------------------------------------------------------------- Noticias

export async function createNews(input: NewsInput): Promise<NewsItem> {
	return api.post<NewsItem>('/api/admin/news', input);
}

export async function updateNews(slug: string, input: NewsInput): Promise<NewsItem> {
	return api.patch<NewsItem>(`/api/admin/news/${encodeURIComponent(slug)}`, input);
}

export async function deleteNews(slug: string): Promise<void> {
	await api.delete(`/api/admin/news/${encodeURIComponent(slug)}`);
}

// ------------------------------------------------- Contenido del sitio

export async function setSetting(key: string, value: unknown): Promise<void> {
	await api.put(`/api/admin/site/settings/${encodeURIComponent(key)}`, { value });
}

export async function setStats(stats: SiteStatsInput): Promise<void> {
	await setSetting('stats', stats);
}

export async function setAboutBlurb(text: string): Promise<void> {
	await setSetting('about_blurb', text);
}

export async function setContactEmail(email: string): Promise<void> {
	await setSetting('contact_email', email);
}

export async function updateContactChannel(
	key: string,
	input: ContactChannelInput
): Promise<unknown> {
	return api.patch(`/api/admin/site/contact/${encodeURIComponent(key)}`, input);
}

export async function createDonationTier(input: DonationTierInput): Promise<DonationTier> {
	return api.post<DonationTier>('/api/admin/site/donation-tiers', input);
}

export async function updateDonationTier(
	stars: number,
	input: DonationTierInput
): Promise<DonationTier> {
	return api.patch<DonationTier>(`/api/admin/site/donation-tiers/${stars}`, input);
}

export async function deleteDonationTier(stars: number): Promise<void> {
	await api.delete(`/api/admin/site/donation-tiers/${stars}`);
}

export async function createTestimonial(input: TestimonialInput): Promise<Testimonial> {
	return api.post<Testimonial>('/api/admin/site/testimonials', input);
}

export async function updateTestimonial(
	id: number,
	input: TestimonialInput
): Promise<Testimonial> {
	return api.patch<Testimonial>(`/api/admin/site/testimonials/${id}`, input);
}

export async function deleteTestimonial(id: number): Promise<void> {
	await api.delete(`/api/admin/site/testimonials/${id}`);
}

export async function createBankAccount(input: BankAccountInput): Promise<BankAccount> {
	return api.post<BankAccount>('/api/admin/site/bank-accounts', input);
}

export async function updateBankAccount(
	id: number,
	input: BankAccountInput
): Promise<BankAccount> {
	return api.patch<BankAccount>(`/api/admin/site/bank-accounts/${id}`, input);
}

export async function deleteBankAccount(id: number): Promise<void> {
	await api.delete(`/api/admin/site/bank-accounts/${id}`);
}

// ----------------------------------------------------------------- Pedidos

/** Pedidos con filtros. Construye la query solo con lo que venga. */
export async function getOrders(filters: OrderFilters = {}): Promise<OrderPage> {
	const params = new URLSearchParams();

	if (filters.status) params.set('status', filters.status);
	if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus);
	if (filters.q) params.set('q', filters.q);
	if (filters.limit !== undefined) params.set('limit', String(filters.limit));
	if (filters.offset !== undefined) params.set('offset', String(filters.offset));

	const query = params.toString();
	return api.get<OrderPage>(`/api/admin/orders${query ? `?${query}` : ''}`);
}

export async function getOrder(orderNumber: string): Promise<Order> {
	return api.get<Order>(`/api/admin/orders/${encodeURIComponent(orderNumber)}`);
}

/** Cambia el estado y/o el estado de pago. Se puede enviar solo uno. */
export async function updateOrderStatus(
	orderNumber: string,
	changes: { status?: Order['status']; paymentStatus?: Order['paymentStatus'] }
): Promise<Order> {
	return api.patch<Order>(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, changes);
}
