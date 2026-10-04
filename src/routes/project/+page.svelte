<script lang="ts">
	import { site, pageTitle } from '#lib/site';

	const title = pageTitle('Project');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={site.description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container">
	<h1>Project</h1>
	<p>Contenido en camino.</p>
</main>

<style>
	h1 {
		font-family: var(--font-brand);
		font-weight: 400;
		margin-block: 1.5rem 0.5rem;
	}
</style>
