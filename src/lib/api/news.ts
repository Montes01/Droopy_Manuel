import { newsCategories, getNewsItem as findNewsItem, sortedNews } from '#lib/data/news';
import type { NewsCategory, NewsItem } from '#lib/data/types';

/**
 * Capa de acceso a datos de noticias.
 *
 * Todo es asíncrono para que, cuando exista el backend, solo se cambie el
 * cuerpo de estas funciones por llamadas HTTP reales. Los componentes ya
 * consumen promesas a través de `load()`, sin cambios.
 *
 * Hoy resuelven el contenido mock de `#lib/data/news`.
 */

/** Simula latencia de red para que la UI se comporte como con un backend. */
function delay<T>(value: T): Promise<T> {
	return Promise.resolve(value);
}

export async function getNews(): Promise<NewsItem[]> {
	return delay(sortedNews());
}

/** Categoría de noticia con su etiqueta visible. */
export async function getNewsCategories(): Promise<
	{ slug: NewsCategory; label: string; emoji: string }[]
> {
	return delay(newsCategories);
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
	return delay(findNewsItem(slug) ?? null);
}

/**
 * Página del feed para el scroll infinito.
 *
 * `offset` es cuántos elementos ya se mostraron. Devuelve el trozo pedido y
 * `hasMore` para que la UI sepa si conviene seguir observando el centinela.
 */
export async function getNewsPage(
	offset = 0,
	limit = 6
): Promise<{ items: NewsItem[]; hasMore: boolean }> {
	const all = sortedNews();
	const items = all.slice(offset, offset + limit);
	return delay({ items, hasMore: offset + items.length < all.length });
}
