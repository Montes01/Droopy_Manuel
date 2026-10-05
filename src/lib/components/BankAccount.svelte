<script lang="ts">
	import type { BankAccount } from '#lib/data/types';

	interface Props {
		account: BankAccount;
	}

	let { account }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => () => clearTimeout(timer));

	/** El único campo con botón de copiar; el resto es solo referencia. */
	let primary = $derived(account.fields.find((field) => field.copyable));
	let extras = $derived(account.fields.filter((field) => !field.copyable));

	async function copy(value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} catch {
			// Sin permiso de portapapeles: el valor sigue visible para copiar a mano.
			copied = false;
		}
	}
</script>

<article class="bank glass">
	<header class="bank-head">
		<span class="bank-emoji" aria-hidden="true">{account.emoji}</span>
		<span class="bank-titles">
			<span class="bank-name">{account.bank}</span>
			<span class="bank-holder">{account.holder}</span>
		</span>
		<span class="bank-kind">{account.method}</span>
	</header>

	{#if primary}
		<div class="bank-main">
			<span class="bank-main-value">{primary.value}</span>
			<button
				type="button"
				class="copy-btn"
				onclick={() => copy(primary.value)}
				aria-label={`Copiar ${primary.label} de ${account.bank}`}
			>
				{copied ? '¡Copiado!' : 'Copiar'}
			</button>
		</div>
	{/if}

	{#if extras.length > 0}
		<dl class="bank-extras">
			{#each extras as row (row.label)}
				<div class="bank-extra">
					<dt>{row.label}</dt>
					<dd>{row.value}</dd>
				</div>
			{/each}
		</dl>
	{/if}
</article>

<style>
	.bank {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		height: 100%;
		padding: 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.bank-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.bank-emoji {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		flex-shrink: 0;
		font-size: 1.5rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.75);
	}

	.bank-titles {
		display: grid;
		min-width: 0;
	}

	.bank-name {
		font-family: var(--font-brand);
		font-size: 1.5rem;
		line-height: 1.15;
		color: #7a3f16;
	}

	.bank-holder {
		font-size: 0.875rem;
		opacity: 0.75;
	}

	.bank-kind {
		margin-left: auto;
		flex-shrink: 0;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		background: rgb(122 63 22 / 0.12);
		color: #7a3f16;
	}

	/* El dato a transcribir: grande, con su botón de copiar. */
	.bank-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.625rem 0.625rem 0.625rem 0.875rem;
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.7);
		border: 1px solid rgb(0 0 0 / 0.06);
	}

	.bank-main-value {
		font-family: ui-monospace, 'Cascadia Mono', 'Consolas', monospace;
		font-size: 1.25rem;
		letter-spacing: 0.02em;
		word-break: break-all;
	}

	.copy-btn {
		flex-shrink: 0;
		padding: 0.375rem 0.875rem;
		border-radius: 999px;
		border: 0;
		background: #7a3f16;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 0.9375rem;
		cursor: pointer;
		white-space: nowrap;
	}

	/* Datos de referencia: pequeños y sin copiar. */
	.bank-extras {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.875rem;
		margin-top: auto;
	}

	.bank-extra {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		font-size: 0.8125rem;
	}

	.bank-extra dt {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.6875rem;
		opacity: 0.55;
	}

	.bank-extra dd {
		opacity: 0.8;
	}

	@media (hover: hover) {
		.copy-btn:hover {
			background: #b7791f;
		}

		.copy-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}
</style>