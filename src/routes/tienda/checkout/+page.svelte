<script lang="ts">
	import BankAccountCard from '#lib/components/BankAccount.svelte';
	import OrderRecap from '#lib/components/OrderRecap.svelte';
	import TransferInfo from '#lib/components/TransferInfo.svelte';
	import { bankAccounts } from '#lib/data/fundraisers';
	import { pageTitle } from '#lib/site';
	import { useCart } from '#lib/stores/cart.svelte';

	const title = pageTitle('Finalizar compra');
	const cart = useCart();

	type Form = {
		nombres: string;
		apellidos: string;
		pais: string;
		direccion: string;
		ciudad: string;
		telefono: string;
		email: string;
		notas: string;
	};

	let form = $state<Form>({
		nombres: '',
		apellidos: '',
		pais: 'Colombia',
		direccion: '',
		ciudad: '',
		telefono: '',
		email: '',
		notas: ''
	});

	let errors = $state<Partial<Record<keyof Form, string>>>({});
	let submitted = $state(false);
	let orderNumber = $state('');
	let confirmedTotal = $state(0);
	/** Snapshot del pedido al confirmar: el carrito se vacía después. */
	let confirmedLines = $state<{ name: string; quantity: number; total: number }[]>([]);
	let confirmedShipping = $state('');

	const empty = $derived(cart.lines.length === 0);

	function validate(): boolean {
		const next: Partial<Record<keyof Form, string>> = {};
		if (!form.nombres.trim()) next.nombres = 'Ingresa tu nombre.';
		if (!form.apellidos.trim()) next.apellidos = 'Ingresa tus apellidos.';
		if (!form.pais.trim()) next.pais = 'Selecciona tu país o región.';
		if (!form.direccion.trim()) next.direccion = 'Ingresa tu dirección.';
		if (!form.ciudad.trim()) next.ciudad = 'Ingresa tu localidad o ciudad.';
		if (!form.telefono.trim()) next.telefono = 'Ingresa tu teléfono.';
		if (!form.email.trim()) next.email = 'Ingresa tu correo electrónico.';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
			next.email = 'Ingresa un correo válido.';
		errors = next;
		return Object.keys(next).length === 0;
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!validate() || empty) return;

		const totals = cart.totals;
		orderNumber = 'DM-' + Date.now().toString(36).toUpperCase().slice(-6);
		confirmedTotal = totals.total;
		confirmedShipping =
			cart.shipping === 'domicilio' ? 'Envío a domicilio (+$6.000)' : 'Recogida local (gratis)';
		confirmedLines = cart.lines.map((line) => ({
			name: line.item.name,
			quantity: line.quantity,
			total: line.item.price * line.quantity
		}));
		cart.clear();
		submitted = true;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function formatCOP(value: number): string {
		return '$' + value.toLocaleString('es-CO');
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Completa tus datos y finaliza tu compra solidaria." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="container checkout-page">
	{#if submitted}
		<p class="tagline">💛 ¡Gracias por tu compra! 💛</p>
		<div class="confirm-layout">
			<section class="confirm glass" aria-labelledby="confirm-title">
				<h2 class="section-title" id="confirm-title">Pedido {orderNumber}</h2>
				<p class="confirm-lead">
					Guarda tu número de pedido: es la referencia para tu transferencia.
				</p>

				<ul class="confirm-lines">
					{#each confirmedLines as line}
						<li>
							<span>{line.quantity} × {line.name}</span>
							<span>{formatCOP(line.total)}</span>
						</li>
					{/each}
				</ul>

				<dl class="confirm-totals">
					<div>
						<dt>Entrega</dt>
						<dd>{confirmedShipping}</dd>
					</div>
					<div class="confirm-grand">
						<dt>Total a transferir</dt>
						<dd>{formatCOP(confirmedTotal)}</dd>
					</div>
				</dl>

				<h3 class="accounts-title">🏦 Cuentas para transferir</h3>
				<div class="bank-list">
					{#each bankAccounts as account (account.bank)}
						<BankAccountCard {account} />
					{/each}
				</div>
			</section>

			<div class="confirm-aside">
				<TransferInfo />
				<a class="ghost-btn" href="/tienda">← Seguir comprando</a>
			</div>
		</div>
	{:else if empty}
		<p class="tagline">🛒 Tu carrito está vacío</p>
		<div class="empty glass">
			<p>Agrega productos antes de finalizar la compra.</p>
			<a class="primary-btn" href="/tienda">Ir a la tienda</a>
		</div>
	{:else}
		<p class="tagline">🧾 Finalizar compra 🧾</p>

		<div class="checkout-layout">
			<form class="checkout-form glass" onsubmit={submit} novalidate>
				<h2 class="section-title">Datos de envío</h2>

				<div class="field">
					<label for="nombres">Nombre *</label>
					<input
						id="nombres"
						type="text"
						bind:value={form.nombres}
						autocomplete="given-name"
						placeholder="Tu nombre"
						required
						aria-invalid={errors.nombres ? 'true' : undefined}
					/>
					{#if errors.nombres}<span class="error">{errors.nombres}</span>{/if}
				</div>

				<div class="field">
					<label for="apellidos">Apellidos *</label>
					<input
						id="apellidos"
						type="text"
						bind:value={form.apellidos}
						autocomplete="family-name"
						placeholder="Tus apellidos"
						required
						aria-invalid={errors.apellidos ? 'true' : undefined}
					/>
					{#if errors.apellidos}<span class="error">{errors.apellidos}</span>{/if}
				</div>

				<div class="field">
					<label for="pais">País / Región *</label>
					<select id="pais" bind:value={form.pais} autocomplete="country-name" required>
						<option value="Colombia">Colombia</option>
						<option value="Otro">Otro</option>
					</select>
					{#if errors.pais}<span class="error">{errors.pais}</span>{/if}
				</div>

				<div class="field">
					<label for="direccion">Dirección de la calle *</label>
					<input
						id="direccion"
						type="text"
						bind:value={form.direccion}
						autocomplete="street-address"
						placeholder="Número de la casa y nombre de la calle"
						required
						aria-invalid={errors.direccion ? 'true' : undefined}
					/>
					{#if errors.direccion}<span class="error">{errors.direccion}</span>{/if}
				</div>

				<div class="field">
					<label for="ciudad">Localidad / Ciudad *</label>
					<input
						id="ciudad"
						type="text"
						bind:value={form.ciudad}
						autocomplete="address-level2"
						placeholder="Tu ciudad o localidad"
						required
						aria-invalid={errors.ciudad ? 'true' : undefined}
					/>
					{#if errors.ciudad}<span class="error">{errors.ciudad}</span>{/if}
				</div>

				<div class="field">
					<label for="telefono">Teléfono *</label>
					<input
						id="telefono"
						type="tel"
						bind:value={form.telefono}
						autocomplete="tel"
						placeholder="Ej. 322 643 8857"
						required
						aria-invalid={errors.telefono ? 'true' : undefined}
					/>
					{#if errors.telefono}<span class="error">{errors.telefono}</span>{/if}
				</div>

				<div class="field">
					<label for="email">Dirección de correo electrónico *</label>
					<input
						id="email"
						type="email"
						bind:value={form.email}
						autocomplete="email"
						placeholder="tucorreo@ejemplo.com"
						required
						aria-invalid={errors.email ? 'true' : undefined}
					/>
					{#if errors.email}<span class="error">{errors.email}</span>{/if}
				</div>

				<div class="field">
					<label for="notas">Información adicional <span class="optional">(opcional)</span></label>
					<textarea
						id="notas"
						bind:value={form.notas}
						rows="3"
						placeholder="Indicaciones para la entrega, dedicatorias, etc."
					></textarea>
				</div>

				<button type="submit" class="primary-btn submit-btn">
					Finalizar compra · {formatCOP(cart.totals.total)}
				</button>
			</form>

			<div class="checkout-aside">
				<OrderRecap lines={cart.lines} shipping={cart.shipping} selectable={false} />
				<TransferInfo />
			</div>
		</div>
	{/if}
</main>

<style>
	.checkout-page {
		padding-bottom: 4rem;
	}

	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0 1.25rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.checkout-layout,
	.confirm-layout {
		display: grid;
		gap: 2rem;
	}

	.checkout-form,
	.confirm {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: 1.5rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.section-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.75rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.field {
		display: grid;
		gap: 0.375rem;
	}

	.field label {
		font-weight: 700;
		font-size: 0.9375rem;
	}

	.optional {
		font-weight: 400;
		opacity: 0.6;
	}

	.field input,
	.field select,
	.field textarea {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border-radius: 0.75rem;
		border: 2px solid rgb(0 0 0 / 0.15);
		background: rgb(255 255 255 / 0.85);
		color: inherit;
	}

	.field textarea {
		min-height: 5rem;
		resize: vertical;
	}

	.field input:focus-visible,
	.field select:focus-visible,
	.field textarea:focus-visible {
		outline: 3px solid #7a3f16;
		outline-offset: 1px;
		border-color: #7a3f16;
	}

	.field input[aria-invalid='true'] {
		border-color: #c62828;
	}

	.error {
		font-size: 0.8125rem;
		color: #c62828;
		font-weight: 700;
	}

	.primary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.75rem 1.75rem;
		border: 0;
		border-radius: 999px;
		background: #2e7d32;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		text-decoration: none;
		cursor: pointer;
	}

	.submit-btn {
		margin-top: 0.5rem;
	}

	.ghost-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.5rem 1.25rem;
		border-radius: 999px;
		border: 2px solid #7a3f16;
		background: rgb(255 255 255 / 0.85);
		color: #7a3f16;
		font-family: var(--font-brand);
		font-size: 1.125rem;
		text-decoration: none;
		cursor: pointer;
	}

	.checkout-aside,
	.confirm-aside {
		display: grid;
		gap: 1.25rem;
		align-content: start;
	}

	.empty {
		display: grid;
		justify-items: center;
		gap: 1rem;
		padding: 3rem 1.5rem;
		border-radius: 1.5rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		text-align: center;
		font-size: 1.125rem;
	}

	/* --- Confirmación --- */

	.confirm-lead {
		opacity: 0.85;
	}

	.confirm-lines {
		list-style: none;
		display: grid;
		gap: 0.5rem;
		padding: 0;
	}

	.confirm-lines li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.confirm-totals {
		display: grid;
		gap: 0.5rem;
		border-top: 1px solid rgb(0 0 0 / 0.1);
		padding-top: 0.75rem;
	}

	.confirm-totals > div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.confirm-totals dd {
		font-weight: 700;
	}

	.confirm-grand dt,
	.confirm-grand dd {
		font-family: var(--font-brand);
		font-size: 1.75rem;
		color: #7a3f16;
	}

	.accounts-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.5rem;
		color: #7a3f16;
		margin-top: 0.5rem;
	}

	.bank-list {
		display: grid;
		gap: 1rem;
	}

	@media (hover: hover) {
		.primary-btn:hover {
			background: #388e3c;
		}

		.ghost-btn:hover {
			background: #fff8ef;
		}

		.primary-btn:focus-visible,
		.ghost-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 64rem) {
		.checkout-layout,
		.confirm-layout {
			grid-template-columns: 1.4fr 1fr;
			align-items: start;
			gap: 2.5rem;
		}

		.checkout-aside,
		.confirm-aside {
			position: sticky;
			top: 5.5rem;
		}

		.bank-list {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
