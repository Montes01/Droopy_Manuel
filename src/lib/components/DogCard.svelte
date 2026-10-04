<script lang="ts">
	import type { Dog } from '#lib/data/types';

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
</script>

<button type="button" class="dog-card glass status-{display}" onclick={() => onselect(dog)}>
	<span class="dog-photo" aria-hidden="true">
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
		<span class="dog-age">{dog.ageLabel}</span>
	</span>
</button>

<style>
	.dog-card {
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

	.dog-photo {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 4 / 3;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.dog-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem 1.25rem 1.25rem;
	}

	.dog-name {
		font-family: var(--font-brand);
		font-size: 2rem;
		line-height: 1.1;
		color: #7a3f16;
	}

	.dog-age {
		font-size: 1.125rem;
		white-space: nowrap;
		opacity: 0.85;
	}

	@media (hover: hover) {
		.dog-card:hover {
			transform: translateY(-0.25rem);
		}

		.dog-card:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}
</style>
