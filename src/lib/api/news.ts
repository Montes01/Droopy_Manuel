import type { NewsCategoryInfo, NewsFilter, NewsItem, NewsPage } from '#lib/data/types';
import { api } from './client';

/** Capa de acceso a datos de noticias. Todo viene del backend. */

export async function getNews(): Promise<NewsItem[]> {
	return api.get<NewsItem[]>('/api/news');
}

/** Categoría de noticia con su etiqueta visible. */
export async function getNewsCategories(): Promise<NewsCategoryInfo[]> {
	return api.get<NewsCategoryInfo[]>('/api/news/categories');
}

export async function getNewsItem(slug: string): Promise<NewsItem | null> {
	return api.getOrNull<NewsItem>(`/api/news/${encodeURIComponent(slug)}`);
}

/**
 * Página del feed para el scroll infinito.
 *
 * `offset` es cuántos elementos ya se mostraron. `filter` acota el feed por
 * texto (`q`) y/o categoría. Devuelve el trozo pedido y `hasMore` para que la
 * UI sepa si conviene seguir observando el centinela.
 */
export async function getNewsPage(
	offset = 0,
	limit = 6,
	filter: NewsFilter = {}
): Promise<NewsPage> {
	const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });

	const q = filter.q?.trim();
	if (q) params.set('q', q);
	if (filter.category) params.set('category', filter.category);

	return api.get<NewsPage>(`/api/news?${params.toString()}`);
}