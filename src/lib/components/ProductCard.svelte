<script lang="ts">
	import { formatPrice } from '#lib/data/shop';
	import type { Product } from '#lib/data/types';

	interface Props {
		product: Product;
		onselect: (product: Product) => void;
	}

	let { product, onselect }: Props = $props();
</script>

<button type="button" class="product-card glass" onclick={() => onselect(product)}>
	<span class="product-photo" aria-hidden="true">
		{#if product.photo}
			<img src={product.photo} alt="" loading="lazy" decoding="async" />
		{:else}
			<span class="product-initial">{product.name.charAt(0)}</span>
			<span class="product-emoji">🐾</span>
		{/if}
		{#if product.stock <= 0}
			<span class="stock-pill">Agotado</span>
		{:else if product.stock <= 12}
			<span class="stock-pill">Últimas {product.stock}</span>
		{/if}
	</span>
	<span class="product-body">
		<span class="product-name">{product.name}</span>
		<span class="product-tagline">{product.tagline}</span>
		<span class="product-price">{formatPrice(product.price, product.currency)}</span>
	</span>
</button>

<style>
	.product-card {
		display: block;
		width: 100%;
		padding: 0;
		overflow: clip;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.product-photo {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1 / 1;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.product-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.product-initial {
		font-family: var(--font-brand);
		font-size: 4.5rem;
		line-height: 1;
		color: #fffdf8;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.product-emoji {
		position: absolute;
		right: 0.75rem;
		bottom: 0.5rem;
		font-size: 1.75rem;
		opacity: 0.7;
	}

	.stock-pill {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		color: #fffdf8;
		background: #b7791f;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.25);
	}

	.product-body {
		display: grid;
		gap: 0.25rem;
		padding: 0.875rem 1rem 1rem;
	}

	.product-name {
		font-family: var(--font-brand);
		font-size: 1.5rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.product-tagline {
		font-size: 0.875rem;
		opacity: 0.75;
	}

	.product-price {
		margin-top: 0.125rem;
		font-size: 1.125rem;
		font-weight: 700;
	}

	@media (hover: hover) {
		.product-card:hover {
			transform: translateY(-0.25rem);
		}

		.product-card:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}
</style>
