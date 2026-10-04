<script lang="ts">
	import { site, pageTitle, socials } from '#lib/site';
	import { news } from '#lib/data/content';

	const title = pageTitle('Home');
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
		<a class="photo-card" href="/project" aria-label="Soy Droopy Manuel — ver proyecto">
			<img
				src="/cards/soy-droopy.png"
				alt="Soy Droopy Manuel"
				loading="lazy"
				decoding="async"
			/>
		</a>
	</section>
	<section aria-label="Manada comunitaria">
		<a class="photo-card" href="/manada" aria-label="Manada Comunitaria — ver manada">
			<img
				src="/cards/manada-comunitaria.jpg"
				alt="Manada Comunitaria"
				loading="lazy"
				decoding="async"
			/>
		</a>
	</section>
	</div>
	<section class="help" aria-labelledby="help-title">
		<p class="cards-title help-title" id="help-title">🐾 ¿Cómo puedes ayudar? ⭐</p>
		<div class="help-grid">
			<a class="photo-card" href="/dona-estrellas" aria-label="Donar Estrellas — donar">
				<img
					src="/cards/dona-estrellas.jpg"
					alt="Donar Estrellas"
					loading="lazy"
					decoding="async"
				/>
			</a>
			<a class="photo-card" href="/tienda" aria-label="Visitar Tienda Solidaria — ver tienda">
				<img
					src="/cards/tienda-solidaria.jpg"
					alt="Visitar Tienda Solidaria"
					loading="lazy"
					decoding="async"
				/>
			</a>
		</div>
	</section>
	<section class="news" aria-labelledby="news-title">
		<p class="cards-title" id="news-title">📰 Noticias 📰</p>
		<div class="news-grid">
			{#each news as item}
				<article class="news-card glass">
					<div class="news-holder" aria-hidden="true">
						{#if item.image}
							<img src={item.image} alt="" loading="lazy" decoding="async" />
						{:else}
							<span class="news-holder-emoji">🐾</span>
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
	<section class="contact" aria-labelledby="contact-title">
		<p class="cards-title" id="contact-title">📬 Contáctanos 📬</p>
		<div class="contact-grid">
			{#each socials as item}
				<a
					class="contact-btn glass"
					href={item.href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${site.name} en ${item.label}`}
					title={item.label}
				>
					<img src={item.icon} alt="" width="28" height="28" loading="lazy" decoding="async" />
				</a>
			{/each}
		</div>
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

	.photo-card {
		display: block;
		overflow: clip;
		border-radius: 1.25rem;
		border: 4px solid rgb(128 128 128 / 0.7);
		outline: 1px solid rgb(0 0 0 / 0.1);
		margin: 0 0 1.5rem;
		max-width: none;
		box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 0.15);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.photo-card img {
		width: 100%;
		height: auto;
		transition: transform 0.3s ease;
	}

	@media (hover: hover) {
		.photo-card:hover {
			transform: translateY(-0.25rem);
			box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 0.22);
		}

		.photo-card:hover img {
			transform: scale(1.03);
		}

		.photo-card:active {
			transform: translateY(0);
		}
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

	.contact {
		margin-block: 3rem 4rem;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.75rem;
		justify-items: center;
	}

	.contact-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		border: 1px solid rgb(255 255 255 / 0.6);
		color: inherit;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	.contact-btn img {
		width: 1.75rem;
		height: 1.75rem;
		object-fit: contain;
	}

	@media (hover: hover) {
		.contact-btn:hover {
			transform: translateY(-0.25rem);
		}
	}

	@media (min-width: 64rem) {
		.contact .cards-title {
			display: block;
		}

		.contact-grid {
			grid-template-columns: repeat(5, auto);
			justify-content: center;
			gap: 1.25rem;
		}

		.contact-btn {
			width: 4.5rem;
			height: 4.5rem;
		}

		.contact-btn img {
			width: 2.25rem;
			height: 2.25rem;
		}

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

		.photo-card {
			margin: 0;
			max-width: none;
			align-self: center;
		}
	}
</style>
