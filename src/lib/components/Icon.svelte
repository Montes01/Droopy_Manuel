<script lang="ts">
	interface Props {
		/** Nombre del icono. */
		name: 'cart' | 'close' | 'plus' | 'minus' | 'trash' | 'arrow';
		/** Tamaño en px (square). */
		size?: number;
	}

	let { name, size = 24 }: Props = $props();

	const paths: Record<Props['name'], string> = {
		cart: 'M3 4h2.4l2.2 11.2a1 1 0 0 0 .98.8h9.3a1 1 0 0 0 .97-.76L21 8H6.4M10 20.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm9 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
		close: 'M6 6l12 12M18 6 6 18',
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		trash: 'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7',
		arrow: 'M5 12h14M13 6l6 6-6 6'
	};
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<path d={paths[name]} />
</svg>

<style>
	.icon {
		display: block;
		flex-shrink: 0;
	}
</style>
