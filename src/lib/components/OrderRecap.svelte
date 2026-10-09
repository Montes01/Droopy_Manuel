<script lang="ts">
	import { cartLineKey, formatCOP, unitPriceCents } from '#lib/data/format';
	import type { CartLine, ShippingId, ShippingOption } from '#lib/data/types';

	interface Props {
		lines: CartLine[];
		shipping: ShippingId;
		/** Opciones de entrega traídas de la API. */
		shippingOptions: ShippingOption[];
		onShippingChange?: (id: ShippingId) => void;
		/** Cuando es false, los envíos se muestran como dato fijo (checkout). */
		selectable?: boolean;
	}

	let { lines, shipping, shippingOptions, onShippingChange, selectable = true }: Props = $props();

	let subtotalCents = $derived(
		lines.reduce((sum, line) => sum + unitPriceCents(line.item, line.variant) * line.quantity, 0)
	);
	let selected = $derived(shippingOptions.find((option) => option.id === shipping)!);
	let shippingCents = $derived(selected.costCents);
	let totalCents = $derived(subtotalCents + shippingCents);
</script>

<section class="recap glass" aria-labelledby="recap-title">
	<h2 class="recap-title" id="recap-title">Resumen del pedido</h2>

	{#if lines.length === 0}
		<p class="recap-empty">Tu carrito está vacío 🐾</p>
	{:else}
		<ul class="line-list">
			{#each lines as line (cartLineKey(line.item.slug, line.variant?.id ?? null))}
				<li class="line">
					<span class="line-media" aria-hidden="true">{line.item.emoji}</span>
					<span class="line-text">
						<span class="line-name">
							{line.item.name}{#if line.variant}<span class="line-variant"> · {line.variant.label}</span>{/if}
						</span>
						<span class="line-qty">
							{line.quantity} × {formatCOP(unitPriceCents(line.item, line.variant))}
						</span>
					</span>
					<span class="line-total">
						{formatCOP(unitPriceCents(line.item, line.variant) * line.quantity)}
					</span>
				</li>
			{/each}
		</ul>

		<fieldset class="shipping">
			<legend>Entrega</legend>
			{#each shippingOptions as option (option.id)}
				<label class="shipping-option" class:selected={shipping === option.id}>
					<input
						type="radio"
						name="shipping"
						value={option.id}
						checked={shipping === option.id}
						disabled={!selectable}
						onchange={() => onShippingChange?.(option.id)}
					/>
					<span class="shipping-text">
						<span class="shipping-label">{option.label}</span>
						<span class="shipping-detail">{option.detail}</span>
					</span>
					<span class="shipping-cost">
						{option.costCents === 0 ? 'Gratis' : `+${formatCOP(option.costCents)}`}
					</span>
				</label>
			{/each}
		</fieldset>

		<dl class="totals">
			<div>
				<dt>Subtotal</dt>
				<dd>{formatCOP(subtotalCents)}</dd>
			</div>
			<div>
				<dt>Envío ({selected.label})</dt>
				<dd>{shippingCents === 0 ? 'Gratis' : formatCOP(shippingCents)}</dd>
			</div>
			<div class="totals-grand">
				<dt>Total</dt>
				<dd>{formatCOP(totalCents)}</dd>
			</div>
		</dl>
	{/if}
</section>

<style>
	.recap {
		padding: 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.recap-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.75rem;
		line-height: 1.15;
		color: #7a3f16;
		margin-bottom: 1rem;
	}

	.recap-empty {
		opacity: 0.8;
	}

	.line-list {
		list-style: none;
		display: grid;
		gap: 0.625rem;
		margin-bottom: 1.25rem;
	}

	.line {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.line-media {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		flex-shrink: 0;
		font-size: 1.375rem;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, #ffd9a0, #ffb3c7 45%, #b8e0ff);
	}

	.line-text {
		display: grid;
		min-width: 0;
	}

	.line-name {
		font-weight: 700;
	}

	.line-variant {
		font-weight: 400;
		opacity: 0.75;
	}

	.line-qty {
		font-size: 0.875rem;
		opacity: 0.7;
	}

	.line-total {
		margin-left: auto;
		font-weight: 700;
		white-space: nowrap;
	}

	.shipping {
		border: 0;
		padding: 0;
		margin: 0 0 1.25rem;
		display: grid;
		gap: 0.5rem;
	}

	.shipping legend {
		font-weight: 700;
		font-size: 0.9375rem;
		margin-bottom: 0.5rem;
		padding: 0;
	}

	.shipping-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.875rem;
		border-radius: 0.875rem;
		border: 2px solid transparent;
		background: rgb(255 255 255 / 0.7);
		cursor: pointer;
	}

	.shipping-option.selected {
		border-color: #b7791f;
		background: rgb(255 250 240 / 0.95);
	}

	.shipping-option input {
		min-height: 0;
		width: 1.25rem;
		height: 1.25rem;
		accent-color: #7a3f16;
	}

	.shipping-text {
		display: grid;
	}

	.shipping-label {
		font-weight: 700;
	}

	.shipping-detail {
		font-size: 0.8125rem;
		opacity: 0.7;
	}

	.shipping-cost {
		margin-left: auto;
		font-weight: 700;
		color: #2e7d32;
		white-space: nowrap;
	}

	.totals {
		display: grid;
		gap: 0.5rem;
	}

	.totals > div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.totals dt {
		opacity: 0.8;
	}

	.totals dd {
		font-weight: 700;
	}

	.totals-grand {
		border-top: 1px solid rgb(0 0 0 / 0.1);
		padding-top: 0.75rem;
		margin-top: 0.25rem;
	}

	.totals-grand dt,
	.totals-grand dd {
		font-family: var(--font-brand);
		font-size: 1.75rem;
		line-height: 1.1;
		color: #7a3f16;
		opacity: 1;
	}
</style>
