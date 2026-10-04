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

export const nav = [
	{ label: '🏠 Home', href: '/' },
	{ label: '🐾 Mi manada comunitaria', href: '/manada' },
	{ label: '⭐ Dona estrellas', href: '/dona-estrellas' },
	{ label: '🛍️ Tienda Solidaria', href: '/tienda' },
	{ label: '📰 Noticias', href: '/noticias' }
] as const;

export const socials = [
	{ label: 'TikTok', icon: '/icons/tiktok.png', href: 'https://www.tiktok.com/@droopy.manuel?_r=1&_t=ZS-941vqEuOvdy' },
	{ label: 'Instagram', icon: '/icons/instagram.png', href: 'https://www.instagram.com/droopymanuel?igsh=MTFtbmFuaHhkbWwweQ==' },
	{ label: 'Facebook', icon: '/icons/facebook.png', href: 'https://www.facebook.com/share/18BXEMcn6s/' },
	{ label: 'YouTube', icon: '/icons/youtube.png', href: 'https://www.youtube.com/@droopymanuel' },
	{ label: 'WhatsApp', icon: '/icons/whatsapp.png', href: 'https://wa.me/573226438857' }
] as const;

export function pageTitle(page?: string): string {
	if (!page) return site.title;
	return `${page} | ${site.name}`;
}
