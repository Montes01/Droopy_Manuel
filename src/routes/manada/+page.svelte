<script lang="ts">
	import DogCard from '#lib/components/DogCard.svelte';
	import DogModal from '#lib/components/DogModal.svelte';
	import type { Dog, PackView } from '#lib/data/types';
	import { site, pageTitle } from '#lib/site';

	const title = pageTitle('Mi manada comunitaria');

	let { data } = $props();

	let view = $state<PackView>('alive');

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
	<p class="tagline">🐾 Mi manada comunitaria 🐾</p>
	<p class="intro">
		Estos son algunos de los perritos bajo nuestro cuidado. Cada uno con su historia, sus mañas y
		muchas ganas de amar.
	</p>
	<div class="view-switch">
	<button
		type="button"
		class="view-single"
		class:heaven={view === 'heaven'}
		onclick={() => (view = view === 'alive' ? 'heaven' : 'alive')}
		aria-live="polite"
	>
		{#key view}
			<span class="view-label">{view === 'alive' ? '🐾 Manada' : 'Mi manada en el cielo 🌈'}</span>
		{/key}
		<span class="view-swap" aria-hidden="true">⇄</span>
	</button>
	<span class="tap-arrow" aria-hidden="true">⤵</span>
	</div>
	<div class="pack-grid">
		{#each pack as dog}
			<DogCard {dog} onselect={(d) => (selected = d)} />
		{/each}
	</div>
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
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0 0.75rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.intro {
		text-align: center;
		text-wrap: pretty;
		font-size: 1.125rem;
		max-width: 36rem;
		margin: 0 auto 1.5rem;
	}

	.view-single {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		width: 100%;
		min-height: 3.5rem;
		margin-bottom: 2rem;
		padding: 0.625rem 1.25rem;
		border-radius: 999px;
		border: 2px solid #7a3f16;
		background: rgb(255 255 255 / 0.8);
		box-shadow: 0 0.5rem 1.25rem rgb(122 63 22 / 0.25);
		font-family: var(--font-brand);
		font-size: 1.375rem;
		color: inherit;
		cursor: pointer;
		animation: view-nudge 0.9s ease 0.6s;
	}

	.view-single.heaven {
		justify-content: flex-end;
	}

	.view-swap {
		margin-left: auto;
		font-size: 1.5rem;
		color: #7a3f16;
		animation: swap-wiggle 1.6s ease-in-out 0.6s 3;
	}

	.view-single.heaven .view-swap {
		margin-left: 0;
		margin-right: auto;
		order: -1;
	}

	@keyframes view-nudge {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(0.375rem);
		}
		75% {
			transform: translateX(-0.375rem);
		}
	}

	@keyframes swap-wiggle {
		0%,
		100% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(-20deg) scale(1.15);
		}
		75% {
			transform: rotate(20deg) scale(1.15);
		}
	}

	.view-label {
		display: inline-block;
		animation: view-in-left 0.25s ease;
	}

	.view-single.heaven .view-label {
		animation-name: view-in-right;
	}

	@keyframes view-in-left {
		from {
			opacity: 0;
			transform: translateX(-1rem);
		}
	}

	@keyframes view-in-right {
		from {
			opacity: 0;
			transform: translateX(1rem);
		}
	}

	.view-switch {
		position: relative;
		margin-bottom: 2.5rem;
	}

	.view-switch .view-single {
		margin-bottom: 0;
	}

	.tap-arrow {
		position: absolute;
		right: 0.75rem;
		bottom: -1.75rem;
		z-index: 5;
		pointer-events: none;
		font-size: 2.5rem;
		line-height: 1;
		color: #7a3f16;
		filter: drop-shadow(0 3px 0 rgb(255 253 248)) drop-shadow(0 6px 12px rgb(122 63 22 / 0.45));
		animation: tap-arrow-rise 1.4s ease-in-out infinite;
	}

	@keyframes tap-arrow-rise {
		0%,
		100% {
			transform: rotate(172deg) translateY(0.25rem);
		}
		50% {
			transform: rotate(172deg) translateY(-0.25rem);
		}
	}

	.pack-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
	}

	@media (min-width: 48rem) {
		.view-switch {
			max-width: 40rem;
			margin-inline: auto;
		}
	}

	@media (min-width: 64rem) {
		.pack-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}
</style>
