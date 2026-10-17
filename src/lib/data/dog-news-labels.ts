import type { DogNewsKind } from './types';

/**
 * Etiqueta visible de cada tipo de comunicado.
 *
 * Es una constante de presentación, no un dato del backend: los comunicados
 * llegan de la API (`#lib/api/dogs`). `Record<DogNewsKind, …>` a propósito: si
 * se agrega un tipo en `./types` sin su etiqueta aquí, TypeScript lo reclama.
 */
export const dogNewsKindLabels: Record<DogNewsKind, string> = {
	general: 'Novedad',
	examen: 'Exámenes',
	tratamiento: 'Tratamiento',
	cirugia: 'Cirugía',
	recuperacion: 'Recuperación'
};

/** Emoji de respaldo por tipo de comunicado. */
export const dogNewsKindEmoji: Record<DogNewsKind, string> = {
	general: '📌',
	examen: '🩺',
	tratamiento: '💊',
	cirugia: '🏥',
	recuperacion: '🩹'
};
