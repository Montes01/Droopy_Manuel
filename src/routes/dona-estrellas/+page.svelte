<script lang="ts">
	import BankAccountCard from '#lib/components/BankAccount.svelte';
	import StarModal from '#lib/components/StarModal.svelte';
	import type { BankAccount, Dog } from '#lib/data/types';
	import { pageTitle, site } from '#lib/site';
	import { useContact } from '#lib/stores/contact.svelte';

	const title = pageTitle('Dona estrellas');

	const contact = useContact();

	let { data } = $props();

	// Todo viene del loader (+page.ts) y, por debajo, de la API.
	const bankAccounts: BankAccount[] = data.accounts;
	const donationTargets: Dog[] = data.dogs;
	const aboutBlurb: string = data.aboutBlurb;

	let open = $state(false);
	let selectedSlug: string | null = $state(null);

	let selected = $derived(donationTargets.find((dog) => dog.slug === selectedSlug) ?? null);

	// El enlace sale del número que sirve el backend.
	const whatsappHref = $derived(
		contact.whatsappLink(
			selected
				? `¡Hola! Acabo de donar estrellas para ${selected.name}. Aquí va mi comprobante ⭐`
				: undefined
		)
	);

	function pick(dog: Dog) {
		selectedSlug = selectedSlug === dog.slug ? null : dog.slug;
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Dona estrellas a los perritos de la manada y transforma tu aportación en comida, vacunas y hogar."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container stars-page">
	<p class="tagline">⭐ Dona estrellas ⭐</p>
	<p class="intro">{aboutBlurb}</p>

	<section class="accounts" id="cuentas" aria-labelledby="accounts-title">
		<h2 class="section-title" id="accounts-title">💳 Cuentas para donar</h2>
		<div class="bank-list">
			{#each bankAccounts as account (account.bank)}
				<BankAccountCard {account} />
			{/each}
		</div>
		<p class="accounts-foot">
			Datos de ejemplo para desarrollo. Antes de publicar hay que sustituirlos por las cuentas
			reales de la fundación.
		</p>
	</section>

	<div class="dedicate">
		<button type="button" class="dedicate-btn standalone" onclick={() => (open = true)}>
			Dedica tu estrella
		</button>
	</div>

	<section class="thanks" aria-labelledby="thanks-title">
		<h2 class="thanks-title" id="thanks-title">💛 Gracias por sumar amor</h2>
		<p class="thanks-foot">
			Cada estrella se convierte en comida, vacunas y un hogar para la manada.
		</p>
	</section>

	<StarModal
		{open}
		dogs={donationTargets}
		{selectedSlug}
		{whatsappHref}
		onselect={pick}
		onclose={() => (open = false)}
	/>
</main>

<style>
	.stars-page {
		padding-bottom: 3rem;
	}

	.tagline {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0 0.75rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.intro {
		text-align: center;
		text-wrap: pretty;
		font-size: 1.125rem;
		max-width: 36rem;
		margin: 0 auto 1.5rem;
	}

	.section-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.375rem, 5vw, 1.875rem);
		line-height: 1.2;
		margin-bottom: 1rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	/* --- Cuentas --- */

	.accounts {
		margin-top: 0;
		scroll-margin-top: 5rem;
	}

	.bank-list {
		display: grid;
		grid-template-columns: 1fr;
		align-items: stretch;
		gap: 1.25rem;
	}

	.accounts-foot {
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.875rem;
		opacity: 0.7;
	}

	/* --- Dedicatoria --- */

	.dedicate {
		margin-top: 2rem;
	}

	.dedicate-btn {
		min-height: var(--tap-min);
		padding: 0.75rem 1.75rem;
		border: 2px solid #7a3f16;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.85);
		color: #7a3f16;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		cursor: pointer;
	}

	.dedicate-btn.standalone {
		display: block;
		width: 100%;
	}

	@media (hover: hover) {
		.dedicate-btn:hover {
			background: #fff8ef;
		}

		.dedicate-btn:focus-visible {
			outline: 3px solid #7a3f16;
			outline-offset: 2px;
		}
	}

	/* --- Gracias --- */

	.thanks {
		margin-top: 2.5rem;
	}

	.thanks-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(1.375rem, 5vw, 1.875rem);
		line-height: 1.2;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.thanks-foot {
		margin-top: 0.5rem;
		text-align: center;
		text-wrap: pretty;
		font-size: 0.9375rem;
		max-width: 36rem;
		margin-inline: auto;
		opacity: 0.85;
	}

	@media (min-width: 48rem) {
		.bank-list {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}

	
</style>