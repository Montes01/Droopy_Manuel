<script lang="ts">
	import type { NewsItem } from '#lib/data/types';
	import { categoryLabels, categoryEmoji } from '#lib/data/news-labels';

	interface Props {
		item: NewsItem;
	}

	let { item }: Props = $props();

	const avatarEmoji = $derived(item.emoji || categoryEmoji[item.category] || '🐾');
</script>

<a class="post" href={`/noticias/${item.slug}`}>
	<span class="avatar" aria-hidden="true">{avatarEmoji}</span>

	<div class="post-body">
		<p class="post-head">
			<span class="post-name">{categoryLabels[item.category]}</span>
			<span class="post-handle">@{item.category}</span>
			<span class="post-dot" aria-hidden="true">·</span>
			<time datetime={item.date}>{formatDate(item.date)}</time>
		</p>

		<h3 class="post-title">{item.title}</h3>

		{#if item.photo}
			<div class="post-media">
				<img src={item.photo} alt="" loading="lazy" decoding="async" />
			</div>
		{/if}

		<p class="post-text">{item.excerpt}</p>

		{#if item.tags.length > 0}
			<ul class="post-tags">
				{#each item.tags as tag (tag)}
					<li class="post-tag">{tag}</li>
				{/each}
			</ul>
		{/if}

		<p class="post-more">Leer más →</p>
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
	.post {
		display: block;
		position: relative;
		padding: 1rem;
		color: inherit;
		text-decoration: none;
		scroll-margin-top: 5rem;
		transition: background 0.2s ease;
	}

	.post:not(:last-child) {
		border-bottom: 1px solid rgb(122 63 22 / 0.12);
	}

	.avatar {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		font-size: 1.5rem;
		line-height: 1;
		border-radius: 50%;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.6);
	}

	.post-body {
		min-width: 0;
	}

	.post-head {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.3125rem;
		padding-right: 3rem;
		font-size: 0.9375rem;
		line-height: 1.3;
	}

	.post-name {
		font-weight: 700;
		color: #7a3f16;
	}

	.post-handle,
	.post-dot,
	.post-head time {
		color: #a1876f;
	}

	.post-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.25rem, 4.5vw, 1.5rem);
		line-height: 1.2;
		color: #7a3f16;
		margin-top: 0.1875rem;
		padding-right: 3rem;
		text-wrap: balance;
	}

	.post-text {
		margin-top: 0.25rem;
		font-size: 1rem;
		line-height: 1.5;
		color: #4a3527;
		text-wrap: pretty;
	}

	.post-media {
		margin-top: 0.75rem;
		max-width: 100%;
		max-height: 280px;
		border-radius: 1rem;
		overflow: hidden;
		border: 1px solid rgb(122 63 22 / 0.12);
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.post-media img {
		width: 100%;
		height: auto;
		max-height: 280px;
		object-fit: cover;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-top: 0.625rem;
		list-style: none;
		padding: 0;
	}

	.post-tag {
		padding: 0.125rem 0.625rem;
		border-radius: 999px;
		border: 1px solid rgb(122 63 22 / 0.18);
		background: rgb(122 63 22 / 0.1);
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.6;
		color: #b7791f;
	}

	.post-more {
		margin-top: 0.5rem;
		font-family: var(--font-brand);
		font-size: 1.0625rem;
		color: #b7791f;
	}

	@media (hover: hover) {
		.post:hover {
			background: rgb(255 255 255 / 0.55);
		}

		.post:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: -3px;
		}
	}

	@media (min-width: 48rem) {
		.post {
			padding: 1.875rem;
		}

		.avatar {
			top: 1.875rem;
			right: 1.875rem;
		}
	}
</style>
