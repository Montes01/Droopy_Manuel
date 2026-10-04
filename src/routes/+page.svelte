<script lang="ts">
	import { site, pageTitle } from '#lib/site';

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

	.hero {
		position: relative;
		overflow: clip;
		border-radius: 1.25rem;
		border: 4px solid rgb(28 26 23 / 0.7);
		outline: 1px solid rgb(0 0 0 / 0.1);
		margin-block: 1rem 2rem;
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
		text-wrap: balance;
	}

	@media (min-width: 48rem) {
		.hero {
			min-height: 36rem;
		}

		.hero-content {
			padding: 7rem 2.5rem 2rem;
		}
	}
</style>
