<script lang="ts">
	import DogCard from '#lib/components/DogCard.svelte';
	import DogModal from '#lib/components/DogModal.svelte';
	import type { Dog, PackView } from '#lib/data/types';
	import { site, pageTitle } from '#lib/site';

	const title = pageTitle('Mi manada comunitaria');

	let { data } = $props();

	let view = $state<PackView>('alive');

	/**
	 * Inclinación pseudoaleatoria por perrito (±0.8°–3.2°): suficiente para
	 * el look de fotos reveladas, nunca de cabeza. Determinista a partir
	 * del slug para que SSR e hidratación coincidan.
	 */
	function tiltFor(slug: string): number {
		let hash = 0;
		for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) | 0;
		const magnitude = 0.8 + ((Math.abs(hash) % 100) / 100) * 2.4;
		return (Math.abs(hash) % 2 === 0 ? 1 : -1) * magnitude;
	}

	let pack = $derived(view === 'alive' ? data.alive : data.heaven);
	let selected: Dog | null = $state(null);
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Conoce a la manada comunitaria: perritos rescatados buscando un hogar lleno de amor."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container pack-page">
	<h1 class="tagline">Manada</h1>
	<p class="intro">
		Conoce a cada perrito de nuestra manada: su historia, sus mañas y sus muchas ganas de amar.
	</p>
	<div class="view-switch" role="group" aria-label="Elige qué manada quieres ver">
		<button
			type="button"
			class="view-option"
			class:active={view === 'alive'}
			aria-pressed={view === 'alive'}
			onclick={() => (view = 'alive')}
		>
			<span class="option-text">
				<span class="option-title">Comunitaria</span>
				<span class="option-count">
					{data.alive.length}
					{data.alive.length === 1 ? 'perrito' : 'perritos'}
				</span>
			</span>
		</button>
		<button
			type="button"
			class="view-option"
			class:active={view === 'heaven'}
			aria-pressed={view === 'heaven'}
			onclick={() => (view = 'heaven')}
		>
			<span class="option-text">
				<span class="option-title">En el cielo</span>
				<span class="option-count">
					{data.heaven.length}
					{data.heaven.length === 1 ? 'angelito' : 'angelitos'}
				</span>
			</span>
		</button>
	</div>
	<p class="view-hint" aria-live="polite">
		{view === 'alive'
			? 'Estos son los perritos que hoy buscan un hogar lleno de amor.'
			: 'Estos son los perritos que ya no están con nosotros, pero siguen en la manada.'}
	</p>
	<div class="pack-grid">
		{#each pack as dog (dog.slug)}
			<div class="print" style="transform: rotate({tiltFor(dog.slug)}deg)">
				<DogCard {dog} onselect={(d) => (selected = d)} />
			</div>
		{/each}
	</div>
	{#if pack.length === 0}
		<p class="empty">
			{view === 'alive'
				? 'Muy pronto habrá perritos esperando aquí.'
				: 'Todavía no hay angelitos en el cielo.'}
		</p>
	{/if}
	<DogModal dog={selected} onclose={() => (selected = null)} />
</main>

<style>
	.pack-page {
		padding-bottom: 3rem;
	}

	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2.75rem, 11vw, 4.5rem);
		line-height: 1;
		margin: 1.25rem 0 0.5rem;
		-webkit-text-stroke: 4px #7a3f16;
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(122 63 22 / 0.6);
	}

	.intro {
		text-align: center;
		text-wrap: pretty;
		font-size: 1.125rem;
		max-width: 36rem;
		margin: 0 auto 1.5rem;
	}

	/* Dos opciones siempre visibles: nada de adivinar qué hace el botón. */
	.view-switch {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 40rem;
		margin: 0 auto 0.75rem;
		padding: 0.375rem;
		border-radius: 1.25rem;
		border: 2px solid #7a3f16;
		background: rgb(255 255 255 / 0.85);
		box-shadow: 0 0.5rem 1.25rem rgb(122 63 22 / 0.25);
	}

	.view-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: var(--tap-min);
		padding: 0.625rem 0.875rem;
		border: 0;
		border-radius: 0.875rem;
		background: transparent;
		font: inherit;
		color: #7a3f16;
		text-align: left;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.view-option:hover {
		background: rgb(122 63 22 / 0.08);
	}

	.view-option:focus-visible {
		outline: 3px solid #7a3f16;
		outline-offset: 2px;
	}

	/* Activa: rellena, para que no haya duda de dónde estás parado. */
	.view-option.active {
		background: #7a3f16;
		color: #fffdf8;
		box-shadow: 0 0.25rem 0.75rem rgb(122 63 22 / 0.35);
	}

	.view-option.active .option-count {
		color: rgb(255 253 248 / 0.85);
	}

	.option-emoji {
		font-size: 1.75rem;
		line-height: 1;
	}

	.option-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.option-title {
		font-family: var(--font-brand);
		font-size: 1.375rem;
		line-height: 1.1;
	}

	.option-count {
		font-size: 0.875rem;
		opacity: 0.85;
	}

	.view-hint {
		max-width: 40rem;
		margin: 0 auto 2rem;
		text-align: center;
		text-wrap: pretty;
		opacity: 0.85;
	}

	.empty {
		padding: 2rem 1rem;
		text-align: center;
		font-size: 1.125rem;
		opacity: 0.8;
	}

	.pack-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.75rem;
	}

	/* La inclinación va inline por perrito (ver tiltFor). */
	.print {
		min-width: 0;
		will-change: transform;
	}

	@media (min-width: 40rem) {
		.view-switch {
			flex-direction: row;
		}

		.view-option {
			flex: 1 1 0;
			justify-content: center;
			text-align: center;
		}
	}

	@media (min-width: 64rem) {
		.pack-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}
</style>
