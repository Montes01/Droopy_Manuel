<script lang="ts">
	import { categoryLabels } from '#lib/data/news';
	import { site, pageTitle } from '#lib/site';

	let { data } = $props();

	let item = $derived(data.item);
	let title = $derived(item ? pageTitle(item.title) : pageTitle('Noticias'));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={item ? item.excerpt : site.description} />
	{#if item}
		<meta property="og:title" content={title} />
		<meta property="og:description" content={item.excerpt} />
		{#if item.photo}<meta property="og:image" content={item.photo} />{/if}
		<meta name="twitter:title" content={title} />
		<meta name="twitter:description" content={item.excerpt} />
		<meta property="article:published_time" content={item.date} />
	{:else}
		<meta property="og:title" content={title} />
		<meta property="og:description" content={site.description} />
		<meta name="twitter:title" content={title} />
		<meta name="twitter:description" content={site.description} />
	{/if}
</svelte:head>

<main class="container article-page">
	{#if item}
		<a class="back" href="/noticias">← Volver a noticias</a>

		<article class="news-article">
			<div class="cover" aria-hidden="true">
				{#if item.photo}
					<img src={item.photo} alt="" decoding="async" />
				{:else}
					<span class="cover-emoji">{item.emoji}</span>
				{/if}
			</div>

			<header class="head">
				<p class="meta">
					<span class="cat">{categoryLabels[item.category]}</span>
					<time datetime={item.date}>{formatDate(item.date)}</time>
				</p>
				<h1 class="title">{item.title}</h1>
				<p class="excerpt">{item.excerpt}</p>
				{#if item.tags.length > 0}
					<ul class="tags">
						{#each item.tags as tag (tag)}
							<li>{tag}</li>
						{/each}
					</ul>
				{/if}
			</header>

			<div class="body">
				{#each item.body as paragraph}
					<p>{paragraph}</p>
				{/each}
			</div>
		</article>
	{:else}
		<p class="tagline">📰 Noticias 📰</p>
		<p class="empty">
			No encontramos esta noticia. <a href="/noticias">Volver a noticias</a>.
		</p>
	{/if}
</main>

<script module lang="ts">
	function formatDate(iso: string): string {
		const [year, month, day] = iso.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<style>
	.article-page {
		padding-bottom: 4rem;
	}

	.back {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-min);
		margin-top: 1rem;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		color: #7a3f16;
		text-decoration: none;
	}

	.news-article {
		margin-top: 0.5rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		background: rgb(255 255 255 / 0.65);
		box-shadow: 0 0.5rem 1.5rem rgb(122 63 22 / 0.15);
		overflow: hidden;
	}

	.cover {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 7;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-emoji {
		font-size: 4.5rem;
		line-height: 1;
		filter: drop-shadow(0 4px 10px rgb(122 63 22 / 0.35));
	}

	.head {
		padding: 1.5rem 1.25rem 0;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}

	.cat {
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: #7a3f16;
		color: #fffdf8;
	}

	.title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.875rem, 7vw, 2.75rem);
		line-height: 1.15;
		color: #7a3f16;
		margin-top: 0.75rem;
		text-wrap: balance;
	}

	.excerpt {
		margin-top: 0.75rem;
		font-size: 1.1875rem;
		font-weight: 700;
		text-wrap: pretty;
	}

	.tags {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0;
		margin-top: 1rem;
	}

	.tags li {
		font-size: 0.8125rem;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: rgb(122 63 22 / 0.1);
		color: #7a3f16;
	}

	.body {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
		font-size: 1.0625rem;
		line-height: 1.65;
		text-wrap: pretty;
	}

	.empty {
		text-align: center;
		font-size: 1.125rem;
		opacity: 0.85;
		margin-block: 2rem;
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

	@media (min-width: 48rem) {
		.head,
		.body {
			padding-inline: 2rem;
		}

		.head {
			padding-top: 2rem;
		}

		.body {
			padding-bottom: 2rem;
		}
	}
</style>
