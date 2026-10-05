<script lang="ts">
	import { shopCategories } from '#lib/data/shop';
	import { pageTitle, site } from '#lib/site';

	const title = pageTitle('Tienda solidaria');
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Tienda solidaria de Droopy Manuel: camisetas, gorras, juguetes, libros, llaveros y mugs. Cada compra financia a la manada."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content="{title}" />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container shop-page">
	<p class="tagline">🛍️ Tienda solidaria 🛍️</p>
	<p class="intro">
		Todo lo que compras aquí se convierte en comida, vacunas y hogar para la manada. Elige una
		categoría para ver los productos.
	</p>

	<ul class="category-grid">
		{#each shopCategories as category (category.slug)}
			<li>
				<a class="category-card glass" href="/tienda/{category.slug}">
					<span class="category-emoji" aria-hidden="true">{category.emoji}</span>
					<span class="category-text">
						<span class="category-name">{category.name}</span>
						<span class="category-blurb">{category.blurb}</span>
					</span>
					<span class="category-arrow" aria-hidden="true">→</span>
				</a>
			</li>
		{/each}
	</ul>
</main>

<style>
	.shop-page {
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
		margin: 0 auto 1.75rem;
	}

	.category-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.category-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.125rem 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.category-emoji {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		flex-shrink: 0;
		font-size: 2rem;
		border-radius: 1rem;
		background: rgb(255 255 255 / 0.75);
	}

	.category-text {
		display: grid;
		gap: 0.125rem;
		min-width: 0;
	}

	.category-name {
		font-family: var(--font-brand);
		font-size: 1.75rem;
		line-height: 1.1;
		color: #7a3f16;
	}

	.category-blurb {
		font-size: 0.9375rem;
		opacity: 0.8;
	}

	.category-arrow {
		margin-left: auto;
		flex-shrink: 0;
		font-size: 1.5rem;
		color: #7a3f16;
	}

	@media (hover: hover) {
		.category-card:hover {
			transform: translateY(-0.25rem);
		}

		.category-card:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 40rem) {
		.category-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
