<script lang="ts">
	import { onMount } from 'svelte';
	import type { SiteAnnouncement } from '#lib/data/types';

	interface Props {
		announcement: SiteAnnouncement;
	}

	let { announcement }: Props = $props();

	/**
	 * Una vez cerrado no vuelve a salir en lo que resta del día. Se guarda la
	 * fecha (no un booleano) para que mañana el anuncio aparezca otra vez.
	 */
	const DISMISS_KEY = 'droopy-announcement-dismissed';

	let open = $state(false);
	let closeButton = $state<HTMLButtonElement>();

	function today(): string {
		const now = new Date();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${now.getFullYear()}-${month}-${day}`;
	}

	// El anuncio solo puede decidirse en el navegador: `localStorage` no
	// existe durante el render del servidor.
	onMount(() => {
		if (!announcement.enabled || announcement.dogs.length === 0) return;

		try {
			if (localStorage.getItem(DISMISS_KEY) === today()) return;
		} catch {
			// Almacenamiento bloqueado: mostrarlo igual, sin recordar el cierre.
		}

		open = true;
	});

	/** Congela el scroll del fondo y devuelve el foco al botón de cerrar. */
	$effect(() => {
		if (!open) return;

		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButton?.focus();

		return () => {
			document.body.style.overflow = previous;
		};
	});

	function dismiss() {
		open = false;
		try {
			localStorage.setItem(DISMISS_KEY, today());
		} catch {
			// Sin almacenamiento: se cerrará solo para esta visita.
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') dismiss();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="overlay"
		role="presentation"
		onclick={(event) => {
			// Solo cierra al pulsar el fondo, no al hacer clic dentro del panel.
			if (event.target === event.currentTarget) dismiss();
		}}
	>
		<div class="panel" role="dialog" aria-modal="true" aria-labelledby="announcement-title" tabindex="-1">
			<button
				class="close"
				type="button"
				bind:this={closeButton}
				onclick={dismiss}
				aria-label="Cerrar anuncio"
			>
				✕
			</button>

			{#if announcement.title}
				<h2 id="announcement-title">{announcement.title}</h2>
			{/if}
			{#if announcement.message}
				<p class="message">{announcement.message}</p>
			{/if}

			<ul class="dogs" class:centered={announcement.dogs.length < 5}>
				{#each announcement.dogs as dog (dog.slug)}
					<li>
						<a
							class="dog"
							href="/manada"
							aria-label="Conocer a {dog.name} en la manada"
							style="--dog: {dog.color ?? '#7a3f16'}"
						>
							<span class="photo" class:no-photo={!dog.photo}>
								{#if dog.photo}
									<img src={dog.photo} alt="" loading="lazy" decoding="async" />
								{:else}
									<span class="initial">{dog.name.charAt(0)}</span>
								{/if}
							</span>
							<span class="name">{dog.name}</span>
						</a>
					</li>
				{/each}
			</ul>

			<a class="cta" href="/manada">Conocer a la manada →</a>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		overflow-y: auto;
		background: rgb(30 20 10 / 0.55);
		backdrop-filter: blur(3px);
	}

	.panel {
		position: relative;
		width: min(46rem, 100%);
		max-height: calc(100dvh - 2rem);
		overflow-y: auto;
		padding: 1.75rem 1.5rem 1.5rem;
		border-radius: 1.25rem;
		border: 4px solid rgb(128 128 128 / 0.7);
		outline: 1px solid rgb(0 0 0 / 0.1);
		background: #fffdf8;
		box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 0.35);
		text-align: center;
	}

	.close {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 0;
		border-radius: 999px;
		background: rgb(122 63 22 / 0.1);
		color: #7a3f16;
		font-size: 1.125rem;
		cursor: pointer;
	}

	h2 {
		margin: 0 2rem 0.5rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: clamp(1.5rem, 5vw, 2.15rem);
		line-height: 1.15;
		color: #7a3f16;
	}

	.message {
		max-width: 34rem;
		margin: 0 auto 1.25rem;
		line-height: 1.5;
		color: #5b4632;
	}

	.dogs {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
		gap: 0.75rem;
		margin: 0 0 1.5rem;
		padding: 0;
		list-style: none;
	}

	/* Menos de 5: fila centrada, sin huecos a la derecha. */
	.dogs.centered {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.dogs.centered li {
		flex: 0 0 7.5rem;
		max-width: 100%;
	}

	.dog {
		display: block;
		overflow: clip;
		border-radius: 0.875rem;
		border: 3px solid color-mix(in srgb, var(--dog) 40%, white);
		background: #f5ece0;
		text-decoration: none;
		color: inherit;
		transition: transform 0.2s ease;
	}

	.photo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		background: #000;
	}

	.photo.no-photo {
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
	}

	.initial {
		font-family: var(--font-brand);
		font-size: 3rem;
		line-height: 1;
		color: #fffdf8;
		-webkit-text-stroke: 3px #7a3f16;
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(122 63 22 / 0.6);
	}

	.name {
		display: block;
		padding: 0.5rem 0.25rem 0.6rem;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		line-height: 1.1;
		color: var(--dog);
	}

	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.5rem 1.75rem;
		border-radius: 999px;
		background: #7a3f16;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	@media (hover: hover) {
		.dog:hover {
			transform: translateY(-0.2rem);
		}

		.cta:hover {
			transform: translateY(-0.15rem);
		}
	}

	@media (max-width: 30rem) {
		.panel {
			padding: 1.5rem 1rem 1.25rem;
		}

		.dogs {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
