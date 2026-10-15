import { DOG_STATUSES } from './types';
import type { DogStatus } from './types';

export { DOG_STATUSES };

/**
 * Etiqueta visible de cada estado del perrito.
 *
 * `Record<DogStatus, string>` a propósito: si se agrega un estado en
 * `./types` sin su etiqueta aquí, TypeScript lo reclama.
 */
export const dogStatusLabels: Record<DogStatus, string> = {
	'en-adopcion': 'En adopción',
	'hogar-temporal': 'Hogar temporal',
	adoptado: 'Adoptado',
	comunitario: 'Comunitario',
	'en-memoria': 'En memoria'
};

/** Cómo se muestra un estado en la tarjeta pública. */
export type DogDisplayStatus = 'home' | 'pending' | 'community' | 'lost';

export const dogDisplayMeta: Record<DogDisplayStatus, { label: string; emoji: string }> = {
	home: { label: 'Con hogar', emoji: '🏠' },
	pending: { label: 'Buscando hogar', emoji: '⏳' },
	community: { label: 'Comunitario', emoji: '🏘️' },
	lost: { label: 'Perdido', emoji: '🌈' }
};

/** Los demás datos del perro se conservan, solo se ocultan de la UI. */
export function getDogDisplayStatus(status: DogStatus): DogDisplayStatus {
	if (status === 'adoptado') return 'home';
	if (status === 'en-memoria') return 'lost';
	if (status === 'comunitario') return 'community';
	return 'pending';
}
