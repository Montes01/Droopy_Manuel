import { getNewsPage } from '#lib/api/news';
import { getFeaturedDogs } from '#lib/api/dogs';
import { getSiteAnnouncement } from '#lib/api/site';

/**
 * Portada: los perritos destacados, las 4 noticias más recientes y el
 * anuncio de bienvenida con los últimos perritos en adopción.
 */
export async function load() {
	const [{ items }, pack, announcement] = await Promise.all([
		getNewsPage(0, 4),
		getFeaturedDogs(),
		getSiteAnnouncement()
	]);
	return { news: items, pack, announcement };
}