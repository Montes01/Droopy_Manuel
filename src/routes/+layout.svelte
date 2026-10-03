<script lang="ts">
	import '../app.css';
	import Navbar from '#lib/components/Navbar.svelte';
	import { site } from '#lib/site';

	let { children } = $props();
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
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="apple-touch-icon" href="/logo.png" />
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
