<script lang="ts">
	import type { Dog } from '#lib/data/types';
	import { formatDogAge } from '#lib/data/format';

	interface Props {
		dog: Dog;
		onselect: (dog: Dog) => void;
	}

	let { dog, onselect }: Props = $props();

	type DisplayStatus = 'home' | 'pending' | 'lost';

	/** Los demás datos del perro se conservan, solo se ocultan de la UI. */
	let display: DisplayStatus = $derived(
		dog.status === 'adoptado' ? 'home' : dog.status === 'en-memoria' ? 'lost' : 'pending'
	);

	const statusMeta: Record<DisplayStatus, { label: string; emoji: string }> = {
		home: { label: 'Con hogar', emoji: '🏠' },
		pending: { label: 'Buscando hogar', emoji: '⏳' },
		lost: { label: 'Perdido', emoji: '🌈' }
	};

	let meta = $derived(statusMeta[display]);

	/** Color principal del perrito; ausente = marrón de la marca. */
	let accent = $derived(dog.color ?? '#7a3f16');
</script>

<button
	type="button"
	class="dog-card status-{display}"
	style="--dog: {accent}"
	onclick={() => onselect(dog)}
>
	<span class="dog-photo" class:no-photo={!dog.photo} aria-hidden="true">
		{#if dog.photo}
			<img src={dog.photo} alt="" loading="lazy" decoding="async" />
		{:else}
			<span class="dog-initial">{dog.name.charAt(0)}</span>
			<span class="dog-paw">🐾</span>
		{/if}
		{#if display !== 'lost'}
			<span class="status-pill">{meta.emoji} {meta.label}</span>
		{/if}
	</span>
	<span class="dog-body">
		<span class="dog-name">{dog.name}</span>
		<span class="dog-age">{formatDogAge(dog.birthDate, dog.isApprox)}</span>
	</span>
</button>

<style>
	.dog-card {
		--dog: #7a3f16;
		position: relative;
		display: block;
		width: 100%;
		padding: 0.75rem 0.75rem 0;
		overflow: visible;
		border-radius: 0.25rem;
		border: 1px solid rgb(122 63 22 / 0.18);
		border-color: color-mix(in srgb, var(--dog) 25%, white);
		background: #fffdf8;
		background: color-mix(in srgb, var(--dog) 20%, white);
		box-shadow: 0 0.75rem 1.75rem rgb(122 63 22 / 0.28);
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	/* Cinta adhesiva en el color del perrito: la foto está pegada, no flotando. */
	.dog-card::before {
		content: '';
		position: absolute;
		top: -0.7rem;
		left: 50%;
		width: 5.5rem;
		height: 1.4rem;
		transform: translateX(-50%) rotate(-3deg);
		background: rgb(233 213 168 / 0.9);
		background: color-mix(in srgb, var(--dog) 35%, #fffdf8);
		border-left: 1px dashed rgb(122 63 22 / 0.25);
		border-right: 1px dashed rgb(122 63 22 / 0.25);
		box-shadow: 0 2px 5px rgb(0 0 0 / 0.15);
	}

	.dog-photo {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 320px;
		margin: 0.5rem auto 0;
		overflow: hidden;
		background: #000;
	}

	.dog-photo.no-photo {
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.dog-photo img {
		height: 100%;
		width: auto;
		max-width: none;
		flex: none;
	}

	.dog-initial {
		font-family: var(--font-brand);
		font-size: 5rem;
		line-height: 1;
		color: #fffdf8;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.dog-paw {
		position: absolute;
		right: 0.75rem;
		bottom: 0.5rem;
		font-size: 2rem;
		opacity: 0.7;
	}

	.status-pill {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		font-size: 0.9375rem;
		font-weight: 700;
		padding: 0.375rem 0.875rem;
		border-radius: 999px;
		color: #fffdf8;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.25);
	}

	.status-home .status-pill {
		background: #2e7d32;
	}

	.status-pending .status-pill {
		background: #b7791f;
	}

	.status-lost .status-pill {
		background: #c62828;
	}

	.dog-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.9rem 0.5rem 1.1rem;
	}

	.dog-name {
		font-family: var(--font-brand);
		font-size: 1.9rem;
		line-height: 1.1;
		color: var(--dog);
	}

	.dog-age {
		font-size: 1rem;
		opacity: 0.75;
	}

	@media (hover: hover) {
		.dog-card:hover {
			transform: translateY(-0.25rem);
			box-shadow: 0 1.25rem 2.5rem rgb(122 63 22 / 0.35);
		}

		.dog-card:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	/* Solo móvil: la foto llena el marco sin poder ensanchar la lista. */
	@media (max-width: 40rem) {
		.dog-photo {
			height: 18rem;
		}

		.dog-photo img {
			width: 100%;
			max-width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center top;
		}
	}
</style>
