import { getCategories, getCategory, getItems } from '#lib/api/shop';

export async function load({ params }) {
	const [category, items, categories] = await Promise.all([
		getCategory(params.slug),
		getItems(params.slug),
		getCategories()
	]);

	return { category, items, categories };
}
