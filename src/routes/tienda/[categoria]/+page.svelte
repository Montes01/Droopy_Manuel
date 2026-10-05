<script lang="ts">
	import ProductCard from '#lib/components/ProductCard.svelte';
	import ProductModal from '#lib/components/ProductModal.svelte';
	import { cart } from '#lib/stores/cart.svelte';
	import type { Product } from '#lib/data/types';
	import type { PageProps } from './$types';
	import { pageTitle, site } from '#lib/site';

	let { data }: PageProps = $props();

	const title = $derived(pageTitle(`Tienda · ${data.category.name}`));

	/** Modal por estado local, sin tocar la URL. */
	let selected: Product | null = $state(null);
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content={`${data.category.blurb} Compra en la tienda solidaria de Droopy Manuel.`}
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container category-page">
	<a class="back-button" href="/tienda" aria-label="Volver a la tienda">
		<span aria-hidden="true">←</span>
	</a>

	<p class="tagline">{data.category.emoji} {data.category.name} {data.category.emoji}</p>
	<p class="intro">{data.category.blurb}</p>

	{#if data.products.length > 0}
		<ul class="product-grid">
			{#each data.products as product (product.slug)}
				<li>
					<ProductCard {product} onselect={(p) => (selected = p)} />
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">Muy pronto habrá productos en esta categoría. 🐾</p>
	{/if}
</main>

<ProductModal
	product={selected}
	onclose={() => (selected = null)}
	onadd={(p, q, s) => cart.add(p, q, s)}
/>

<style>
	.category-page {
		padding-bottom: 3rem;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-min);
		height: var(--tap-min);
		margin-top: 1rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.8);
		border: 1px solid rgb(0 0 0 / 0.1);
		color: #7a3f16;
		font-size: 1.5rem;
		line-height: 1;
		text-decoration: none;
	}

	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 0.75rem 0 0.5rem;
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

	.product-grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.empty {
		text-align: center;
		font-size: 1.125rem;
		margin-block: 2rem;
	}

	@media (min-width: 48rem) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 64rem) {
		.product-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
