import { getContext, setContext } from 'svelte';
import type { SiteContact } from '#lib/data/types';

/**
 * Datos de contacto de la fundación, compartidos por contexto.
 *
 * El layout los carga una vez (`+layout.ts` → `getSiteContact()`) y los
 * publica aquí. Así el número de WhatsApp vive solo en el backend y ninguna
 * plantilla lo repite.
 */
class ContactStore {
	contact = $state<SiteContact | null>(null);

	/** Enlace de WhatsApp con un texto ya codificado, o cadena vacía. */
	whatsappLink(message?: string): string {
		const base = this.contact?.whatsappUrl ?? '';
		if (!base) return '';
		return message ? `${base}?text=${encodeURIComponent(message)}` : base;
	}

	/** Número tal como se muestra: «322 643 8857». */
	get phoneDisplay(): string {
		return this.contact?.whatsappDisplay ?? '';
	}

	get socials() {
		return this.contact?.socials ?? [];
	}
}

const CONTACT_KEY = Symbol('contact');

/** Publica el contacto en el contexto. Llamar una vez en el layout. */
export function initContact(contact: SiteContact | null): ContactStore {
	const store = new ContactStore();
	store.contact = contact;
	return setContext(CONTACT_KEY, store);
}

/** Recupera el contacto desde cualquier componente hijo. */
export function useContact(): ContactStore {
	const store = getContext<ContactStore>(CONTACT_KEY);
	if (!store) {
		throw new Error('useContact() requiere que initContact() se haya llamado antes en un layout.');
	}
	return store;
}
