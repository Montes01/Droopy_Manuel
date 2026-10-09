import { getPack } from '#lib/api/dogs';

/** La manada viva y la del cielo, para el conmutador de la página. */
export async function load() {
	const [alive, heaven] = await Promise.all([getPack('alive'), getPack('heaven')]);
	return { alive, heaven };
}