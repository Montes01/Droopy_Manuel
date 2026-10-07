<script lang="ts">
	import { page } from '$app/state';
	import ItemCard from '#lib/components/ItemCard.svelte';
	import ItemModal from '#lib/components/ItemModal.svelte';
	import { categoryBySlug, itemsByCategory, shopCategories } from '#lib/data/shop';
	import type { ShopItem } from '#lib/data/types';
	import { site, pageTitle } from '#lib/site';
	import { useCart } from '#lib/stores/cart.svelte';

	const cart = useCart();

	let slug = $derived(page.params.slug ?? '');
	let category = $derived(categoryBySlug(slug));
	let items = $derived(itemsByCategory(slug));
	let title = $derived(pageTitle(category ? category.name : 'Tienda Solidaria'));

	let selected: ShopItem | null = $state(null);

	function add(item: ShopItem, quantity = 1) {
		cart.add(item, quantity);
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content={category
			? `${category.name} en la tienda solidaria de Droopy Manuel: ${category.blurb}`
			: site.description}
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container category-page">
	{#if category}
		<p class="tagline">{category.emoji} {category.name} {category.emoji}</p>
		<p class="intro">{category.blurb}</p>

		{#if items.length > 0}
			<div class="item-grid">
				{#each items as item (item.slug)}
					<ItemCard
						{item}
						inCart={cart.has(item.slug)}
						onselect={(i) => (selected = i)}
						onadd={(i) => add(i)}
					/>
				{/each}
			</div>
		{:else}
			<p class="empty">Muy pronto tendremos productos en esta categoría 🐾</p>
		{/if}

		<div class="other-categories">
			<p class="other-title">Otras categorías</p>
			<ul>
				{#each shopCategories as other (other.slug)}
					{#if other.slug !== category.slug}
						<li>
							<a href={`/tienda/${other.slug}`}>{other.emoji} {other.name}</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	{:else}
		<p class="tagline">🛍️ Tienda Solidaria</p>
		<p class="empty">
			No encontramos esta categoría. <a href="/tienda">Volver a la tienda</a>.
		</p>
	{/if}

	<ItemModal item={selected} onclose={() => (selected = null)} onadd={add} />
</main>

<style>
	.category-page {
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
		margin: 1rem 0 0.75rem;
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

	.item-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.empty {
		text-align: center;
		font-size: 1.125rem;
		opacity: 0.85;
		margin-block: 2rem;
	}

	.other-categories {
		margin-top: 2.5rem;
		text-align: center;
	}

	.other-title {
		font-family: var(--font-brand);
		font-size: 1.5rem;
		color: #7a3f16;
		margin-bottom: 0.75rem;
	}

	.other-categories ul {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		padding: 0;
	}

	.other-categories a {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-min);
		padding: 0.375rem 1rem;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.75);
		border: 1px solid rgb(0 0 0 / 0.08);
		color: inherit;
		text-decoration: none;
		font-size: 0.9375rem;
	}

	@media (hover: hover) {
		.other-categories a:hover {
			background: #fff8ef;
		}

		.other-categories a:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 48rem) {
		.item-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1.25rem;
		}
	}

	@media (min-width: 64rem) {
		.item-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
