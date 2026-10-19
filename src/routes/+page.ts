import { getNewsPage } from '#lib/api/news';
import { getFeaturedDogs } from '#lib/api/dogs';

/** Portada: los perritos destacados y las 4 noticias más recientes. */
export async function load() {
	const [{ items }, pack] = await Promise.all([getNewsPage(0, 4), getFeaturedDogs()]);
	return { news: items, pack };
}