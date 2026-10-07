<script lang="ts">
	import NewsCard from '#lib/components/NewsCard.svelte';
	import { getNewsPage } from '#lib/api/news';
	import type { NewsItem } from '#lib/data/types';
	import { site, pageTitle } from '#lib/site';

	const title = pageTitle('Noticias');

	let { data } = $props();

	const PAGE_SIZE = 6;

	let items = $state<NewsItem[]>(data.news);
	let hasMore = $state(data.hasMore);
	let loading = $state(false);

	let sentinel: HTMLElement | undefined = $state();

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		try {
			const page = await getNewsPage(items.length, PAGE_SIZE);
			items = [...items, ...page.items];
			hasMore = page.hasMore;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!sentinel || !hasMore || loading) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) loadMore();
			},
			{ rootMargin: '300px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Noticias y novedades de la fundación: rescates, adopciones, jornadas y todo lo que pasa con la manada."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container news-page">
	<p class="tagline">📰 Noticias 📰</p>
	<p class="intro">
		Lo que pasa con la manada: rescates, adopciones, jornadas de salud y todo lo que hacemos con
		tu ayuda.
	</p>

	<div class="news-feed">
		{#each items as item (item.slug)}
			<NewsCard {item} />
		{/each}
	</div>

	<div class="feed-foot" bind:this={sentinel}>
		{#if loading}
			<span class="feed-status">Cargando más noticias…</span>
		{:else if hasMore}
			<span class="feed-status">Desliza para ver más ↓</span>
		{:else}
			<span class="feed-status done">🐾 No hay más noticias por ahora</span>
		{/if}
	</div>
</main>

<style>
	.news-page {
		padding-bottom: 3rem;
	}

	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0 0.75rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.intro {
		text-align: center;
		text-wrap: pretty;
		font-size: 1.125rem;
		max-width: 36rem;
		margin: 0 auto 2rem;
	}

	.news-feed {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	.feed-foot {
		display: flex;
		justify-content: center;
		min-height: 4rem;
		padding-block: 2rem;
	}

	.feed-status {
		font-family: var(--font-brand);
		font-size: 1.25rem;
		color: #7a3f16;
		opacity: 0.85;
		text-align: center;
	}

	.feed-status.done {
		opacity: 0.7;
	}

	@media (min-width: 48rem) {
		.news-feed {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}

	@media (min-width: 64rem) {
		.news-feed {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
