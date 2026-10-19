<script lang="ts">
	import type { Dog } from '#lib/data/types';
	import { isLightColor } from '#lib/data/color';
	import { formatDogAge } from '#lib/data/format';

	interface Props {
		dog: Dog;
		href: string;
	}

	let { dog, href }: Props = $props();

	/** Color principal del perrito; ausente = marrón de la marca. */
	let accent = $derived(dog.color ?? '#7a3f16');

	let light = $derived(isLightColor(accent));
	let outline = $derived(light ? '#000' : accent);
</script>

<a
	class="dog-hero"
	{href}
	aria-label="Ver a {dog.name} en la manada"
	style="--dog: {accent}; --dog-ink: {outline}"
>
	<span class="photo" class:no-photo={!dog.photo}>
		{#if dog.photo}
			<img src={dog.photo} alt="" loading="lazy" decoding="async" />
		{:else}
			<span class="initial">{dog.name.charAt(0)}</span>
			<span class="paw">🐾</span>
		{/if}
	</span>
	<span class="caption">
		<span class="name" class:flat={!light}>{dog.name}</span>
		<span class="age">{formatDogAge(dog.birthDate, dog.isApprox)}</span>
	</span>
</a>

<style>
	.dog-hero {
		--dog: #7a3f16;
		position: relative;
		display: block;
		width: 100%;
		overflow: clip;
		border-radius: 1.5rem;
		border: 4px solid color-mix(in srgb, var(--dog) 45%, white);
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	.photo {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 16 / 10;
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
		font-size: 6rem;
		line-height: 1;
		color: #fffdf8;
		-webkit-text-stroke: 4px #7a3f16;
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(122 63 22 / 0.6);
	}

	.paw {
		position: absolute;
		right: 1rem;
		bottom: 0.75rem;
		font-size: 2.5rem;
		opacity: 0.75;
	}

	/* Nombre sobre la foto. */
	.caption {
		position: absolute;
		inset: auto 0 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 1.25rem;
	}

	.name {
		font-family: var(--font-brand);
		font-size: 2.25rem;
		line-height: 1.1;
		color: var(--dog);
		-webkit-text-stroke: 4px var(--dog-ink, var(--dog));
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(0 0 0 / 0.6);
	}

	.name.flat {
		text-shadow: 0 6px 20px rgb(0 0 0 / 0.5);
	}

	.age {
		font-size: 1rem;
		color: #fffdf8;
		text-shadow: 0 2px 8px rgb(0 0 0 / 0.7);
	}

	@media (hover: hover) {
		.dog-hero:hover {
			transform: translateY(-0.25rem);
		}

		.dog-hero:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 48rem) {
		.name {
			font-size: 2.75rem;
		}
	}
</style>
