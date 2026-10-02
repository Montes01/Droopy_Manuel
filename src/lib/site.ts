export const site = {
	name: 'Droopy Manuel',
	title: 'Droopy Manuel',
	tagline: 'Droopy Manuel',
	description: 'Droopy Manuel — official site.',
	url: 'https://droopymanuel.example.com',
	locale: 'es_ES',
	language: 'es',
	themeColor: '#000000',
	author: 'Droopy Manuel',
	twitterHandle: '@droopymanuel'
} as const;

export function pageTitle(page?: string): string {
	if (!page) return site.title;
	return `${page} | ${site.name}`;
}
