<script lang="ts">
	import { site, pageTitle } from '#lib/site';
	import { renderRichText } from '#lib/data/rich-text';

	const title = pageTitle('Soy Droopy Manuel');

	let { data } = $props();

	/** La API ya las trae ordenadas por `position`: aquí solo se agrupan por clase. */
	let heroes = $derived(data.sections.filter((section) => section.kind === 'hero'));
	let chapters = $derived(data.sections.filter((section) => section.kind === 'chapter'));
	let closings = $derived(data.sections.filter((section) => section.kind === 'closing'));
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="La historia de Droopy Manuel: 13 años de amor que se transformaron en propósito para perritos comunitarios y callejeritos."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container story">
	{#each heroes as hero (hero.id)}
		<p class="tagline" aria-label={hero.title ?? `Sección ${hero.position}`}>
			<span aria-hidden="true">🌈</span>
			<span>{hero.title ?? ''}</span>
			<span aria-hidden="true">🌈</span>
		</p>
	{/each}

	{#if heroes.length > 0}
		<img
			class="story-logo"
			src="/logo.png"
			alt="Droopy, el perrito que dio nombre a la fundación"
			width="240"
			height="150"
			fetchpriority="high"
			decoding="async"
		/>
	{/if}

	{#each chapters as chapter (chapter.id)}
		<section class="chapter glass" aria-label={chapter.title ?? `Sección ${chapter.position}`}>
			{#if chapter.title}
				<h2>{chapter.title}</h2>
			{/if}
			{#each chapter.body as paragraph}
				<p>{@html renderRichText(paragraph)}</p>
			{/each}
		</section>
	{/each}

	{#each closings as closing (closing.id)}
		<blockquote class="closing glass">
			{#each closing.body as paragraph}
				<p>{@html renderRichText(paragraph)}</p>
			{/each}
			<footer>
				<a class="see-all" href="/manada">Conoce la manada →</a>
			</footer>
		</blockquote>
	{/each}
</main>

<style>
	.story {
		max-width: 44rem;
		margin-inline: auto;
		padding-bottom: 3rem;
	}

	.tagline {
		position: relative;
		display: block;
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0;
		padding-inline: 3rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.tagline > span:first-child {
		position: absolute;
		top: 0;
		left: 0;
	}

	.tagline > span:last-child {
		position: absolute;
		right: 0;
		bottom: 0;
		transform: rotate(180deg);
	}

	.story-logo {
		display: block;
		width: min(15rem, 70vw);
		height: auto;
		margin: 0.5rem auto 2.5rem;
		padding: 0.75rem;
		background: rgb(255 255 255 / 0.6);
		border-radius: 1.25rem;
		box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 0.15);
	}

	.chapter {
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		font-size: 1.125rem;
		line-height: 1.7;
	}

	.chapter h2 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.625rem;
		margin-bottom: 0.75rem;
		color: #7a3f16;
	}

	.chapter p + p {
		margin-top: 0.875rem;
	}

	.closing {
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		padding: 1.75rem 1.5rem;
		font-size: 1.1875rem;
		line-height: 1.7;
		text-align: center;
		text-wrap: pretty;
	}

	.closing p + p {
		margin-top: 0.875rem;
	}

	.closing footer {
		margin-top: 1.5rem;
	}

	.see-all {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.625rem 1.75rem;
		border-radius: 999px;
		background: #7a3f16;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	@media (hover: hover) {
		.see-all:hover {
			transform: translateY(-0.25rem);
		}
	}

	@media (min-width: 48rem) {
		.chapter,
		.closing {
			padding: 2.25rem 2.5rem;
		}
	}
</style>
