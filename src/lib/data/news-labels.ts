import type { NewsCategory } from './types';

/**
 * Etiqueta visible de cada categoría de noticia.
 *
 * Es una constante de presentación, no un dato del backend: las noticias
 * llegan de la API (`#lib/api/news`).
 */
export const categoryLabels: Record<NewsCategory, string> = {
	rescate: 'Rescate',
	adopcion: 'Adopción',
	salud: 'Salud',
	evento: 'Evento',
	tienda: 'Tienda'
};

/** Emoji de respaldo por categoría. */
export const categoryEmoji: Record<NewsCategory, string> = {
	rescate: '🚑',
	adopcion: '🏠',
	salud: '💉',
	evento: '🎉',
	tienda: '🛍️'
};
