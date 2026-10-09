<script lang="ts">
	import HomeCard from '#lib/components/HomeCard.svelte';
	import { site, pageTitle } from '#lib/site';
	import type { NewsItem } from '#lib/data/types';

	const title = pageTitle('Home');

	let { data } = $props();

	/** Últimas noticias para el bloque de la portada (lo trae +page.ts). */
	let news = $derived<NewsItem[]>(data.news);
</script>

<svelte:head>
	<title>{title}</title>
	<link rel="preload" href="/droopy/soy-droopy.jpg" as="image" type="image/jpeg" fetchpriority="high" />
	<meta name="description" content="Transformamos amor en acciones reales por perritos comunitarios y callejeritos." />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container">
	<p class="tagline">Un amor que ilumina vidas de 4 patas</p>
	<div class="bento">
	<section class="hero" aria-labelledby="hero-title">
		<img
			src="/droopy/soy-droopy.jpg"
			alt="Droopy, el perrito que dio nombre a la fundación"
			class="hero-img"
			fetchpriority="high"
			decoding="async"
		/>
		<div class="hero-content">
			<h1 id="hero-title">Transformamos amor en acciones reales por perritos comunitarios y callejeritos</h1>
		</div>
	</section>

	<p class="cards-title">✨ Nuestra historia y nuestra manada ✨</p>
	<section aria-label="Proyecto destacado">
		<HomeCard
			href="/project"
			src="/cards/soy-droopy.png"
			alt="Soy Droopy Manuel"
			label="Soy Droopy Manuel — ver proyecto"
		/>
	</section>
	<section aria-label="Manada comunitaria">
		<HomeCard
			href="/manada"
			src="/cards/manada-comunitaria.jpg"
			alt="Manada Comunitaria"
			label="Manada Comunitaria — ver manada"
		/>
	</section>
	</div>
	<section class="help" aria-labelledby="help-title">
		<p class="cards-title help-title" id="help-title">🐾 ¿Cómo puedes ayudar? ⭐</p>
		<div class="help-grid">
			<HomeCard
				href="/dona-estrellas"
				src="/cards/dona-estrellas.jpg"
				alt="Donar Estrellas"
				label="Donar Estrellas — donar"
			/>
			<HomeCard
				href="/tienda"
				src="/cards/tienda-solidaria.jpg"
				alt="Visitar Tienda Solidaria"
				label="Visitar Tienda Solidaria — ver tienda"
			/>
		</div>
	</section>
	<section class="news" aria-labelledby="news-title">
		<p class="cards-title" id="news-title">📰 Noticias 📰</p>
		<div class="news-grid">
			{#each news as item}
				<article class="news-card glass">
					<div class="news-holder" aria-hidden="true">
						{#if item.photo}
							<img src={item.photo} alt="" loading="lazy" decoding="async" />
						{:else}
							<span class="news-holder-emoji">{item.emoji ?? '🐾'}</span>
						{/if}
					</div>
					<div class="news-body">
						<h3>{item.title}</h3>
						<time datetime={item.date}>
							{new Date(item.date + 'T00:00:00').toLocaleDateString('es', {
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							})}
						</time>
						<p>{item.excerpt}</p>
					</div>
				</article>
			{/each}
		</div>
		<a class="see-all" href="/noticias">Ver todas →</a>
	</section>
</main>

<style>
	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.75rem, 7vw, 2.75rem);
		line-height: 1.15;
		margin: 1.5rem 0 1rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.cards-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.5rem, 6vw, 2rem);
		line-height: 1.2;
		margin: 0.5rem 0 1rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.hero {
		position: relative;
		overflow: clip;
		border-radius: 1.25rem;
		border: 4px solid rgb(128 128 128 / 0.7);
		outline: 1px solid rgb(0 0 0 / 0.1);
		margin-block: 1.5rem 3rem;
		margin-inline: auto;
		max-width: 510px;
		min-height: 32rem;
		display: flex;
		align-items: flex-end;
		box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 0.15);
	}

	.hero-img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 20%;
	}

	.hero-content {
		position: relative;
		width: 100%;
		padding: 5rem 1.25rem 1.25rem;
		background: linear-gradient(transparent, rgb(255 255 255 / 0.8) 40%);
	}

	h1 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		line-height: 1.1;
		text-align: center;
		text-wrap: balance;
		color: #fffdf8;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	@media (min-width: 48rem) {
		.hero {
			min-height: 36rem;
		}

		.hero-content {
			padding: 7rem 2.5rem 2rem;
		}
	}

	.help {
		margin-block: 3rem;
	}

	.help-title {
		margin-top: 0;
	}

	.see-all {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		margin-top: 1.5rem;
		padding: 0.625rem 1.75rem;
		border-radius: 999px;
		background: #7a3f16;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	.news {
		margin-block: 3rem;
		text-align: center;
	}

	@media (hover: hover) {
		.see-all:hover {
			transform: translateY(-0.25rem);
		}
	}

	.news-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	.news-card {
		overflow: clip;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.news-holder {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 9;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.news-holder img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.news-holder-emoji {
		font-size: 3.5rem;
		filter: drop-shadow(0 4px 8px rgb(0 0 0 / 0.2));
	}

	.news-body {
		padding: 1.25rem;
		text-align: left;
	}

	.news-body h3 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.5rem;
		line-height: 1.2;
		margin-bottom: 0.25rem;
	}

	.news-body time {
		display: block;
		font-size: 0.9375rem;
		opacity: 0.7;
		margin-bottom: 0.5rem;
	}

	@media (min-width: 64rem) {
		.news .cards-title {
			display: block;
		}

		.news-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}

		.cards-title.help-title {
			display: block;
		}

		.help-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1.5rem;
			align-items: center;
		}

		.cards-title {
			display: none;
		}

		.bento {
			display: grid;
			grid-template-columns: 2fr 1fr;
			gap: 1.5rem;
			align-items: stretch;
			margin-block: 1.5rem 3rem;
		}

		.hero {
			margin: 0;
			max-width: none;
			min-height: 100%;
			grid-row: span 2;
		}
	}
</style>
