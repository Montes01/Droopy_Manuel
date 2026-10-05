<script lang="ts">
	import type { Dog } from '#lib/data/types';

	interface Props {
		open: boolean;
		dogs: Dog[];
		selectedSlug: string | null;
		/** Enlace de WhatsApp ya con el nombre del perrito elegido. */
		whatsappHref: string;
		onselect: (dog: Dog) => void;
		onclose: () => void;
	}

	let { open, dogs, selectedSlug, whatsappHref, onselect, onclose }: Props = $props();

	let closing = $state(false);

	$effect(() => {
		if (open) closing = false;
	});

	let selected = $derived(dogs.find((dog) => dog.slug === selectedSlug) ?? null);

	function requestClose() {
		if (closing) return;
		closing = true;
		setTimeout(onclose, 200);
	}

	function onkeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') requestClose();
	}

	function onbackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) requestClose();
	}
</script>

<svelte:window onkeydown={onkeydown} />

{#if open}
	<div class="backdrop" class:closing onclick={onbackdrop} role="presentation">
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="star-modal-title">
			<div class="modal-head">
				<h3 id="star-modal-title">🌟 Dedica tu estrella</h3>
				<button type="button" class="close-btn" onclick={requestClose} aria-label="Cerrar">✕</button>
			</div>

			<p class="modal-hint">¿A quién se la dedicas?</p>

			<ul class="dog-list">
				{#each dogs as dog (dog.slug)}
					<li>
						<button
							type="button"
							class="dog-option"
							class:selected={selectedSlug === dog.slug}
							onclick={() => onselect(dog)}
						>
							<span class="dog-avatar" aria-hidden="true">
								{#if dog.photo}
									<img src={dog.photo} alt="" loading="lazy" decoding="async" />
								{:else}
									{dog.name.charAt(0)}
								{/if}
							</span>
							<span class="dog-text">
								<span class="dog-name">{dog.name}</span>
								<span class="dog-meta">{dog.breed} · {dog.ageLabel}</span>
							</span>
							<span class="dog-star" aria-hidden="true">{selectedSlug === dog.slug ? '⭐' : '☆'}</span>
						</button>
					</li>
				{/each}
			</ul>

			<div class="modal-actions">
				<button
					type="button"
					class="confirm-btn"
					disabled={!selected}
					onclick={() => {
						if (selected) window.open(whatsappHref, '_blank', 'noopener,noreferrer');
					}}
				>
					Enviar comprobante
				</button>
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
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 28rem;
		height: 88dvh;
		padding: 1.5rem;
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

	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
	}

	.modal-head {
		flex-shrink: 0;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}

	.modal-head h3 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.75rem;
		line-height: 1.15;
		color: #7a3f16;
		text-wrap: balance;
	}

	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--tap-min);
		height: var(--tap-min);
		border-radius: 50%;
		border: 0;
		background: rgb(0 0 0 / 0.06);
		font-size: 1.125rem;
		cursor: pointer;
		color: inherit;
	}

	.modal-hint {
		flex-shrink: 0;
		font-size: 0.9375rem;
		opacity: 0.75;
		margin-bottom: 1rem;
	}

	.dog-list {
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.dog-list li {
		width: 100%;
	}

	.dog-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: var(--tap-min);
		padding: 0.5rem 0.75rem;
		border-radius: 0.875rem;
		border: 2px solid transparent;
		background: rgb(255 255 255 / 0.7);
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}

	.dog-option.selected {
		border-color: #b7791f;
		background: rgb(255 250 240 / 0.95);
	}

	.dog-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		flex-shrink: 0;
		font-family: var(--font-brand);
		font-size: 1.5rem;
		color: #fffdf8;
		text-shadow:
			-1px -1px 0 #7a3f16,
			1px 1px 0 #7a3f16,
			0 2px 6px rgb(122 63 22 / 0.6);
		border-radius: 50%;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
		overflow: clip;
	}

	.dog-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.dog-text {
		display: grid;
		min-width: 0;
	}

	.dog-name {
		font-family: var(--font-brand);
		font-size: 1.25rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.dog-meta {
		font-size: 0.8125rem;
		opacity: 0.7;
	}

	.dog-star {
		margin-left: auto;
		flex-shrink: 0;
		font-size: 1.375rem;
	}

	.modal-actions {
		flex-shrink: 0;
		margin-top: 1.25rem;
		display: flex;
		gap: 0.625rem;
	}

	.confirm-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.75rem 1.5rem;
		border: 0;
		border-radius: 999px;
		background: #2e7d32;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		cursor: pointer;
		text-decoration: none;
	}

	.confirm-btn:disabled {
		background: rgb(0 0 0 / 0.12);
		color: rgb(0 0 0 / 0.4);
		cursor: not-allowed;
	}

	@media (hover: hover) {
		.dog-option:hover {
			background: rgb(255 255 255 / 0.95);
		}

		.confirm-btn:not(:disabled):hover {
			background: #388e3c;
		}

		.close-btn:focus-visible,
		.dog-option:focus-visible,
		.confirm-btn:focus-visible {
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