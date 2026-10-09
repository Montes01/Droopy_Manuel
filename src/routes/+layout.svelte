<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Navbar from '#lib/components/Navbar.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import { site } from '#lib/site';
	import { initCart } from '#lib/stores/cart.svelte';
	import { initContact } from '#lib/stores/contact.svelte';

	let { children, data } = $props();

	// Carrito disponible para todo el árbol de la app (contexto de Svelte).
	const cart = initCart();

	// Contacto (WhatsApp, redes) para todo el árbol.
	initContact(data.contact);

	// Las opciones de entrega vienen de la API: el carrito no guarda copia
	// del costo de envío, lo lee de aquí.
	$effect(() => {
		cart.setShippingOptions(data.shippingOptions);
	});

	// Las páginas de tienda/carrito/pago y de noticias van sin footer:
	// la tienda para no distraer del flujo, noticias porque es lectura larga.
	let showFooter = $derived(
		!page.url.pathname.startsWith('/tienda') && !page.url.pathname.startsWith('/noticias')
	);
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<meta name="author" content={site.author} />
	<link rel="canonical" href={site.url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={site.url} />
	<meta property="og:locale" content={site.locale} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={site.title} />
	<meta name="twitter:description" content={site.description} />
	{#if site.twitterHandle}
		<meta name="twitter:creator" content={site.twitterHandle} />
	{/if}

	<meta name="robots" content="index, follow" />
	<link rel="icon" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
	<link rel="preload" href="/fonts/hello-note.otf" as="font" type="font/otf" crossorigin="anonymous" />
	<link
		rel="preload"
		href="/fonts/architects-daughter-latin.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link rel="preload" href="/main-bg.jpg" as="image" type="image/jpeg" fetchpriority="high" />
	<meta property="og:image" content="{site.url}/logo.png" />
	<meta property="og:image:alt" content={site.name} />
</svelte:head>

<Navbar />
{@render children()}
{#if showFooter}
	<Footer />
{/if}
