<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { formatCOP, categoryBySlug } from '#lib/data/shop';
	import type { ShopItem } from '#lib/data/types';

	interface Props {
		item: ShopItem | null;
		onclose: () => void;
		onadd: (item: ShopItem, quantity: number) => void;
	}

	let { item, onclose, onadd }: Props = $props();

	let closing = $state(false);
	let quantity = $state(1);

	$effect(() => {
		if (item) {
			closing = false;
			quantity = 1;
		}
	});

	let category = $derived(item ? categoryBySlug(item.category) : undefined);

	function requestClose() {
		if (closing) return;
		closing = true;
		setTimeout(onclose, 200);
	}

	function add() {
		if (!item) return;
		onadd(item, quantity);
		requestClose();
	}

	function onkeydown(event: KeyboardEvent) {
		if (item && event.key === 'Escape') requestClose();
	}

	function onbackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) requestClose();
	}

	function change(delta: number) {
		quantity = Math.max(1, quantity + delta);
	}
</script>

<svelte:window onkeydown={onkeydown} />

{#if item}
	<div class="backdrop" class:closing onclick={onbackdrop} role="presentation">
		<div class="modal glass" role="dialog" aria-modal="true" aria-label={item.name}>
			<span class="modal-photo" aria-hidden="true">
				{#if item.photo}
					<img src={item.photo} alt="" />
				{:else}
					<span class="modal-emoji">{item.emoji}</span>
				{/if}
				<button type="button" class="close-btn" onclick={requestClose} aria-label="Cerrar">
					<Icon name="close" size={20} />
				</button>
			</span>

			<div class="modal-body">
				{#if category}
					<p class="modal-category">{category.emoji} {category.name}</p>
				{/if}
				<h3>{item.name}</h3>
				<p class="modal-price">{formatCOP(item.price)}</p>
				<p class="modal-desc">{item.description}</p>
				<p class="modal-details">{item.details}</p>

				{#if item.tags.length > 0}
					<ul class="chips">
						{#each item.tags as tag}
							<li>{tag}</li>
						{/each}
					</ul>
				{/if}

				<div class="modal-actions">
					<div class="qty" role="group" aria-label="Cantidad">
						<button type="button" onclick={() => change(-1)} aria-label="Quitar una unidad">
							<Icon name="minus" size={18} />
						</button>
						<span aria-live="polite">{quantity}</span>
						<button type="button" onclick={() => change(1)} aria-label="Añadir una unidad">
							<Icon name="plus" size={18} />
						</button>
					</div>
					<button type="button" class="add-btn" onclick={add}>
						<Icon name="cart" size={22} />
						<span>Agregar</span>
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
		max-width: 30rem;
		max-height: 90dvh;
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
		aspect-ratio: 16 / 9;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.modal-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.modal-emoji {
		font-size: 5rem;
		filter: drop-shadow(0 8px 16px rgb(0 0 0 / 0.25));
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
		cursor: pointer;
		color: inherit;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.modal-category {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
		margin-bottom: 0.25rem;
	}

	.modal-body h3 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 2.125rem;
		line-height: 1.1;
		color: #7a3f16;
	}

	.modal-price {
		font-size: 1.5rem;
		font-weight: 700;
		color: #2e7d32;
		margin-bottom: 0.75rem;
	}

	.modal-desc {
		font-size: 1.0625rem;
		margin-bottom: 0.5rem;
	}

	.modal-details {
		font-size: 0.9375rem;
		line-height: 1.65;
		opacity: 0.8;
		margin-bottom: 1rem;
	}

	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1.25rem;
	}

	.chips li {
		font-size: 0.875rem;
		background: rgb(122 63 22 / 0.08);
		border: 1px solid rgb(0 0 0 / 0.06);
		padding: 0.125rem 0.625rem;
		border-radius: 999px;
	}

	.modal-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.qty {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid rgb(0 0 0 / 0.12);
		border-radius: 999px;
		padding: 0.25rem;
	}

	.qty button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		min-height: 2.25rem;
		border: 0;
		border-radius: 50%;
		background: rgb(0 0 0 / 0.05);
		cursor: pointer;
		color: inherit;
	}

	.qty span {
		min-width: 2ch;
		text-align: center;
		font-weight: 700;
	}

	.add-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: var(--tap-min);
		padding: 0.75rem 1.5rem;
		border: 0;
		border-radius: 999px;
		background: #7a3f16;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		cursor: pointer;
	}

	@media (hover: hover) {
		.close-btn:hover,
		.qty button:hover {
			background: rgb(0 0 0 / 0.12);
		}

		.close-btn:hover {
			background: #ffffff;
		}

		.add-btn:hover {
			background: #b7791f;
		}

		.close-btn:focus-visible,
		.qty button:focus-visible,
		.add-btn:focus-visible {
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
