import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { DogInput } from '#lib/data/admin-types';
import type { Dog } from '#lib/data/types';
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

	return {
		dogs,
		options: {
			statuses: ['en-adopcion', 'hogar-temporal', 'adoptado', 'en-memoria'],
			sizes: ['pequeño', 'mediano', 'grande'],
			sexes: ['macho', 'hembra'],
			energies: ['tranquilo', 'moderado', 'juguetón']
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
	if (form.has('ageYears')) input.ageYears = num('ageYears');
	if (form.has('ageLabel')) input.ageLabel = text('ageLabel');
	if (form.has('sex')) input.sex = text('sex') as DogInput['sex'];
	if (form.has('size')) input.size = text('size') as DogInput['size'];
	if (form.has('energy')) input.energy = text('energy') as DogInput['energy'];
	if (form.has('status')) input.status = text('status') as DogInput['status'];
	if (form.has('arrival')) input.arrival = text('arrival');
	if (form.has('story')) input.story = text('story');
	if (form.has('photo')) input.photo = text('photo') ?? null;

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
	}
};
