<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { formatCOP } from '#lib/data/shop';
	import type { ShopItem } from '#lib/data/types';

	interface Props {
		item: ShopItem;
		onselect: (item: ShopItem) => void;
		onadd: (item: ShopItem) => void;
		/** true cuando el producto ya está en el carrito. */
		inCart?: boolean;
	}

	let { item, onselect, onadd, inCart = false }: Props = $props();
</script>

<article class="item-card glass">
	<button
		type="button"
		class="item-open"
		onclick={() => onselect(item)}
		aria-label={`Ver ${item.name}`}
	>
		<span class="item-photo" aria-hidden="true">
			{#if item.photo}
				<img src={item.photo} alt="" loading="lazy" decoding="async" />
			{:else}
				<span class="item-emoji">{item.emoji}</span>
			{/if}
		</span>
		<span class="item-info">
			<span class="item-name">{item.name}</span>
			<span class="item-price">{formatCOP(item.price)}</span>
		</span>
	</button>

	<button
		type="button"
		class="add-btn"
		class:in-cart={inCart}
		onclick={() => onadd(item)}
		aria-label={inCart ? `${item.name} en el carrito, agregar otro` : `Agregar ${item.name} al carrito`}
	>
		<Icon name="cart" size={22} />
	</button>
</article>

<style>
	.item-card {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: clip;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.item-open {
		display: flex;
		flex-direction: column;
		flex: 1;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.item-photo {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 4 / 3;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.item-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-emoji {
		font-size: 4rem;
		filter: drop-shadow(0 6px 12px rgb(0 0 0 / 0.2));
	}

	.item-info {
		display: grid;
		gap: 0.25rem;
		padding: 0.875rem 1rem 3.25rem;
	}

	.item-name {
		font-family: var(--font-brand);
		font-size: 1.5rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.item-price {
		font-size: 1.125rem;
		font-weight: 700;
		color: #2e7d32;
	}

	.add-btn {
		position: absolute;
		right: 0.75rem;
		bottom: 0.75rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-min);
		height: var(--tap-min);
		border: 0;
		border-radius: 50%;
		background: #7a3f16;
		color: #fff8ef;
		cursor: pointer;
		box-shadow: 0 0.35rem 0.75rem rgb(122 63 22 / 0.35);
		transition:
			background 0.2s ease,
			transform 0.2s ease;
	}

	.add-btn.in-cart {
		background: #2e7d32;
	}

	@media (hover: hover) {
		.item-card:hover {
			transform: translateY(-0.25rem);
		}

		.add-btn:hover {
			transform: scale(1.06);
		}

		.item-open:focus-visible,
		.add-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}
</style>
