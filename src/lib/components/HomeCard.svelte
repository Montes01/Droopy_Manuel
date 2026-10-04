<script lang="ts">
	interface Props {
		href: string;
		src: string;
		alt: string;
		label: string;
		eager?: boolean;
	}

	let { href, src, alt, label, eager = false }: Props = $props();
</script>

<a class="photo-card" {href} aria-label={label}>
	<img {src} {alt} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : 'auto'} />
</a>

<style>
	.photo-card {
		display: block;
		overflow: clip;
		border-radius: 1.25rem;
		border: 4px solid rgb(128 128 128 / 0.7);
		outline: 1px solid rgb(0 0 0 / 0.1);
		margin: 0 0 1.5rem;
		max-width: none;
		box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 0.15);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.photo-card img {
		width: 100%;
		height: auto;
		transition: transform 0.3s ease;
	}

	@media (hover: hover) {
		.photo-card:hover {
			transform: translateY(-0.25rem);
			box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 0.22);
		}

		.photo-card:hover img {
			transform: scale(1.03);
		}

		.photo-card:active {
			transform: translateY(0);
		}
	}

	@media (min-width: 64rem) {
		.photo-card {
			margin: 0;
			max-width: none;
			align-self: center;
		}
	}
</style>
