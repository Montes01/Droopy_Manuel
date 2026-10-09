<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import type { Order } from '#lib/data/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/** Pedido abierto en el detalle; `null` = ninguno. */
	let openOrder = $state<Order | null>(null);

	/** Filtros del formulario, inicializados desde la URL. */
	let q = $state(data.filters.q);
	let status = $state(data.filters.status);
	let paymentStatus = $state(data.filters.paymentStatus);

	const statusLabels: Record<string, string> = {
		pendiente: 'Pendiente',
		confirmado: 'Confirmado',
		enviado: 'Enviado',
		entregado: 'Entregado',
		cancelado: 'Cancelado'
	};

	const paymentLabels: Record<string, string> = {
		'sin-pago': 'Sin pago',
		'en-revision': 'En revisión',
		pagado: 'Pagado',
		rechazado: 'Rechazado'
	};

	function formatCOP(cents: number): string {
		return '$' + Math.round(cents / 100).toLocaleString('es-CO');
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('es-CO', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/** Aplica los filtros recargando con la URL actualizada. */
	function applyFilters(event: SubmitEvent) {
		event.preventDefault();
		const params = new URLSearchParams();
		if (status) params.set('status', status);
		if (paymentStatus) params.set('paymentStatus', paymentStatus);
		if (q.trim()) params.set('q', q.trim());
		const query = params.toString();
		goto(`/admin/pedidos${query ? `?${query}` : ''}`, { keepFocus: true });
	}

	function clearFilters() {
		q = '';
		status = '';
		paymentStatus = '';
		goto('/admin/pedidos', { keepFocus: true });
	}

	/** Copia el resumen del pedido como texto, para pegarlo en WhatsApp. */
	async function copySummary(order: Order) {
		const lines = [
			`Pedido ${order.orderNumber}`,
			`${order.customer.nombres} ${order.customer.apellidos} · ${order.customer.telefono}`,
			`${order.customer.direccion}, ${order.customer.ciudad}`,
			'',
			...order.lines.map((l) => `${l.quantity} × ${l.name} — ${formatCOP(l.totalCents)}`),
			'',
			`Envío (${order.shippingLabel}): ${order.shippingCents === 0 ? 'Gratis' : formatCOP(order.shippingCents)}`,
			`TOTAL: ${formatCOP(order.totalCents)}`
		].join('\n');

		try {
			await navigator.clipboard.writeText(lines);
		} catch {
			// Sin permiso de portapapeles: no es crítico, se ignora.
		}
	}

	let hasFilters = $derived(Boolean(data.filters.q || data.filters.status || data.filters.paymentStatus));
</script>

<svelte:head>
	<title>Pedidos · Panel</title>
</svelte:head>

<header class="head">
	<div>
		<h1>Pedidos</h1>
		<p class="lead">
			{data.total}
			{data.total === 1 ? 'pedido' : 'pedidos'}{hasFilters ? ' con los filtros aplicados' : ' en total'}.
		</p>
	</div>
</header>

{#if form?.error}
	<p class="alert error" role="alert">{form.error}</p>
{/if}
{#if form?.success}
	<p class="alert ok" role="status">{form.message}</p>
{/if}

<form class="filters" onsubmit={applyFilters}>
	<label>
		Buscar
		<input name="q" bind:value={q} placeholder="Número, correo o nombre" />
	</label>
	<label>
		Estado
		<select name="status" bind:value={status}>
			<option value="">Todos</option>
			{#each data.statuses as option (option)}
				<option value={option}>{statusLabels[option] ?? option}</option>
			{/each}
		</select>
	</label>
	<label>
		Pago
		<select name="paymentStatus" bind:value={paymentStatus}>
			<option value="">Todos</option>
			{#each data.paymentStatuses as option (option)}
				<option value={option}>{paymentLabels[option] ?? option}</option>
			{/each}
		</select>
	</label>
	<div class="filter-actions">
		<button class="primary" type="submit">Filtrar</button>
		{#if hasFilters}
			<button class="ghost" type="button" onclick={clearFilters}>Limpiar</button>
		{/if}
	</div>
</form>

{#if data.orders.length === 0}
	<p class="empty">
		{hasFilters ? 'Ningún pedido coincide con los filtros.' : 'Todavía no hay pedidos.'}
	</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Pedido</th>
				<th>Cliente</th>
				<th>Fecha</th>
				<th>Entrega</th>
				<th>Total</th>
				<th>Estado</th>
				<th>Pago</th>
				<th class="right">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each data.orders as order (order.orderNumber)}
				<tr>
					<td><code>{order.orderNumber}</code></td>
					<td>
						<strong>{order.customer.nombres} {order.customer.apellidos}</strong>
						<span class="sub">{order.customer.email}</span>
					</td>
					<td class="nowrap">{formatDate(order.createdAt)}</td>
					<td>{order.shippingLabel}</td>
					<td class="nowrap"><strong>{formatCOP(order.totalCents)}</strong></td>
					<td>
						<span class="tag status-{order.status}">{statusLabels[order.status]}</span>
					</td>
					<td>
						<span class="tag pay-{order.paymentStatus}">{paymentLabels[order.paymentStatus]}</span>
					</td>
					<td class="right">
						<div class="row-actions">
							<button class="icon" onclick={() => (openOrder = order)} title="Ver detalle">👁</button>
							<button class="icon" onclick={() => copySummary(order)} title="Copiar resumen">⧉</button>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

{#if openOrder}
	<!-- Detalle del pedido, en un panel lateral sobre la lista. -->
	<div
		class="overlay"
		role="button"
		tabindex="-1"
		onclick={() => (openOrder = null)}
		onkeydown={(event) => {
			if (event.key === 'Escape') openOrder = null;
		}}
	></div>

	<aside class="drawer" aria-label={`Detalle del pedido ${openOrder.orderNumber}`}>
		<header class="drawer-head">
			<h2>Pedido {openOrder.orderNumber}</h2>
			<button class="icon" onclick={() => (openOrder = null)} title="Cerrar">✕</button>
		</header>

		<p class="when">{formatDate(openOrder.createdAt)}</p>

		<section>
			<h3>Cliente</h3>
			<dl class="data">
				<dt>Nombre</dt>
				<dd>{openOrder.customer.nombres} {openOrder.customer.apellidos}</dd>
				<dt>Correo</dt>
				<dd><a href={`mailto:${openOrder.customer.email}`}>{openOrder.customer.email}</a></dd>
				<dt>Teléfono</dt>
				<dd>{openOrder.customer.telefono}</dd>
				<dt>Dirección</dt>
				<dd>{openOrder.customer.direccion}, {openOrder.customer.ciudad}, {openOrder.customer.pais}</dd>
				{#if openOrder.customer.notas}
					<dt>Notas</dt>
					<dd>{openOrder.customer.notas}</dd>
				{/if}
			</dl>
		</section>

		<section>
			<h3>Productos</h3>
			<ul class="lines">
				{#each openOrder.lines as line (line.name)}
					<li>
						<span>{line.quantity} × {line.name}</span>
						<span>{formatCOP(line.totalCents)}</span>
					</li>
				{/each}
			</ul>
			<dl class="totals">
				<dt>Subtotal</dt>
				<dd>{formatCOP(openOrder.subtotalCents)}</dd>
				<dt>Envío ({openOrder.shippingLabel})</dt>
				<dd>{openOrder.shippingCents === 0 ? 'Gratis' : formatCOP(openOrder.shippingCents)}</dd>
				<dt class="grand">Total</dt>
				<dd class="grand">{formatCOP(openOrder.totalCents)}</dd>
			</dl>
		</section>

		<section>
			<h3>Estado</h3>
			<form
				method="POST"
				action="?/updateStatus"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						openOrder = null;
					};
				}}
			>
				<input type="hidden" name="orderNumber" value={openOrder.orderNumber} />

				<label>
					Estado del pedido
					<select name="status" value={openOrder.status}>
						{#each data.statuses as option (option)}
							<option value={option}>{statusLabels[option] ?? option}</option>
						{/each}
					</select>
				</label>

				<label>
					Estado del pago
					<select name="paymentStatus" value={openOrder.paymentStatus}>
						{#each data.paymentStatuses as option (option)}
							<option value={option}>{paymentLabels[option] ?? option}</option>
						{/each}
					</select>
				</label>

				<div class="actions">
					<button class="primary" type="submit">Guardar estado</button>
					<button class="ghost" type="button" onclick={() => copySummary(openOrder!)}>
						Copiar resumen
					</button>
				</div>
			</form>
		</section>

		<p class="foot">
			Los pedidos no se borran: son el registro de lo que se vendió. Si algo se cancela, cámbialo a
			«Cancelado».
		</p>
	</aside>
{/if}

<style>
	h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	h2 {
		margin: 0;
		font-size: 1.125rem;
	}

	h3 {
		margin: 1rem 0 0.5rem;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #5b6470;
	}

	.head {
		margin-bottom: 1.25rem;
	}

	.lead {
		margin: 0;
		color: #5b6470;
	}

	.alert {
		margin: 0 0 1rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
	}

	.alert.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #b91c1c;
	}

	.alert.ok {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #15803d;
	}

	.filters {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding: 0.875rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
		flex-wrap: wrap;
	}

	.filters label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.filter-actions {
		display: flex;
		gap: 0.375rem;
	}

	input,
	select,
	textarea {
		padding: 0.5rem 0.625rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		font: inherit;
		font-weight: 400;
	}

	.empty {
		padding: 2rem;
		text-align: center;
		color: #5b6470;
		background: #fff;
		border: 1px dashed #ccd2d9;
		border-radius: 0.625rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
		overflow: hidden;
		font-size: 0.9375rem;
	}

	th,
	td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #eef0f3;
		vertical-align: middle;
	}

	th {
		background: #f9fafb;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #5b6470;
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	.right {
		text-align: right;
	}

	.nowrap {
		white-space: nowrap;
	}

	code {
		font-size: 0.8125rem;
		background: #f1f3f5;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
	}

	.sub {
		display: block;
		font-size: 0.8125rem;
		color: #5b6470;
	}

	.tag {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 1rem;
		font-size: 0.8125rem;
		white-space: nowrap;
		background: #f1f3f5;
		color: #374151;
	}

	.status-pendiente {
		background: #fffbeb;
		color: #92400e;
	}

	.status-confirmado {
		background: #eff6ff;
		color: #1d4ed8;
	}

	.status-enviado {
		background: #eef2ff;
		color: #3730a3;
	}

	.status-entregado {
		background: #f0fdf4;
		color: #15803d;
	}

	.status-cancelado {
		background: #fef2f2;
		color: #b91c1c;
	}

	.pay-pagado {
		background: #f0fdf4;
		color: #15803d;
	}

	.pay-sin-pago {
		background: #fffbeb;
		color: #92400e;
	}

	.pay-rechazado {
		background: #fef2f2;
		color: #b91c1c;
	}

	.row-actions {
		display: inline-flex;
		gap: 0.25rem;
	}

	button.primary {
		padding: 0.5rem 0.875rem;
		border: 0;
		border-radius: 0.375rem;
		background: #1f2937;
		color: #fff;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	button.ghost {
		padding: 0.5rem 0.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		font: inherit;
		cursor: pointer;
	}

	.icon {
		width: 1.875rem;
		height: 1.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		cursor: pointer;
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgb(15 23 42 / 0.35);
		border: 0;
		cursor: pointer;
		z-index: 20;
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(28rem, 92vw);
		overflow-y: auto;
		padding: 1.25rem;
		background: #fff;
		box-shadow: -2px 0 12px rgb(0 0 0 / 0.12);
		z-index: 21;
	}

	.drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.when {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: #5b6470;
	}

	.data,
	.totals {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.25rem 0.75rem;
		margin: 0;
		font-size: 0.9375rem;
	}

	.data dt,
	.totals dt {
		color: #5b6470;
	}

	.data dd,
	.totals dd {
		margin: 0;
	}

	.data a {
		color: #2563eb;
	}

	.lines {
		list-style: none;
		margin: 0 0 0.75rem;
		padding: 0;
		display: grid;
		gap: 0.25rem;
		font-size: 0.9375rem;
	}

	.lines li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.totals .grand {
		border-top: 1px solid #e2e5e9;
		padding-top: 0.375rem;
		font-weight: 700;
		margin-top: 0.25rem;
	}

	.drawer form {
		display: grid;
		gap: 0.625rem;
	}

	.drawer label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.foot {
		margin-top: 1.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid #e2e5e9;
		font-size: 0.8125rem;
		color: #5b6470;
		line-height: 1.5;
	}
</style>
