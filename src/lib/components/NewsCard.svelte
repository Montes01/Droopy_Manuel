<script lang="ts">
	import type { NewsItem } from '#lib/data/types';
	import { categoryLabels } from '#lib/data/news-labels';
	import { site, pageTitle } from '#lib/site';

	interface Props {
		item: NewsItem;
	}

	let { item }: Props = $props();
</script>

<a class="news-item glass" href={`/noticias/${item.slug}`}>
	<div class="news-cover" aria-hidden="true">
		{#if item.photo}
			<img src={item.photo} alt="" loading="lazy" decoding="async" />
		{:else}
			<span class="news-emoji">{item.emoji}</span>
		{/if}
	</div>
	<div class="news-body">
		<p class="news-meta">
			<span class="news-cat">{categoryLabels[item.category]}</span>
			<time datetime={item.date}>{formatDate(item.date)}</time>
		</p>
		<h3 class="news-title">{item.title}</h3>
		<p class="news-excerpt">{item.excerpt}</p>
		<p class="news-more">Leer más →</p>
	</div>
</a>

<script module lang="ts">
	export function formatDate(iso: string): string {
		const [year, month, day] = iso.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<style>
	.news-item {
		display: block;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		overflow: hidden;
		color: inherit;
		text-decoration: none;
		box-shadow: 0 0.5rem 1.25rem rgb(122 63 22 / 0.15);
		scroll-margin-top: 5rem;
		transition: transform 0.25s ease;
	}

	.news-cover {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 7;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.news-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.news-emoji {
		font-size: 3.5rem;
		line-height: 1;
		filter: drop-shadow(0 4px 10px rgb(122 63 22 / 0.35));
	}

	.news-body {
		padding: 1.25rem;
	}

	.news-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}

	.news-cat {
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: #7a3f16;
		color: #fffdf8;
	}

	.news-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.5rem, 5vw, 1.875rem);
		line-height: 1.2;
		color: #7a3f16;
		margin-top: 0.5rem;
		text-wrap: balance;
	}

	.news-excerpt {
		margin-top: 0.5rem;
		font-size: 1.0625rem;
		text-wrap: pretty;
	}

	.news-more {
		margin-top: 0.75rem;
		font-family: var(--font-brand);
		font-size: 1.125rem;
		color: #b7791f;
	}

	@media (hover: hover) {
		.news-item:hover {
			transform: translateY(-0.25rem);
		}

		.news-item:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}
</style>
