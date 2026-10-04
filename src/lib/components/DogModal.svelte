<script lang="ts">
	import type { Dog } from '#lib/data/types';

	interface Props {
		dog: Dog | null;
		onclose: () => void;
	}

	let { dog, onclose }: Props = $props();

	let closing = $state(false);

	$effect(() => {
		if (dog) closing = false;
	});

	function requestClose() {
		if (closing) return;
		closing = true;
		setTimeout(onclose, 200);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') requestClose();
	}

	function onbackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) requestClose();
	}
</script>

<svelte:window onkeydown={onkeydown} />

{#if dog}
	<div class="backdrop" class:closing onclick={onbackdrop} role="presentation">
		<div class="modal glass" role="dialog" aria-modal="true" aria-label={dog.name}>
			<div class="modal-photo" aria-hidden="true">
				{#if dog.photo}
					<img src={dog.photo} alt="" />
				{:else}
					<span class="modal-initial">{dog.name.charAt(0)}</span>
				{/if}
				<button type="button" class="close-btn" onclick={requestClose} aria-label="Cerrar">✕</button>
			</div>
			<div class="modal-body">
				<h3>{dog.name}</h3>
				<p class="modal-sub">{dog.breed} · {dog.ageLabel} · {dog.sex}</p>

				<dl class="facts">
					<div>
						<dt>Tamaño</dt>
						<dd>{dog.size}</dd>
					</div>
					<div>
						<dt>Energía</dt>
						<dd>{dog.energy}</dd>
					</div>
					<div>
						<dt>Salud</dt>
						<dd>
							{dog.vaccinated ? 'Vacunado' : 'Sin vacunar'} ·
							{dog.sterilized ? 'Esterilizado' : 'Pendiente'}
						</dd>
					</div>
					<div>
						<dt>Convive con</dt>
						<dd>
							{[
								dog.goodWith.kids ? 'niños' : null,
								dog.goodWith.dogs ? 'perros' : null,
								dog.goodWith.cats ? 'gatos' : null
							]
								.filter(Boolean)
								.join(', ') || '—'}
						</dd>
					</div>
				</dl>

				<ul class="chips">
					{#each dog.traits as trait}
						<li>{trait}</li>
					{/each}
				</ul>

				<p class="story">{dog.story}</p>
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
		aspect-ratio: 16 / 9;
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
		margin-bottom: 1rem;
	}

	.facts {
		display: grid;
		gap: 0.625rem;
		margin-bottom: 1rem;
	}

	.facts > div {
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 0.5rem;
		font-size: 1rem;
	}

	.facts dt {
		font-weight: 700;
		opacity: 0.7;
	}

	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	.chips li {
		font-size: 0.875rem;
		background: rgb(255 255 255 / 0.7);
		border: 1px solid rgb(0 0 0 / 0.08);
		padding: 0.125rem 0.625rem;
		border-radius: 999px;
	}

	.story {
		font-size: 1.0625rem;
		line-height: 1.65;
	}

	@media (min-width: 48rem) {
		.backdrop {
			align-items: center;
			padding: 2rem;
		}
	}
</style>
