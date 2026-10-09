import { getNewsPage } from '#lib/api/news';

/** Portada: las 4 noticias más recientes. */
export async function load() {
	const { items } = await getNewsPage(0, 4);
	return { news: items };
}