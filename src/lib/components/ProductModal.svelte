<script lang="ts">
	import { formatPrice } from '#lib/data/shop';
	import type { Product } from '#lib/data/types';

	interface Props {
		product: Product | null;
		onclose: () => void;
		onadd: (product: Product, quantity: number, size?: string) => void;
	}

	let { product, onclose, onadd }: Props = $props();

	let closing = $state(false);
	let quantity = $state(1);
	let size = $state<string | undefined>(undefined);
	let added = $state(false);

	$effect(() => {
		if (product) {
			closing = false;
			quantity = 1;
			size = product.sizes?.[0];
			added = false;
		}
	});

	function requestClose() {
		if (closing) return;
		closing = true;
		setTimeout(onclose, 200);
	}

	function onkeydown(event: KeyboardEvent) {
		if (product && event.key === 'Escape') requestClose();
	}

	function onbackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) requestClose();
	}

	function add() {
		if (!product) return;
		onadd(product, quantity, size);
		added = true;
	}

	let soldOut = $derived(!!product && product.stock <= 0);
</script>

<svelte:window onkeydown={onkeydown} />

{#if product}
	<div class="backdrop" class:closing onclick={onbackdrop} role="presentation">
		<div class="modal" role="dialog" aria-modal="true" aria-label={product.name}>
			<div class="modal-photo" aria-hidden="true">
				{#if product.photo}
					<img src={product.photo} alt="" />
				{:else}
					<span class="modal-initial">{product.name.charAt(0)}</span>
				{/if}
				<button type="button" class="close-btn" onclick={requestClose} aria-label="Cerrar">✕</button>
			</div>

			<div class="modal-body">
				<h3>{product.name}</h3>
				<p class="modal-sub">{product.tagline}</p>

				<p class="price">{formatPrice(product.price, product.currency)}</p>

				<p class="description">{product.description}</p>

				{#if product.sizes?.length}
					<fieldset class="sizes">
						<legend>Talla</legend>
						<div class="size-options">
							{#each product.sizes as option (option)}
								<button
									type="button"
									class="size-chip"
									class:active={size === option}
									onclick={() => (size = option)}
									aria-pressed={size === option}
								>
									{option}
								</button>
							{/each}
						</div>
					</fieldset>
				{/if}

				<div class="quantity">
					<span class="quantity-label">Cantidad</span>
					<div class="quantity-control">
						<button
							type="button"
							class="qty-btn"
							onclick={() => (quantity = Math.max(1, quantity - 1))}
							aria-label="Quitar una unidad"
							disabled={quantity <= 1}
						>
							−
						</button>
						<span class="qty-value" aria-live="polite">{quantity}</span>
						<button
							type="button"
							class="qty-btn"
							onclick={() => (quantity = Math.min(product.stock, quantity + 1))}
							aria-label="Agregar una unidad"
							disabled={quantity >= product.stock}
						>
							+
						</button>
					</div>
				</div>

				<div class="modal-actions">
					<button
						type="button"
						class="add-btn"
						onclick={add}
						disabled={soldOut}
					>
						{added ? '¡Agregado!' : soldOut ? 'Agotado' : 'Agregar al carrito'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		background: rgb(28 26 23 / 0.5);
		padding: 1rem;
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
		animation: backdrop-in 0.2s ease;
	}

	.modal {
		width: 100%;
		max-width: 34rem;
		max-height: 88dvh;
		overflow-y: auto;
		border-radius: 1.5rem;
		background: #ffffff;
		border: 1px solid rgb(0 0 0 / 0.08);
		box-shadow: 0 2rem 4rem rgb(0 0 0 / 0.3);
		animation: sheet-up 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.1);
	}

	@keyframes backdrop-in {
		from {
			opacity: 0;
		}
	}

	@keyframes sheet-up {
		from {
			opacity: 0;
			transform: translateY(2.5rem) scale(0.97);
		}
	}

	.backdrop.closing {
		animation: backdrop-out 0.2s ease forwards;
	}

	.backdrop.closing .modal {
		animation: sheet-down 0.2s ease forwards;
	}

	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
	}

	@keyframes sheet-down {
		to {
			opacity: 0;
			transform: translateY(2rem) scale(0.98);
		}
	}

	.modal-photo {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 10;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.modal-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal-initial {
		font-family: var(--font-brand);
		font-size: 5rem;
		color: #fffdf8;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.close-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-min);
		height: var(--tap-min);
		border-radius: 50%;
		border: 0;
		background: rgb(255 255 255 / 0.9);
		font-size: 1.125rem;
		cursor: pointer;
		color: inherit;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-body h3 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 2.25rem;
		line-height: 1.1;
		color: #7a3f16;
	}

	.modal-sub {
		opacity: 0.8;
		margin-bottom: 0.75rem;
	}

	.price {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
	}

	.description {
		font-size: 1.0625rem;
		line-height: 1.6;
		margin-bottom: 1.25rem;
	}

	.sizes {
		border: 0;
		padding: 0;
		margin: 0 0 1.25rem;
	}

	.sizes legend {
		font-weight: 700;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
		margin-bottom: 0.5rem;
	}

	.size-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.size-chip {
		min-width: var(--tap-min);
		padding: 0.375rem 0.875rem;
		border-radius: 999px;
		border: 2px solid rgb(0 0 0 / 0.12);
		background: rgb(255 255 255 / 0.7);
		font: inherit;
		cursor: pointer;
	}

	.size-chip.active {
		border-color: #b7791f;
		background: rgb(255 250 240 / 0.95);
	}

	.quantity {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.quantity-label {
		font-weight: 700;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}

	.quantity-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.qty-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-min);
		height: var(--tap-min);
		border-radius: 50%;
		border: 1px solid rgb(0 0 0 / 0.12);
		background: rgb(255 255 255 / 0.8);
		font-size: 1.25rem;
		cursor: pointer;
		color: inherit;
	}

	.qty-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.qty-value {
		min-width: 2rem;
		text-align: center;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.modal-actions {
		display: flex;
	}

	.add-btn {
		flex: 1;
		min-height: var(--tap-min);
		padding: 0.75rem 1.5rem;
		border: 0;
		border-radius: 999px;
		background: #2e7d32;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		cursor: pointer;
	}

	.add-btn:disabled {
		background: rgb(0 0 0 / 0.12);
		color: rgb(0 0 0 / 0.4);
		cursor: not-allowed;
	}

	@media (hover: hover) {
		.add-btn:not(:disabled):hover {
			background: #388e3c;
		}

		.qty-btn:not(:disabled):hover {
			background: #f2f2f2;
		}

		.add-btn:focus-visible,
		.qty-btn:focus-visible,
		.size-chip:focus-visible,
		.close-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 48rem) {
		.backdrop {
			align-items: center;
			padding: 2rem;
		}
	}
</style>
