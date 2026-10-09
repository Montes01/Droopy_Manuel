<script lang="ts">
	import ItemCard from '#lib/components/ItemCard.svelte';
	import ItemModal from '#lib/components/ItemModal.svelte';
	import { formatCOP } from '#lib/data/format';
	import type { ShopItem, ShopVariant } from '#lib/data/types';
	import { site, pageTitle } from '#lib/site';
	import { useCart } from '#lib/stores/cart.svelte';

	const title = pageTitle('Tienda Solidaria');
	const cart = useCart();

	let { data } = $props();

	let selected: ShopItem | null = $state(null);

	function add(item: ShopItem, variant: ShopVariant | null = null, quantity = 1) {
		cart.add(item, variant, quantity);
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Compra en la tienda solidaria de Droopy Manuel y ayuda a la manada con cada producto."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container shop-page">
	<p class="tagline">🛍️ Tienda Solidaria 🛍️</p>
	<p class="intro">
		Cada compra se convierte en comida, vacunas y segundas oportunidades para la manada. Elige una
		categoría y arma tu pedido 💛
	</p>

	<section aria-labelledby="categories-title">
		<h2 class="section-title" id="categories-title">Categorías</h2>
		<div class="category-grid">
			{#each data.categories as category (category.slug)}
				{@const count = data.counts[category.slug] ?? 0}
				<a class="category-card glass" href={`/tienda/${category.slug}`}>
					<span class="category-emoji" aria-hidden="true">{category.emoji}</span>
					<span class="category-body">
						<span class="category-name">{category.name}</span>
						<span class="category-blurb">{category.blurb}</span>
						<span class="category-count">{count} {count === 1 ? 'producto' : 'productos'}</span>
					</span>
				</a>
			{/each}
		</div>
	</section>

	<section class="featured" aria-labelledby="featured-title">
		<h2 class="section-title" id="featured-title">✨ Destacados</h2>
		<div class="item-grid">
			{#each data.featured as item (item.slug)}
				<ItemCard
					{item}
					inCart={cart.has(item.slug)}
					onselect={(i) => (selected = i)}
					onadd={(i) => add(i)}
				/>
			{/each}
		</div>
	</section>

	{#if cart.count > 0}
		<a class="cart-bar glass" href="/tienda/carrito">
			<span class="cart-bar-icon" aria-hidden="true">🛒</span>
			<span>{cart.count} {cart.count === 1 ? 'producto' : 'productos'} en el carrito</span>
			<span class="cart-bar-total">{formatCOP(cart.subtotalCents)}</span>
			<span class="cart-bar-go">Ver carrito →</span>
		</a>
	{/if}

	<ItemModal
		item={selected}
		categories={data.categories}
		onclose={() => (selected = null)}
		onadd={add}
	/>
</main>

<style>
	.shop-page {
		padding-bottom: 4rem;
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
		max-width: 38rem;
		margin: 0 auto 1.75rem;
	}

	.section-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.375rem, 5vw, 1.875rem);
		line-height: 1.2;
		margin-bottom: 1rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.category-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 2.5rem;
	}

	.category-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		color: inherit;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	.category-emoji {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		flex-shrink: 0;
		font-size: 1.75rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.75);
	}

	.category-body {
		display: grid;
		gap: 0.125rem;
		min-width: 0;
	}

	.category-name {
		font-family: var(--font-brand);
		font-size: 1.5rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.category-blurb {
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.category-count {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.55;
	}

	.featured {
		margin-bottom: 3rem;
	}

	.item-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	/* Barra flotante de carrito. */
	.cart-bar {
		position: fixed;
		left: 50%;
		bottom: max(1rem, env(safe-area-inset-bottom));
		transform: translateX(-50%);
		z-index: 900;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: min(100% - 2rem, 30rem);
		padding: 0.75rem 1rem;
		border-radius: 999px;
		border: 1px solid rgb(255 255 255 / 0.7);
		box-shadow: 0 0.75rem 1.75rem rgb(0 0 0 / 0.22);
		color: inherit;
		text-decoration: none;
		font-size: 0.9375rem;
	}

	.cart-bar-icon {
		font-size: 1.375rem;
	}

	.cart-bar-total {
		margin-left: auto;
		font-weight: 700;
		color: #2e7d32;
	}

	.cart-bar-go {
		font-family: var(--font-brand);
		font-size: 1.125rem;
		color: #7a3f16;
		white-space: nowrap;
	}

	@media (hover: hover) {
		.category-card:hover {
			transform: translateY(-0.25rem);
		}

		.category-card:focus-visible,
		.cart-bar:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 48rem) {
		.category-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.item-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 64rem) {
		.category-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.item-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
