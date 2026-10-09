import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { Dog, NewsItem } from '#lib/data/types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Noticias.
 *
 * Como en las demás secciones, `serverApi` reenvía la cookie de sesión: sin
 * eso la API responde 401 durante el SSR y en las acciones de formulario.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	let items: NewsItem[] = [];
	let dogs: Dog[] = [];

	try {
		[items, dogs] = await Promise.all([
			serverApi.get<NewsItem[]>('/api/news', cookies),
			serverApi.get<Dog[]>('/api/dogs', cookies)
		]);
	} catch {
		// Si la API no responde, la página sale vacía en vez de romperse.
	}

	return {
		items,
		// Para el selector de perritos relacionados.
		dogs: dogs.map((dog) => ({ slug: dog.slug, name: dog.name })),
		categories: ['rescate', 'adopcion', 'salud', 'evento', 'tienda']
	};
};

function text(value: FormDataEntryValue | null): string | undefined {
	if (value === null) return undefined;
	const trimmed = String(value).trim();
	return trimmed === '' ? undefined : trimmed;
}

/**
 * Lee el cuerpo de la noticia.
 *
 * El formulario usa un `textarea` con un párrafo por línea: es lo más cómodo
 * de escribir y evita pedir un editor enriquecido. Las líneas vacías se
 * descartan.
 *
 * Devuelve `undefined` **solo si el campo no viene** (edición parcial). Si
 * viene vacío, devuelve `[]` para que la validación pueda rechazarlo: una
 * noticia sin cuerpo no debe guardarse.
 */
function readBody(form: FormData): string[] | undefined {
	if (!form.has('body')) return undefined;
	return String(form.get('body') ?? '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

/** Lee los perritos relacionados marcados en el formulario. */
function readRelated(form: FormData): string[] {
	return form
		.getAll('relatedDogSlugs')
		.map((value) => String(value).trim())
		.filter(Boolean);
}

function actionError(error: unknown, fallback: string): string {
	if (error instanceof ApiRequestError) {
		if (error.status === 401) return 'Tu sesión caducó. Vuelve a entrar.';
		return error.message;
	}
	return fallback;
}

export const actions: Actions = {
	/** Crea una noticia. */
	create: async ({ request, cookies }) => {
		const form = await request.formData();

		const body = readBody(form);
		if (body !== undefined && body.length === 0) {
			return fail(400, { error: 'La noticia necesita al menos un párrafo.' });
		}

		const input = {
			title: text(form.get('title')),
			excerpt: text(form.get('excerpt')),
			body,
			date: text(form.get('date')),
			category: text(form.get('category')),
			emoji: text(form.get('emoji')),
			photo: text(form.get('photo')) ?? null,
			featured: form.get('featured') === 'on',
			tags: String(form.get('tags') ?? '')
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			relatedDogSlugs: readRelated(form)
		};

		try {
			const item = await serverApi.post<NewsItem>('/api/admin/news', cookies, input);
			return { success: true, message: `«${item.title}» se publicó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear la noticia.') });
		}
	},

	/** Edita una noticia; los perritos relacionados se reemplazan. */
	update: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la noticia a editar.' });

		const body = readBody(form);
		if (body !== undefined && body.length === 0) {
			return fail(400, { error: 'La noticia necesita al menos un párrafo.' });
		}

		const input = {
			title: text(form.get('title')),
			excerpt: text(form.get('excerpt')),
			body,
			date: text(form.get('date')),
			category: text(form.get('category')),
			emoji: text(form.get('emoji')),
			photo: text(form.get('photo')) ?? null,
			featured: form.get('featured') === 'on',
			tags: String(form.get('tags') ?? '')
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
			relatedDogSlugs: readRelated(form)
		};

		try {
			const item = await serverApi.patch<NewsItem>(
				`/api/admin/news/${encodeURIComponent(slug)}`,
				cookies,
				input
			);
			return { success: true, message: `«${item.title}» se actualizó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar la noticia.') });
		}
	},

	/** Borra una noticia. La API exige rol admin. */
	delete: async ({ request, cookies }) => {
		const form = await request.formData();
		const slug = text(form.get('slug'));
		if (!slug) return fail(400, { error: 'Falta la noticia a borrar.' });

		try {
			await serverApi.delete(`/api/admin/news/${encodeURIComponent(slug)}`, cookies);
			return { success: true, message: `${slug} se eliminó.` };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar la noticia.') });
		}
	}
};
