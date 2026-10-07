import { getNewsItem } from '#lib/api/news';

export async function load({ params }) {
	const item = await getNewsItem(params.slug);
	return { item };
}
