<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import OrderRecap from '#lib/components/OrderRecap.svelte';
	import { cartLineKey, formatCOP, unitPriceCents, unitStock } from '#lib/data/format';
	import { pageTitle } from '#lib/site';
	import { useCart } from '#lib/stores/cart.svelte';

	const title = pageTitle('Carrito');
	const cart = useCart();

	// Las opciones de entrega las publica el layout desde la API.
	const shippingOptions = $derived(cart.shippingOptions);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Revisa tu carrito y finaliza tu compra solidaria." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="container cart-page">
	<a class="back-btn" href="/tienda" aria-label="Seguir comprando">
		<span aria-hidden="true">←</span>
	</a>
	<p class="tagline">🛒 Tu carrito 🛒</p>

	{#if cart.lines.length === 0}
		<div class="empty glass">
			<p class="empty-emoji" aria-hidden="true">🐾</p>
			<p class="empty-text">Todavía no tienes productos en el carrito.</p>
			<a class="primary-btn" href="/tienda">Ir a la tienda</a>
		</div>
	{:else}
		<div class="cart-layout">
			<section class="cart-items" aria-labelledby="items-title">
				<h2 class="section-title" id="items-title">Productos</h2>
				<ul class="line-list">
					{#each cart.lines as line (cartLineKey(line.item.slug, line.variant?.id ?? null))}
						{@const variantId = line.variant?.id ?? null}
						{@const unit = unitPriceCents(line.item, line.variant)}
						{@const max = unitStock(line.item, line.variant)}
						<li class="cart-line glass">
							<span class="line-media" aria-hidden="true">{line.item.emoji}</span>
							<div class="line-body">
								<a class="line-name" href={`/tienda/${line.item.category}`}>
									{line.item.name}{#if line.variant}<span class="line-variant"> · {line.variant.label}</span>{/if}
								</a>
								<span class="line-unit">{formatCOP(unit)} c/u</span>
								<div class="line-controls">
									<div class="qty" role="group" aria-label={`Cantidad de ${line.item.name}`}>
										<button
											type="button"
											onclick={() => cart.setQuantity(line.item.slug, variantId, line.quantity - 1)}
											aria-label="Quitar una unidad"
										>
											<Icon name="minus" size={16} />
										</button>
										<span aria-live="polite">{line.quantity}</span>
										<button
											type="button"
											disabled={line.quantity >= max}
											onclick={() => cart.setQuantity(line.item.slug, variantId, line.quantity + 1)}
											aria-label="Añadir una unidad"
										>
											<Icon name="plus" size={16} />
										</button>
									</div>
									<button
										type="button"
										class="remove-btn"
										onclick={() => cart.remove(line.item.slug, variantId)}
										aria-label={`Quitar ${line.item.name} del carrito`}
									>
										<Icon name="trash" size={18} />
									</button>
								</div>
							</div>
							<span class="line-total">{formatCOP(unit * line.quantity)}</span>
						</li>
					{/each}
				</ul>
				<div class="cart-actions">
					<button type="button" class="ghost-btn danger" onclick={() => cart.clear()}>
						Vaciar carrito
					</button>
				</div>
			</section>

			<div class="cart-summary">
				<OrderRecap
					lines={cart.lines}
					shipping={cart.shipping}
					{shippingOptions}
					onShippingChange={(id) => cart.setShipping(id)}
				/>
				<a class="primary-btn checkout-btn" href="/tienda/checkout">
					<Icon name="cart" size={22} />
					<span>Finalizar compra</span>
				</a>
			</div>
		</div>
	{/if}
</main>

<style>
	.cart-page {
		padding-bottom: 4rem;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-min);
		height: var(--tap-min);
		margin-top: 1rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.85);
		border: 1px solid rgb(0 0 0 / 0.1);
		color: #7a3f16;
		font-size: 1.5rem;
		line-height: 1;
		text-decoration: none;
	}

	@media (hover: hover) {
		.back-btn:hover {
			background: #fff8ef;
		}

		.back-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0 1.25rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.empty {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		padding: 3rem 1.5rem;
		border-radius: 1.5rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		text-align: center;
	}

	.empty-emoji {
		font-size: 3.5rem;
	}

	.empty-text {
		font-size: 1.125rem;
	}

	/* Oculto visualmente en móvil, pero sigue etiquetando la sección (a11y). */
	.section-title {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.75rem;
		color: #7a3f16;
	}

	.cart-layout {
		display: grid;
		gap: 2rem;
	}

	/* Lista a ancho completo en móvil, centrada y con ancho máximo en
	   pantallas grandes. Las tarjetas siguen el ancho de la lista. */
	.line-list {
		list-style: none;
		display: grid;
		gap: 0.875rem;
		width: 100%;
		max-width: 40rem;
		margin-inline: auto;
	}

	/* Solo móvil: sin padding en el contenedor de la lista. */
	@media (max-width: 63.99rem) {
		.line-list {
			padding: 0;
		}
	}

	.cart-line {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		width: 100%;
		padding: 0.875rem 1rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.line-media {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.25rem;
		height: 3.25rem;
		flex-shrink: 0;
		font-size: 1.75rem;
		border-radius: 0.875rem;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.line-body {
		display: grid;
		gap: 0.375rem;
		min-width: 0;
	}

	.line-name {
		font-weight: 700;
		color: inherit;
		text-decoration: none;
	}

	.line-variant {
		font-weight: 400;
		opacity: 0.75;
	}

	.line-unit {
		font-size: 0.8125rem;
		opacity: 0.7;
	}

	.line-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.qty {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		border: 1px solid rgb(0 0 0 / 0.12);
		border-radius: 999px;
		padding: 0.125rem;
	}

	.qty button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		min-height: 2rem;
		border: 0;
		border-radius: 50%;
		background: rgb(0 0 0 / 0.05);
		cursor: pointer;
		color: inherit;
	}

	.qty span {
		min-width: 1.75ch;
		text-align: center;
		font-weight: 700;
	}

	.qty button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.remove-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		min-height: 2.25rem;
		border: 0;
		border-radius: 50%;
		background: rgb(198 40 40 / 0.1);
		color: #c62828;
		cursor: pointer;
	}

	.line-total {
		margin-left: auto;
		font-weight: 700;
		white-space: nowrap;
	}

	.cart-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.ghost-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.5rem 1.25rem;
		border-radius: 999px;
		border: 2px solid #7a3f16;
		background: rgb(255 255 255 / 0.85);
		color: #7a3f16;
		font-family: var(--font-brand);
		font-size: 1.125rem;
		text-decoration: none;
		cursor: pointer;
	}

	.ghost-btn.danger {
		border-color: #c62828;
		color: #c62828;
	}

	.cart-summary {
		display: grid;
		gap: 1rem;
		align-content: start;
	}

	.primary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: var(--tap-min);
		padding: 0.75rem 1.75rem;
		border: 0;
		border-radius: 999px;
		background: #2e7d32;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		text-decoration: none;
		cursor: pointer;
	}

	.checkout-btn {
		width: 100%;
	}

	@media (hover: hover) {
		.primary-btn:hover {
			background: #388e3c;
		}

		.ghost-btn:hover {
			background: #fff8ef;
		}

		.ghost-btn.danger:hover {
			background: rgb(198 40 40 / 0.08);
		}

		.qty button:hover,
		.remove-btn:hover {
			filter: brightness(0.95);
		}

		.primary-btn:focus-visible,
		.ghost-btn:focus-visible,
		.qty button:focus-visible,
		.remove-btn:focus-visible,
		.line-name:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 64rem) {
		.section-title {
			position: static;
			width: auto;
			height: auto;
			margin: 0 0 1rem;
			overflow: visible;
			clip-path: none;
			white-space: normal;
		}

		.line-list {
			max-width: none;
			margin-inline: 0;
		}

		.cart-line {
			border-radius: 1.25rem;
		}

		.cart-layout {
			grid-template-columns: 1.4fr 1fr;
			align-items: start;
			gap: 2.5rem;
		}

		.cart-summary {
			position: sticky;
			top: 5.5rem;
		}
	}
</style>
