import { error } from '@sveltejs/kit';
import { categoryBySlug, productsByCategory } from '#lib/data/shop';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const category = categoryBySlug(params.categoria);

	if (!category) {
		error(404, 'Categoría no encontrada');
	}

	return {
		category,
		products: productsByCategory(category.slug)
	};
};
