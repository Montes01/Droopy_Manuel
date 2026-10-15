import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type { ProjectSectionInput } from '#lib/data/admin-types';
import { PROJECT_SECTION_KINDS } from '#lib/data/types';
import type { ProjectSection } from '#lib/data/types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Secciones de la página `/project`.
 *
 * Usa `serverApi`, que reenvía la cookie de sesión: en el servidor las cookies
 * del navegador no llegan solas, y sin esto la API responde 401.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	let sections: ProjectSection[] = [];
	try {
		sections = await serverApi.get<ProjectSection[]>('/api/project', cookies);
	} catch {
		// Si la API no responde, la página sale vacía en vez de romperse.
		sections = [];
	}

	return { sections, kinds: [...PROJECT_SECTION_KINDS] };
};

/**
 * Lee la sección desde el formulario.
 *
 * `position` en blanco se omite: al crear va al final y al editar no se mueve.
 * El cuerpo usa un párrafo por línea, como las noticias.
 */
function readSectionForm(form: FormData): ProjectSectionInput {
	const input: ProjectSectionInput = {};

	if (form.has('kind')) {
		const kind = String(form.get('kind') ?? '').trim();
		if (kind !== '') input.kind = kind as ProjectSectionInput['kind'];
	}

	if (form.has('position')) {
		const raw = String(form.get('position') ?? '').trim();
		if (raw !== '') {
			const position = Number(raw);
			if (Number.isInteger(position)) input.position = position;
		}
	}

	if (form.has('title')) {
		const title = String(form.get('title') ?? '').trim();
		input.title = title === '' ? null : title;
	}

	if (form.has('body')) {
		input.body = String(form.get('body') ?? '')
			.split('\n')
			.map((line) => line.trim())
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
	/** Crea una sección. Con posición ocupada, el resto se recorre. */
	create: async ({ request, cookies }) => {
		const form = await request.formData();
		const input = readSectionForm(form);

		try {
			await serverApi.post<ProjectSection>('/api/admin/project', cookies, input);
			return { success: true, message: 'Sección agregada al proyecto.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear la sección.') });
		}
	},

	/** Edita una sección existente, incluida su posición. */
	update: async ({ request, cookies }) => {
		const form = await request.formData();
		const id = Number(String(form.get('id') ?? '').trim());
		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Falta la sección a editar.' });
		}

		const input = readSectionForm(form);

		try {
			await serverApi.patch<ProjectSection>(
				`/api/admin/project/${encodeURIComponent(id)}`,
				cookies,
				input
			);
			return { success: true, message: 'Sección actualizada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar la sección.') });
		}
	},

	/** Borra una sección. La API exige rol admin. */
	delete: async ({ request, cookies }) => {
		const form = await request.formData();
		const id = Number(String(form.get('id') ?? '').trim());
		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Falta la sección a borrar.' });
		}

		try {
			await serverApi.delete(`/api/admin/project/${encodeURIComponent(id)}`, cookies);
			return { success: true, message: 'Sección eliminada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar la sección.') });
		}
	}
};
