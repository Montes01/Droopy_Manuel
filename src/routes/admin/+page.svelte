<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/** Tarjetas del resumen. `null` significa que ese dato no se pudo cargar. */
	let cards = $derived([
		{ label: 'Pedidos', value: data.counts.orders, href: '/admin/pedidos' },
		{ label: 'Pendientes', value: data.counts.pendingOrders, href: '/admin/pedidos?status=pendiente' },
		{ label: 'Pagados', value: data.counts.paidOrders, href: '/admin/pedidos?paymentStatus=pagado' },
		{ label: 'Perritos', value: data.counts.dogs, href: '/admin/manada' },
		{ label: 'Destacados', value: data.counts.featured, href: '/admin/manada' },
		{ label: 'Productos', value: data.counts.items, href: '/admin/tienda' },
		{ label: 'Noticias', value: data.counts.news, href: '/admin/noticias' }
	]);
</script>

<svelte:head>
	<title>Resumen · Panel</title>
</svelte:head>

<h1>Resumen</h1>
<p class="lead">Estado actual de la fundación.</p>

<ul class="cards">
	{#each cards as card (card.label)}
		<li>
			<a href={card.href}>
				<span class="value">{card.value ?? '—'}</span>
				<span class="label">{card.label}</span>
			</a>
		</li>
	{/each}
</ul>

{#if data.counts.orders === null}
	<p class="warning">
		No se pudieron leer los pedidos. Comprueba que la API esté encendida.
	</p>
{/if}

<style>
	h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	.lead {
		margin: 0 0 1.5rem;
		color: #5b6470;
	}

	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
		gap: 0.75rem;
	}

	.cards a {
		display: grid;
		gap: 0.25rem;
		padding: 1rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
		text-decoration: none;
		color: inherit;
	}

	.cards a:hover {
		border-color: #9aa3af;
	}

	.value {
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1;
	}

	.label {
		font-size: 0.875rem;
		color: #5b6470;
	}

	.warning {
		margin-top: 1.5rem;
		padding: 0.75rem;
		background: #fffbeb;
		border: 1px solid #fde68a;
		border-radius: 0.5rem;
		color: #92400e;
		font-size: 0.9375rem;
	}
</style>
