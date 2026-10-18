<script lang="ts">
	import type { DogNews } from '#lib/data/types';
	import { dogNewsKindEmoji, dogNewsKindLabels } from '#lib/data/dog-news-labels';

	/**
	 * Feed de comunicados de un perrito: la novedad que ve la comunidad en su
	 * perfil (exámenes pendientes, tratamientos en curso…). Presentacional:
	 * los datos llegan por props desde la capa API.
	 */

	interface Props {
		news: DogNews[];
		/** Color del perrito, para los acentos. Ausente = marrón de la marca. */
		accent?: string;
	}

	let { news, accent = '#7a3f16' }: Props = $props();

	/** Fecha ISO (YYYY-MM-DD) → «10 de octubre de 2026». */
	function formatNewsDate(date: string): string {
		const [year, month, day] = date.split('-').map(Number);
		if (!year || !month || !day) return date;
		return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

{#if news.length > 0}
	<section class="comunicados" style="--dog: {accent}" aria-label="Comunicados">
		<h4>📣 Comunicados</h4>
		<ul>
			{#each news as item (item.id)}
				<li class:urgent={item.urgent}>
					{#if item.photo}
						<img class="news-photo" src={item.photo} alt="" />
					{/if}
					<div class="news-top">
						<span class="news-kind">
							{dogNewsKindEmoji[item.kind]} {dogNewsKindLabels[item.kind]}
						</span>
						{#if item.urgent}<span class="news-urgent">Urgente</span>{/if}
						<time datetime={item.date}>
							{#if item.kind === 'tratamiento' && item.endDate}
								{formatNewsDate(item.date)} – {formatNewsDate(item.endDate)}
							{:else}
								{formatNewsDate(item.date)}
							{/if}
						</time>
					</div>
					<p class="news-title">{item.title}</p>
					<p class="news-body">{item.body}</p>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.comunicados {
		margin-top: 1.25rem;
	}

	.comunicados h4 {
		margin: 0 0 0.625rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.375rem;
		color: var(--dog);
	}

	ul {
		list-style: none;
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
	}

	li {
		padding: 0.75rem 0.875rem;
		border-radius: 0.875rem;
		background: rgb(255 255 255 / 0.75);
		border: 1px solid color-mix(in srgb, var(--dog) 20%, white);
		border-left: 4px solid var(--dog);
	}

	li.urgent {
		border-color: #f3c6c6;
		border-left-color: #c0392b;
		background: #fff5f5;
	}

	.news-photo {
		display: block;
		width: 100%;
		max-height: 12rem;
		object-fit: cover;
		border-radius: 0.625rem;
		margin-bottom: 0.625rem;
	}

	.news-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
	}

	.news-kind {
		font-weight: 700;
		color: var(--dog);
	}

	.news-urgent {
		padding: 0.0625rem 0.5rem;
		border-radius: 999px;
		background: #c0392b;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	time {
		margin-left: auto;
		opacity: 0.65;
	}

	.news-title {
		margin: 0.375rem 0 0.25rem;
		font-weight: 700;
		font-size: 1.0625rem;
	}

	.news-body {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.55;
		white-space: pre-wrap;
	}
</style>
