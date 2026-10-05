<script lang="ts">
	import {
		emptyCheckoutForm,
		formatPrice,
		shippingOptions
	} from '#lib/data/shop';
	import { cart } from '#lib/stores/cart.svelte';
	import type { CheckoutForm } from '#lib/data/types';
	import { pageTitle, site, socials } from '#lib/site';

	const title = pageTitle('Carrito · Tienda solidaria');

	const whatsapp = socials.find((social) => social.label === 'WhatsApp')?.href ?? '';

	/** Flujo en una sola página: recap → formulario → confirmación. */
	type Step = 'recap' | 'form' | 'done';
	let step = $state<Step>('recap');

	let shippingId = $state(shippingOptions[0].id);
	let form = $state<CheckoutForm>({ ...emptyCheckoutForm });
	let submitting = $state(false);
	let orderCode = $state('');

	let shipping = $derived(shippingOptions.find((option) => option.id === shippingId)!);
	let total = $derived(cart.subtotal + shipping.price);

	function goToForm() {
		if (cart.isEmpty) return;
		step = 'form';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function backToRecap() {
		step = 'recap';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	/**
	 * Envío simulado. Cuando exista backend, reemplazar por `fetch` al servicio
	 * de correo real. Por ahora solo registra en consola.
	 */
	async function finalize(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;

		const payload = {
			customer: { ...form },
			shipping: { id: shipping.id, label: shipping.label, price: shipping.price },
			items: cart.items.map((item) => ({
				name: item.product.name,
				category: item.product.category,
				size: item.size,
				quantity: item.quantity,
				unitPrice: item.product.price,
				lineTotal: item.lineTotal
			})),
			subtotal: cart.subtotal,
			total
		};

		// Mock del servicio de correo.
		console.log('[tienda] Enviando correo de pedido (simulado):', payload);

		await new Promise((resolve) => setTimeout(resolve, 600));

		orderCode = `DM-${Date.now().toString(36).toUpperCase()}`;
		submitting = false;
		step = 'done';
		cart.clear();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	/** Enlace a WhatsApp con el mensaje de comprobante del pedido. */
	let voucherHref = $derived(
		`${whatsapp}?text=${encodeURIComponent(
			`¡Hola! Acabo de hacer el pedido ${orderCode} en la tienda solidaria por ${formatPrice(total)}. Les envío el comprobante de la transferencia 🧾🐾`
		)}`
	);

	/** Abre WhatsApp con el mensaje de comprobante y registra el envío simulado. */
	function sendVoucher() {
		console.log('[tienda] Enviando comprobante de pago (simulado):', {
			orderCode,
			name: `${form.firstName} ${form.lastName}`,
			email: form.email,
			total
		});
		window.open(voucherHref, '_blank', 'noopener,noreferrer');
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Carrito y compra solidaria de Droopy Manuel." />
	<meta name="robots" content="noindex" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
</svelte:head>

<main class="container cart-page">
	<a class="back-button" href="/tienda" aria-label="Volver a la tienda">
		<span aria-hidden="true">←</span>
	</a>

	{#if step === 'recap'}
		<h1 class="page-title">🛒 Tu carrito</h1>

		{#if cart.isEmpty}
			<p class="empty">Tu carrito está vacío. 🐾</p>
			<a class="primary-btn block" href="/tienda">Ir a la tienda</a>
		{:else}
			<ul class="line-list">
				{#each cart.items as item (item.category + item.slug + (item.size ?? ''))}
					<li class="line glass">
						<span class="line-photo" aria-hidden="true">
							{#if item.product.photo}
								<img src={item.product.photo} alt="" loading="lazy" decoding="async" />
							{:else}
								{item.product.name.charAt(0)}
							{/if}
						</span>

						<span class="line-info">
							<span class="line-name">{item.product.name}</span>
							{#if item.size}
								<span class="line-meta">Talla {item.size}</span>
							{/if}
							<span class="line-unit">{formatPrice(item.product.price, item.product.currency)} c/u</span>
						</span>

						<span class="line-qty">
							<button
								type="button"
								class="qty-btn"
								onclick={() => cart.setQuantity(item.category, item.slug, item.quantity - 1, item.size)}
								aria-label={`Quitar una unidad de ${item.product.name}`}
							>
								−
							</button>
							<span class="qty-value">{item.quantity}</span>
							<button
								type="button"
								class="qty-btn"
								onclick={() => cart.setQuantity(item.category, item.slug, item.quantity + 1, item.size)}
								aria-label={`Agregar una unidad de ${item.product.name}`}
							>
								+
							</button>
						</span>

						<span class="line-total">{formatPrice(item.lineTotal, item.product.currency)}</span>

						<button
							type="button"
							class="remove-btn"
							onclick={() => cart.remove(item.category, item.slug, item.size)}
							aria-label={`Eliminar ${item.product.name} del carrito`}
						>
							✕
						</button>
					</li>
				{/each}
			</ul>

			<section class="summary glass" aria-labelledby="summary-title">
				<h2 id="summary-title" class="summary-title">Resumen</h2>

				<dl class="summary-rows">
					<div class="summary-row">
						<dt>Productos</dt>
						<dd>{formatPrice(cart.subtotal)}</dd>
					</div>

					<div class="summary-row shipping">
						<dt>Envío</dt>
						<dd>
							<fieldset class="shipping-options">
								<legend class="sr-only">Elige el tipo de envío</legend>
								{#each shippingOptions as option (option.id)}
									<label class="shipping-option" class:active={shippingId === option.id}>
										<input
											type="radio"
											name="shipping"
											value={option.id}
											checked={shippingId === option.id}
											onchange={() => (shippingId = option.id)}
										/>
										<span class="shipping-text">
											<span class="shipping-label">{option.label}</span>
											<span class="shipping-detail">{option.detail}</span>
										</span>
										<span class="shipping-price">
											{option.price === 0 ? 'Gratis' : formatPrice(option.price)}
										</span>
									</label>
								{/each}
							</fieldset>
						</dd>
					</div>

					<div class="summary-row total">
						<dt>Total</dt>
						<dd>{formatPrice(total)}</dd>
					</div>
				</dl>

				<button type="button" class="primary-btn block" onclick={goToForm}>Comprar</button>
			</section>
		{/if}
	{:else if step === 'form'}
		<h1 class="page-title">📝 Datos de tu compra</h1>

		<form class="form glass" onsubmit={finalize}>
			<div class="field-grid">
				<label class="field">
					<span>Nombre</span>
					<input type="text" bind:value={form.firstName} required autocomplete="given-name" />
				</label>

				<label class="field">
					<span>Apellido</span>
					<input type="text" bind:value={form.lastName} required autocomplete="family-name" />
				</label>

				<label class="field">
					<span>País</span>
					<input type="text" bind:value={form.country} required autocomplete="country-name" />
				</label>

				<label class="field">
					<span>Dirección</span>
					<input type="text" bind:value={form.address} required autocomplete="street-address" />
				</label>

				<label class="field">
					<span>Ciudad</span>
					<input type="text" bind:value={form.city} required autocomplete="address-level2" />
				</label>

				<label class="field">
					<span>Teléfono</span>
					<input type="tel" bind:value={form.phone} required autocomplete="tel" />
				</label>

				<label class="field field-wide">
					<span>Correo electrónico</span>
					<input type="email" bind:value={form.email} required autocomplete="email" />
				</label>

				<label class="field field-wide">
					<span>Notas adicionales</span>
					<textarea bind:value={form.notes} rows="4" placeholder="Barrio, referencia, horario…"></textarea>
				</label>
			</div>

			<div class="form-actions">
				<button type="button" class="secondary-btn" onclick={backToRecap} disabled={submitting}>
					← Volver
				</button>
				<button type="submit" class="primary-btn" disabled={submitting}>
					{submitting ? 'Enviando…' : 'Finalizar compra'}
				</button>
			</div>
		</form>
	{:else}
		<h1 class="page-title">💛 ¡Gracias por tu compra!</h1>

		<section class="done glass">
			<p class="order-code">Pedido <strong>{orderCode}</strong></p>

			<p class="done-text">
				Tu pedido quedó registrado. El pago se hace por <strong>transferencia bancaria</strong>.
				Cuando confirmemos el pago, empezamos a preparar tu pedido.
			</p>

			<div class="bank-box">
				<p class="bank-title">Datos para la transferencia</p>
				<dl class="bank-rows">
					<div><dt>Banco</dt><dd>Bancolombia</dd></div>
					<div><dt>Tipo de cuenta</dt><dd>Ahorros</dd></div>
					<div><dt>Número</dt><dd>1234567890</dd></div>
					<div><dt>Titular</dt><dd>Fundación Animales de Droopy Manuel</dd></div>
					<div><dt>Monto</dt><dd>{formatPrice(total)}</dd></div>
				</dl>
			</div>

			<p class="done-note">
				Realiza la transferencia por <strong>{formatPrice(total)}</strong> y luego envíanos el
				comprobante. En cuanto lo verifiquemos, empezamos a alistar tu pedido. 🐾
			</p>

			<button type="button" class="primary-btn block" onclick={sendVoucher}>
				Enviar comprobante
			</button>

			<a class="secondary-link" href="/tienda">← Seguir comprando</a>
		</section>
	{/if}
</main>

<style>
	.cart-page {
		padding-bottom: 3rem;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--tap-min);
		height: var(--tap-min);
		margin-top: 1rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.8);
		border: 1px solid rgb(0 0 0 / 0.1);
		color: #7a3f16;
		font-size: 1.5rem;
		line-height: 1;
		text-decoration: none;
	}

	.page-title {
		font-family: var(--font-brand);
		font-weight: 400;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.75rem, 7vw, 2.5rem);
		line-height: 1.15;
		margin: 0.75rem 0 1.5rem;
		color: #7a3f16;
	}

	.empty {
		text-align: center;
		font-size: 1.125rem;
		margin-block: 1.5rem;
	}

	/* --- Líneas del carrito --- */

	.line-list {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}

	.line {
		display: grid;
		grid-template-columns: 3rem 1fr auto auto;
		grid-template-areas:
			'photo info qty remove'
			'photo info total total';
		align-items: center;
		gap: 0.5rem 0.75rem;
		padding: 0.875rem;
		border-radius: 1rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.line-photo {
		grid-area: photo;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
		overflow: clip;
		font-family: var(--font-brand);
		font-size: 1.75rem;
		color: #fffdf8;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
		text-shadow:
			-1px -1px 0 #7a3f16,
			1px 1px 0 #7a3f16,
			0 2px 6px rgb(122 63 22 / 0.6);
	}

	.line-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.line-info {
		grid-area: info;
		display: grid;
		gap: 0.125rem;
		min-width: 0;
	}

	.line-name {
		font-family: var(--font-brand);
		font-size: 1.375rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.line-meta,
	.line-unit {
		font-size: 0.8125rem;
		opacity: 0.75;
	}

	.line-qty {
		grid-area: qty;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.qty-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid rgb(0 0 0 / 0.12);
		background: rgb(255 255 255 / 0.8);
		font-size: 1.125rem;
		cursor: pointer;
		color: inherit;
	}

	.qty-value {
		min-width: 1.75rem;
		text-align: center;
		font-weight: 700;
	}

	.line-total {
		grid-area: total;
		text-align: right;
		font-weight: 700;
	}

	.remove-btn {
		grid-area: remove;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 0;
		background: rgb(0 0 0 / 0.06);
		font-size: 1rem;
		cursor: pointer;
		color: inherit;
	}

	/* --- Resumen --- */

	.summary {
		padding: 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.summary-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.75rem;
		color: #7a3f16;
		margin-bottom: 1rem;
	}

	.summary-rows {
		display: grid;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.summary-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.summary-row dt {
		font-weight: 700;
	}

	.summary-row.total {
		padding-top: 0.75rem;
		border-top: 1px solid rgb(0 0 0 / 0.1);
		font-size: 1.25rem;
	}

	.summary-row.shipping {
		align-items: flex-start;
	}

	.shipping-options {
		border: 0;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.5rem;
	}

	.shipping-option {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.875rem;
		border: 2px solid transparent;
		background: rgb(255 255 255 / 0.7);
		cursor: pointer;
	}

	.shipping-option.active {
		border-color: #b7791f;
		background: rgb(255 250 240 / 0.95);
	}

	.shipping-option input {
		min-height: 0;
		accent-color: #b7791f;
	}

	.shipping-text {
		display: grid;
		min-width: 0;
	}

	.shipping-label {
		font-weight: 700;
	}

	.shipping-detail {
		font-size: 0.8125rem;
		opacity: 0.75;
	}

	.shipping-price {
		margin-left: auto;
		white-space: nowrap;
		font-weight: 700;
	}

	/* --- Formulario --- */

	.form {
		padding: 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.field-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.field {
		display: grid;
		gap: 0.375rem;
	}

	.field > span {
		font-weight: 700;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid rgb(0 0 0 / 0.15);
		background: rgb(255 255 255 / 0.9);
		color: inherit;
	}

	.field textarea {
		min-height: 6rem;
		resize: vertical;
	}

	.field input:focus-visible,
	.field textarea:focus-visible {
		outline: 3px solid #7a3f16;
		outline-offset: 2px;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	/* --- Botones --- */

	.primary-btn {
		min-height: var(--tap-min);
		padding: 0.75rem 1.75rem;
		border: 0;
		border-radius: 999px;
		background: #2e7d32;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		cursor: pointer;
		text-align: center;
		text-decoration: none;
	}

	.primary-btn.block {
		display: block;
		width: 100%;
	}

	.primary-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.secondary-btn {
		min-height: var(--tap-min);
		padding: 0.75rem 1.5rem;
		border: 2px solid #7a3f16;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.85);
		color: #7a3f16;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		cursor: pointer;
	}

	.secondary-link {
		display: inline-block;
		margin-top: 1.25rem;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		color: #7a3f16;
	}

	/* --- Confirmación --- */

	.done {
		padding: 1.5rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.order-code {
		font-size: 1.125rem;
		margin-bottom: 1rem;
	}

	.done-text {
		font-size: 1.0625rem;
		line-height: 1.6;
		margin-bottom: 1.25rem;
	}

	.bank-box {
		padding: 1rem;
		border-radius: 1rem;
		background: rgb(255 255 255 / 0.7);
		border: 1px solid rgb(0 0 0 / 0.06);
		margin-bottom: 1.25rem;
	}

	.bank-title {
		font-family: var(--font-brand);
		font-size: 1.375rem;
		color: #7a3f16;
		margin-bottom: 0.75rem;
	}

	.bank-rows {
		display: grid;
		gap: 0.5rem;
	}

	.bank-rows > div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.9375rem;
	}

	.bank-rows dt {
		opacity: 0.7;
	}

	.bank-rows dd {
		font-weight: 700;
		text-align: right;
	}

	.done-note {
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 1.25rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	@media (hover: hover) {
		.primary-btn:not(:disabled):hover {
			background: #388e3c;
		}

		.secondary-btn:hover {
			background: #fff8ef;
		}

		.qty-btn:hover,
		.remove-btn:hover {
			background: #f2f2f2;
		}

		.primary-btn:focus-visible,
		.secondary-btn:focus-visible,
		.qty-btn:focus-visible,
		.remove-btn:focus-visible,
		.shipping-option:focus-within {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	@media (min-width: 40rem) {
		.field-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.field-wide {
			grid-column: 1 / -1;
		}

		.line {
			grid-template-columns: 3.5rem 1fr auto auto auto;
			grid-template-areas: 'photo info qty total remove';
		}

		.line-photo {
			width: 3.5rem;
			height: 3.5rem;
		}
	}
</style>
