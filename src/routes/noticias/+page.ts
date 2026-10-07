import { getNewsPage } from '#lib/api/news';

export async function load() {
	const { items, hasMore } = await getNewsPage(0, 6);
	return { news: items, hasMore };
}
