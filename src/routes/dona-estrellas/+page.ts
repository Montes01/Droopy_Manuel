import { getDonationTargets, getBankAccounts, getSiteContent } from '#lib/api/site';

/** Cuentas bancarias, perritos a los que donar y texto "sobre nosotros". */
export async function load() {
	const [targets, accounts, content] = await Promise.all([
		getDonationTargets(),
		getBankAccounts(),
		getSiteContent()
	]);

	return {
		// La página trabaja con los perritos, no con la envoltura de la meta.
		dogs: targets.map((target) => target.dog),
		accounts,
		aboutBlurb: content.aboutBlurb
	};
}