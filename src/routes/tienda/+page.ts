import { getCategories, getFeaturedItems, getItems } from '#lib/api/shop';

export async function load() {
	const [categories, featured, items] = await Promise.all([
		getCategories(),
		getFeaturedItems(),
		getItems()
	]);

	// Conteo por categoría para las tarjetas de categoría.
	const counts = Object.fromEntries(
		categories.map((category) => [
			category.slug,
			items.filter((item) => item.category === category.slug).length
		])
	);

	return { categories, featured, counts };
}
