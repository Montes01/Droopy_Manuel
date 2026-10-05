<script lang="ts">
	import { page } from '$app/state';
	import { cart } from '#lib/stores/cart.svelte';

	const cartUrl = '/tienda/carrito';

	let pathname = $derived(page.url.pathname);
	/** No se muestra sobre la propia página del carrito. */
	let visible = $derived(pathname !== cartUrl);
</script>

{#if visible}
	<a
		class="floating-cart"
		href={cartUrl}
		aria-label={`Carrito de compras${cart.count > 0 ? `, ${cart.count} artículos` : ', vacío'}`}
	>
		<span class="floating-icon" aria-hidden="true">🛒</span>
		{#if cart.count > 0}
			<span class="floating-badge">{cart.count}</span>
		{/if}
	</a>
{/if}

<style>
	.floating-cart {
		position: fixed;
		right: 1rem;
		bottom: calc(1rem + env(safe-area-inset-bottom));
		z-index: 900;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: #2e7d32;
		color: #fff8ef;
		text-decoration: none;
		box-shadow: 0 0.75rem 1.75rem rgb(0 0 0 / 0.3);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.floating-icon {
		font-size: 1.625rem;
		line-height: 1;
	}

	.floating-badge {
		position: absolute;
		top: -0.125rem;
		right: -0.125rem;
		min-width: 1.375rem;
		height: 1.375rem;
		padding-inline: 0.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: #fff8ef;
		color: #2e7d32;
		font-size: 0.8125rem;
		font-weight: 700;
		line-height: 1;
		border: 2px solid #2e7d32;
	}

	@media (hover: hover) {
		.floating-cart:hover {
			transform: translateY(-0.25rem);
			box-shadow: 0 1rem 2rem rgb(0 0 0 / 0.35);
		}

		.floating-cart:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 3px;
		}
	}
</style>
