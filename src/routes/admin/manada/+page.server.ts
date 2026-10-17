import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { DogInput, DogNewsInput } from '#lib/data/admin-types';
import type { Dog, DogNews } from '#lib/data/types';
import { DOG_NEWS_KINDS, DOG_STATUSES } from '#lib/data/types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Listado de la manada.
 *
 * Usa `serverApi`, que reenvía la cookie de sesión: en el servidor las cookies
 * del navegador no llegan solas, y sin esto la API responde 401.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	let dogs: Dog[] = [];
	try {
		dogs = await serverApi.get<Dog[]>('/api/dogs', cookies);
	} catch {
		// Si la API no responde, la página sale vacía en vez de romperse.
		dogs = [];
	}

	let news: DogNews[] = [];
	try {
		news = await serverApi.get<DogNews[]>('/api/dogs/news', cookies);
	} catch {
		news = [];
	}

	// Comunicados agrupados por perrito, listos para el editor.
	const newsByDog: Record<string, DogNews[]> = {};
	for (const item of news) {
		(newsByDog[item.dogSlug] ??= []).push(item);
	}

	return {
		dogs,
		newsByDog,
		options: {
			statuses: [...DOG_STATUSES],
			sizes: ['pequeño', 'mediano', 'grande'],
			sexes: ['macho', 'hembra'],
			energies: ['tranquilo', 'moderado', 'juguetón'],
			kinds: [...DOG_NEWS_KINDS]
		}
	};
};

/**
 * Lee el perrito desde el formulario.
 *
 * Solo incluye las claves que vienen, para que al editar se envíe únicamente
 * lo que cambió y el backend valide el resto.
 */
function readDogForm(form: FormData): DogInput {
	const input: DogInput = {};

	const text = (name: string): string | undefined => {
		const value = form.get(name);
		if (value === null) return undefined;
		const trimmed = String(value).trim();
		return trimmed === '' ? undefined : trimmed;
	};

	const num = (name: string): number | undefined => {
		const value = text(name);
		if (value === undefined) return undefined;
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : undefined;
	};

	const bool = (name: string): boolean => form.get(name) === 'on';

	if (form.has('name')) input.name = text('name');
	if (form.has('breed')) input.breed = text('breed');
	if (form.has('birthDate')) input.birthDate = text('birthDate') ?? null;
	// Checkbox sin marcar no viene en FormData → hay que leerlo explícitamente.
	input.isApprox = bool('isApprox');
	if (form.has('sex')) input.sex = text('sex') as DogInput['sex'];
	if (form.has('size')) input.size = text('size') as DogInput['size'];
	if (form.has('energy')) input.energy = text('energy') as DogInput['energy'];
	if (form.has('status')) input.status = text('status') as DogInput['status'];
	if (form.has('arrival')) input.arrival = text('arrival');
	if (form.has('story')) input.story = text('story');
	if (form.has('photo')) input.photo = text('photo') ?? null;
	// Color opcional: vacío = sin color (el frontend usa el marrón).
	if (form.has('color')) input.color = text('color') ?? null;

	// `goodWith` se envía como bloque: una casilla sin marcar no llega en el
	// FormData, y eso significa `false`, no «sin cambios».
	if (form.has('goodWithKids') || form.has('goodWithDogs') || form.has('goodWithCats')) {
		input.goodWith = {
			kids: bool('goodWithKids'),
			dogs: bool('goodWithDogs'),
			cats: bool('goodWithCats')
		};
	}

	if (form.has('vaccinated')) input.vaccinated = bool('vaccinated');
	if (form.has('sterilized')) input.sterilized = bool('sterilized');
	if (form.has('featured')) input.featured = bool('featured');

	if (form.has('traits')) {
		input.traits = String(form.get('traits') ?? '')
			.split(',')
			.map((trait) => trait.trim())
			.filter(Boolean);
	}

	return input;
}

/** Lee un comunicado desde el formulario (mismo criterio: solo lo que viene). */
function readNewsForm(form: FormData): DogNewsInput {
	const input: DogNewsInput = {};

	const text = (name: string): string | undefined => {
		const value = form.get(name);
		if (value === null) return undefined;
		const trimmed = String(value).trim();
		return trimmed === '' ? undefined : trimmed;
	};

	if (form.has('kind')) input.kind = text('kind') as DogNewsInput['kind'];
	if (form.has('title')) input.title = text('title');
	if (form.has('body')) input.body = text('body');
	if (form.has('date')) input.date = text('date');
	if (form.has('photo')) input.photo = text('photo') ?? null;

	// El formulario manda un hidden "off" y el checkbox "on" cuando está
	// marcado, así desmarcar "urgente" también cuenta como cambio.
	const urgent = form.getAll('urgent').map(String);
	if (urgent.length > 0) input.urgent = urgent.includes('on');

	return input;
}

/** Convierte el error de la API en un mensaje para el formulario. */
function actionError(error: unknown, fallback: string): string {
	if (error instanceof ApiRequestError) {
		// 401 significa que la sesión caducó mientras se editaba.
		if (error.status === 401) return 'Tu sesión caducó. Vuelve a entrar.';
		return error.message;
	}
	return fallback;
}

export const actions: Actions = {
	/** Crea un perrito. */
	create: async ({ request, cookies }) => {
		const form = await request.formData();
		const input = readDogForm(form);

		try {
			const dog = await serverApi.post<Dog>('/api/admin/dogs', cookies, input);
			return { success: true, message: `${dog.name} se agregó a la manada.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear el perrito.') });
		}
	},

	/** Edita un perrito existente. */
	update: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = String(form.get('slug') ?? '').trim();
		if (!slug) return fail(400, { error: 'Falta el perrito a editar.' });

		const input = readDogForm(form);
		// El slug identifica; no se envía como campo editable.
		delete input.slug;

		try {
			const dog = await serverApi.patch<Dog>(
				`/api/admin/dogs/${encodeURIComponent(slug)}`,
				cookies,
				input
			);
			return { success: true, message: `${dog.name} se actualizó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el perrito.') });
		}
	},

	/** Borra un perrito. La API exige rol admin. */
	delete: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = String(form.get('slug') ?? '').trim();
		if (!slug) return fail(400, { error: 'Falta el perrito a borrar.' });

		try {
			await serverApi.delete(`/api/admin/dogs/${encodeURIComponent(slug)}`, cookies);
			return { success: true, message: `${slug} se eliminó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar el perrito.') });
		}
	},

	/** Mueve un perrito arriba o abajo en el orden. */
	reorder: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = String(form.get('slug') ?? '').trim();
		const direction = String(form.get('direction') ?? '');
		const current = String(form.get('order') ?? '');

		if (!slug || !['up', 'down'].includes(direction)) {
			return fail(400, { error: 'Orden inválido.' });
		}

		const slugs = current.split(',').map((s) => s.trim()).filter(Boolean);
		const index = slugs.indexOf(slug);
		if (index === -1) return fail(400, { error: 'No se encontró el perrito en el orden.' });

		const target = direction === 'up' ? index - 1 : index + 1;
		if (target < 0 || target >= slugs.length) {
			return { success: true, message: 'Ya está en el extremo.' };
		}

		[slugs[index], slugs[target]] = [slugs[target]!, slugs[index]!];

		try {
			await serverApi.put('/api/admin/dogs/order', cookies, { slugs });
			return { success: true, message: 'Orden actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo reordenar.') });
		}
	},

	/** Agrega un comunicado al perfil de un perrito. */
	addNews: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = String(form.get('slug') ?? '').trim();
		if (!slug) return fail(400, { error: 'Falta el perrito del comunicado.' });

		try {
			await serverApi.post<DogNews>(
				`/api/admin/dogs/${encodeURIComponent(slug)}/news`,
				cookies,
				readNewsForm(form)
			);
			return { success: true, message: 'Comunicado publicado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear el comunicado.') });
		}
	},

	/** Edita un comunicado existente. */
	updateNews: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = String(form.get('slug') ?? '').trim();
		const id = String(form.get('id') ?? '').trim();
		if (!slug || !id) return fail(400, { error: 'Falta el comunicado a editar.' });

		try {
			await serverApi.patch<DogNews>(
				`/api/admin/dogs/${encodeURIComponent(slug)}/news/${encodeURIComponent(id)}`,
				cookies,
				readNewsForm(form)
			);
			return { success: true, message: 'Comunicado actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el comunicado.') });
		}
	},

	/** Borra un comunicado. La API exige rol admin. */
	deleteNews: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = String(form.get('slug') ?? '').trim();
		const id = String(form.get('id') ?? '').trim();
		if (!slug || !id) return fail(400, { error: 'Falta el comunicado a borrar.' });

		try {
			await serverApi.delete(
				`/api/admin/dogs/${encodeURIComponent(slug)}/news/${encodeURIComponent(id)}`,
				cookies
			);
			return { success: true, message: 'Comunicado eliminado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar el comunicado.') });
		}
	}
};
