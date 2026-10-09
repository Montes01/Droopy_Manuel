import { fail } from '@sveltejs/kit';
import { ApiRequestError } from '#lib/api/client';
import { serverApi } from '#lib/api/server';
import type {
	BankAccount,
	ContactChannel,
	DonationTier,
	SiteContact,
	SiteContent,
	Testimonial
} from '#lib/data/types';
import type { Actions, PageServerLoad } from './$types';

/**
 * Contenido del sitio: contacto, estadísticas, donaciones, testimonios y
 * cuentas bancarias.
 *
 * Todo con `serverApi`, que reenvía la cookie de sesión.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	// Cada bloque falla de forma independiente: si las cuentas no cargan, el
	// resto de la página sigue siendo usable.
	async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
		try {
			return await fn();
		} catch {
			return fallback;
		}
	}

	const [content, contact, tiers, testimonials, accounts] = await Promise.all([
		safe(() => serverApi.get<SiteContent>('/api/site/content', cookies), {
			aboutBlurb: '',
			stats: { rescued: 0, adopted: 0, sterilized: 0, inCare: 0 }
		}),
		safe(() => serverApi.get<SiteContact>('/api/site/contact', cookies), {
			whatsappNumber: '',
			whatsappDisplay: '',
			whatsappUrl: '',
			email: '',
			socials: [] as ContactChannel[]
		}),
		safe(() => serverApi.get<DonationTier[]>('/api/site/donation-tiers', cookies), []),
		safe(() => serverApi.get<Testimonial[]>('/api/site/testimonials', cookies), []),
		safe(() => serverApi.get<BankAccount[]>('/api/site/bank-accounts', cookies), [])
	]);

	return { content, contact, tiers, testimonials, accounts };
};

function text(value: FormDataEntryValue | null): string | undefined {
	if (value === null) return undefined;
	const trimmed = String(value).trim();
	return trimmed === '' ? undefined : trimmed;
}

/** Lee un entero, o `undefined` si no se envió. */
function toInt(value: FormDataEntryValue | null): number | undefined {
	const raw = text(value);
	if (raw === undefined) return undefined;
	const parsed = Number(raw.replace(/[^\d]/g, ''));
	return Number.isFinite(parsed) ? parsed : undefined;
}

/** Convierte pesos escritos por una persona a centavos. */
function toCents(value: FormDataEntryValue | null): number | undefined {
	const pesos = toInt(value);
	return pesos === undefined ? undefined : pesos * 100;
}

function actionError(error: unknown, fallback: string): string {
	if (error instanceof ApiRequestError) {
		if (error.status === 401) return 'Tu sesión caducó. Vuelve a entrar.';
		return error.message;
	}
	return fallback;
}

export const actions: Actions = {
	/** Guarda el texto «sobre nosotros». */
	saveAbout: async ({ request, cookies }) => {
		const form = await request.formData();
		try {
			await serverApi.put('/api/admin/site/settings/about_blurb', cookies, {
				value: text(form.get('aboutBlurb')) ?? ''
			});
			return { success: true, message: 'Texto actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo guardar el texto.') });
		}
	},

	/** Guarda las estadísticas de la portada. */
	saveStats: async ({ request, cookies }) => {
		const form = await request.formData();

		const stats = {
			rescued: toInt(form.get('rescued')),
			adopted: toInt(form.get('adopted')),
			sterilized: toInt(form.get('sterilized')),
			inCare: toInt(form.get('inCare'))
		};

		for (const [key, value] of Object.entries(stats)) {
			if (value === undefined) {
				return fail(400, { error: `Falta el valor de «${key}».` });
			}
		}

		try {
			await serverApi.put('/api/admin/site/settings/stats', cookies, { value: stats });
			return { success: true, message: 'Estadísticas actualizadas.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudieron guardar las estadísticas.') });
		}
	},

	/** Guarda el correo de contacto. */
	saveEmail: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = text(form.get('email'));

		if (!email) return fail(400, { error: 'Escribe un correo.' });

		try {
			await serverApi.put('/api/admin/site/settings/contact_email', cookies, { value: email });
			return { success: true, message: 'Correo actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo guardar el correo.') });
		}
	},

	/**
	 * Cambia el número de WhatsApp.
	 *
	 * Solo se envía el número: el backend recalcula el texto visible y el
	 * enlace a partir de él, así que no pueden contradecirse.
	 */
	saveWhatsapp: async ({ request, cookies }) => {
		const form = await request.formData();
		const number = text(form.get('whatsappNumber'));

		if (!number) return fail(400, { error: 'Escribe el número.' });

		try {
			await serverApi.patch('/api/admin/site/contact/whatsapp', cookies, {
				phoneNumber: number
			});
			return { success: true, message: 'WhatsApp actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo guardar el número.') });
		}
	},

	// ---------------------------------------------------- Niveles de donación

	createTier: async ({ request, cookies }) => {
		const form = await request.formData();

		const input = {
			stars: toInt(form.get('stars')),
			name: text(form.get('name')),
			priceCents: toCents(form.get('price')),
			blurb: text(form.get('blurb')),
			perks: String(form.get('perks') ?? '')
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		};

		try {
			await serverApi.post('/api/admin/site/donation-tiers', cookies, input);
			return { success: true, message: 'Nivel creado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo crear el nivel.') });
		}
	},

	updateTier: async ({ request, cookies }) => {
		const form = await request.formData();
		const stars = toInt(form.get('stars'));
		if (stars === undefined) return fail(400, { error: 'Falta el nivel a editar.' });

		const input = {
			name: text(form.get('name')),
			priceCents: toCents(form.get('price')),
			blurb: text(form.get('blurb')),
			perks: String(form.get('perks') ?? '')
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean)
		};

		try {
			await serverApi.patch(`/api/admin/site/donation-tiers/${stars}`, cookies, input);
			return { success: true, message: 'Nivel actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el nivel.') });
		}
	},

	deleteTier: async ({ request, cookies }) => {
		const form = await request.formData();
		const stars = toInt(form.get('stars'));
		if (stars === undefined) return fail(400, { error: 'Falta el nivel a borrar.' });

		try {
			await serverApi.delete(`/api/admin/site/donation-tiers/${stars}`, cookies);
			return { success: true, message: 'Nivel eliminado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar el nivel.') });
		}
	},

	// ------------------------------------------------------------ Testimonios

	createTestimonial: async ({ request, cookies }) => {
		const form = await request.formData();

		const input = {
			name: text(form.get('name')),
			role: text(form.get('role')),
			quote: text(form.get('quote')),
			dog: text(form.get('dog')) ?? null
		};

		try {
			await serverApi.post('/api/admin/site/testimonials', cookies, input);
			return { success: true, message: 'Testimonio agregado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo agregar el testimonio.') });
		}
	},

	updateTestimonial: async ({ request, cookies }) => {
		const form = await request.formData();
		const id = toInt(form.get('id'));
		if (id === undefined) return fail(400, { error: 'Falta el testimonio a editar.' });

		const input = {
			name: text(form.get('name')),
			role: text(form.get('role')),
			quote: text(form.get('quote')),
			dog: text(form.get('dog')) ?? null
		};

		try {
			await serverApi.patch(`/api/admin/site/testimonials/${id}`, cookies, input);
			return { success: true, message: 'Testimonio actualizado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo actualizar el testimonio.') });
		}
	},

	deleteTestimonial: async ({ request, cookies }) => {
		const form = await request.formData();
		const id = toInt(form.get('id'));
		if (id === undefined) return fail(400, { error: 'Falta el testimonio a borrar.' });

		try {
			await serverApi.delete(`/api/admin/site/testimonials/${id}`, cookies);
			return { success: true, message: 'Testimonio eliminado.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar el testimonio.') });
		}
	},

	// ------------------------------------------------------- Cuentas bancarias

	createAccount: async ({ request, cookies }) => {
		const form = await request.formData();

		const number = text(form.get('number'));
		if (!number) return fail(400, { error: 'La cuenta necesita un número.' });

		// El tipo de cuenta es opcional: algunas (Nequi, PayPal) no lo tienen.
		const accountType = text(form.get('type'));
		const fields = [
			...(accountType ? [{ label: 'Tipo de cuenta', value: accountType }] : []),
			{ label: 'Número', value: number, copyable: true }
		];

		const input = {
			bank: text(form.get('bank')),
			emoji: text(form.get('emoji')),
			method: text(form.get('method')),
			holder: text(form.get('holder')),
			fields
		};

		try {
			await serverApi.post('/api/admin/site/bank-accounts', cookies, input);
			return { success: true, message: 'Cuenta agregada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo agregar la cuenta.') });
		}
	},

	deleteAccount: async ({ request, cookies }) => {
		const form = await request.formData();
		const id = toInt(form.get('id'));
		if (id === undefined) return fail(400, { error: 'Falta la cuenta a borrar.' });

		try {
			await serverApi.delete(`/api/admin/site/bank-accounts/${id}`, cookies);
			return { success: true, message: 'Cuenta eliminada.' };
		} catch (error) {
			return fail(400, { error: actionError(error, 'No se pudo borrar la cuenta.') });
		}
	}
};
