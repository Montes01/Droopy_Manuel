import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { ShopCategory, ShopItem, ShopVariantInput } from '#lib/data/types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Tienda: productos con sus variantes y categorías.
 *
 * Como en la manada, todo pasa por `serverApi` para que la cookie de sesión
 * viaje a la API durante el SSR y en las acciones.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	let categories: ShopCategory[] = [];
	let items: ShopItem[] = [];

	try {
		[categories, items] = await Promise.all([
			serverApi.get<ShopCategory[]>('/api/shop/categories', cookies),
			serverApi.get<ShopItem[]>('/api/shop/items', cookies)
		]);
	} catch {
		// Si la API no responde, la página sale vacía en vez de romperse.
	}

	return { categories, items };
};

/** Convierte un precio en pesos («45.000» o «45000») a centavos. */
function toCents(value: FormDataEntryValue | null): number | undefined {
	if (value === null) return undefined;
	const raw = String(value).replace(/[^\d]/g, '');
	if (raw === '') return undefined;
	// El panel escribe pesos; la API guarda centavos.
	return Number(raw) * 100;
}

function text(value: FormDataEntryValue | null): string | undefined {
	if (value === null) return undefined;
	const trimmed = String(value).trim();
	return trimmed === '' ? undefined : trimmed;
}

function num(value: FormDataEntryValue | null): number | undefined {
	const raw = text(value);
	if (raw === undefined) return undefined;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Lee las variantes enviadas por el formulario.
 *
 * El formulario manda tres listas paralelas (etiqueta, stock y precio), que
 * aquí se recomponen en objetos. Se ignoran las filas sin etiqueta.
 */
function readVariants(form: FormData): ShopVariantInput[] {
	const labels = form.getAll('variantLabel').map((v) => String(v).trim());
	const stocks = form.getAll('variantStock');
	const prices = form.getAll('variantPrice');

	const variants: ShopVariantInput[] = [];

	for (let i = 0; i < labels.length; i++) {
		const label = labels[i];
		if (!label) continue;

		const stock = num(stocks[i] ?? null) ?? 0;
		const priceCents = toCents(prices[i] ?? null);

		variants.push({
			label,
			stock,
			...(priceCents === undefined ? {} : { priceCents })
		});
	}

	return variants;
}

/** Convierte el error de la API en un mensaje para el formulario. */
function actionError(error: unknown, fallback: string): string {
	if (error instanceof ApiRequestError) {
		if (error.status === 401) return 'Tu sesión caducó. Vuelve a entrar.';
		return error.message;
	}
	return fallback;
}

export const actions: Actions = {
	/** Crea un producto. */
	createItem: async ({ request, cookies }) => {
		const form = await request.formData();

		const input = {
			name: text(form.get('name')),
			category: text(form.get('category')),
			priceCents: toCents(form.get('price')),
			description: text(form.get('description')),
			details: text(form.get('details')),
			emoji: text(form.get('emoji')),
			photo: text(form.get('photo')) ?? null,
			tags: String(form.get('tags') ?? '')
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			stock: num(form.get('stock')) ?? 0,
			featured: form.get('featured') === 'on',
			variants: readVariants(form)
		};

		try {
			const item = await serverApi.post<ShopItem>('/api/admin/shop/items', cookies, input);
			return { success: true, message: `${item.name} se agregó a la tienda.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear el producto.') });
		}
	},

	/** Edita un producto; si se envían variantes, reemplazan a las anteriores. */
	updateItem: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta el producto a editar.' });

		const input = {
			name: text(form.get('name')),
			category: text(form.get('category')),
			priceCents: toCents(form.get('price')),
			description: text(form.get('description')),
			details: text(form.get('details')),
			emoji: text(form.get('emoji')),
			photo: text(form.get('photo')) ?? null,
			tags: String(form.get('tags') ?? '')
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			stock: num(form.get('stock')),
			featured: form.get('featured') === 'on',
			// Solo se reemplazan si el formulario incluyó la sección de variantes.
			...(form.has('variantsIncluded') ? { variants: readVariants(form) } : {})
		};

		try {
			const item = await serverApi.patch<ShopItem>(
				`/api/admin/shop/items/${encodeURIComponent(slug)}`,
				cookies,
				input
			);
			return { success: true, message: `${item.name} se actualizó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el producto.') });
		}
	},

	/** Ajusta el stock de una variante concreta. */
	setStock: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		const variantId = text(form.get('variantId')) ?? null;
		const stock = num(form.get('stock'));

		if (!slug) return fail(400, { error: 'Falta el producto.' });
		if (stock === undefined || stock < 0) {
			return fail(400, { error: 'El stock debe ser un número igual o mayor que cero.' });
		}

		try {
			await serverApi.patch(
				`/api/admin/shop/items/${encodeURIComponent(slug)}/stock`,
				cookies,
				{ variantId, stock }
			);
			return { success: true, message: 'Stock actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el stock.') });
		}
	},

	/** Borra un producto. La API exige rol admin. */
	deleteItem: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta el producto a borrar.' });

		try {
			await serverApi.delete(`/api/admin/shop/items/${encodeURIComponent(slug)}`, cookies);
			return { success: true, message: `${slug} se eliminó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar el producto.') });
		}
	},

	/** Crea una categoría. */
	createCategory: async ({ request, cookies }) => {
		const form = await request.formData();

		const input = {
			name: text(form.get('name')),
			emoji: text(form.get('emoji')),
			blurb: text(form.get('blurb'))
		};

		try {
			const category = await serverApi.post<ShopCategory>(
				'/api/admin/shop/categories',
				cookies,
				input
			);
			return { success: true, message: `Categoría ${category.name} creada.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear la categoría.') });
		}
	},

	/** Edita una categoría. */
	updateCategory: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la categoría a editar.' });

		const input = {
			name: text(form.get('name')),
			emoji: text(form.get('emoji')),
			blurb: text(form.get('blurb'))
		};

		try {
			await serverApi.patch(
				`/api/admin/shop/categories/${encodeURIComponent(slug)}`,
				cookies,
				input
			);
			return { success: true, message: 'Categoría actualizada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar la categoría.') });
		}
	},

	/** Borra una categoría. La API rechaza si todavía tiene productos. */
	deleteCategory: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la categoría a borrar.' });

		try {
			await serverApi.delete(`/api/admin/shop/categories/${encodeURIComponent(slug)}`, cookies);
			return { success: true, message: `Categoría ${slug} eliminada.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar la categoría.') });
		}
	}
};
