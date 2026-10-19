<script lang="ts">
	import type { Dog } from '#lib/data/types';
	import DogCarouselCard from '#lib/components/DogCarouselCard.svelte';

	interface Props {
		dogs: Dog[];
		/** Destino de cada tarjeta y del botón "Ver más". */
		href?: string;
		/** Segundos que tarda cada perrito en cruzar. */
		secondsPerCard?: number;
	}

	let { dogs, href = '/manada', secondsPerCard = 4 }: Props = $props();

	/** En pausa mientras alguien mira o enfoca el riel. */
	let paused = $state(false);

	/** Segunda copia para que el bucle no tenga costura. */
	let reel = $derived([...dogs, ...dogs]);

	/** Velocidad constante: más perritos, más dura el ciclo. */
	let duration = $derived(dogs.length * secondsPerCard);
</script>

{#if dogs.length}
	<section
		class="carousel"
		aria-label="Manada comunitaria"
		onfocusin={() => (paused = true)}
		onfocusout={() => (paused = false)}
	>
		<p class="carousel-title">Un amor que ilumina vidas de 4 patas</p>
		<div class="stage">
			<div class="reel" class:paused style="--reel-duration: {duration}s">
				{#each reel as dog, i (i)}
					<div class="slide">
						<DogCarouselCard {dog} {href} />
					</div>
				{/each}
			</div>
		</div>
		<div class="foot">
			<a class="see-more" {href}>Ver manada →</a>
		</div>
	</section>
{/if}

<style>
	.carousel {
		text-align: center;
		margin-block: 2.5rem 2.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgb(122 63 22 / 0.18);
	}

	.carousel-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-wrap: balance;
		font-size: clamp(1.25rem, 5vw, 1.75rem);
		line-height: 1.2;
		margin: 0.5rem 0 0.75rem;
		-webkit-text-stroke: 4px #7a3f16;
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(122 63 22 / 0.6);
	}

	/* Ventana por la que pasa el riel: mismo ancho que el contenedor de la página. */
	.stage {
		/* Cada tarjeta ocupa 90vw por defecto, con tope de 550px. */
		--card-w: min(90vw, 550px);
		width: 100%;
		overflow: hidden;
		border-radius: 50px;
		padding: 1.25rem 0 0.5rem;
	}

	.reel {
		display: flex;
		width: max-content;
		animation: reel-shift var(--reel-duration, 20s) linear infinite;
	}

	.reel.paused {
		animation-play-state: paused;
	}

	.slide {
		flex: none;
		width: var(--card-w);
		margin-right: 1rem;
	}

	/* -50% = exactamente una copia (cada slide incluye su margen). */
	@keyframes reel-shift {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reel {
			animation: none;
		}
	}

	@media (max-width: 40rem) {
		.stage {
			border-radius: 20px;
		}
	}

	.foot {
		width: 100%;
		text-align: right;
	}

	.see-more {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		padding: 0.25rem 0;
		font-size: 1rem;
		text-decoration: underline;
		text-underline-offset: 0.2rem;
		color: #7a3f16;
		transition: opacity 0.2s ease;
	}

	@media (hover: hover) {
		.see-more:hover {
			opacity: 0.7;
		}
	}
</style>
