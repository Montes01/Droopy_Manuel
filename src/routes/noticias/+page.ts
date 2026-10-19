import { getNewsCategories, getNewsPage } from '#lib/api/news';

/** Primera página del feed + categorías para los filtros. */
export async function load() {
	const [{ items, hasMore }, categories] = await Promise.all([
		getNewsPage(0, 15),
		getNewsCategories()
	]);

	return { news: items, hasMore, categories };
}
