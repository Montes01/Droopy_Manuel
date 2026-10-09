<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form, data }: { form: ActionData; data: { next: string } } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Entrar · Panel de Droopy Manuel</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="login-page">
	<form
		class="login-card"
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		<h1>Panel de Droopy Manuel</h1>
		<p class="lead">Entra con tu cuenta de administración.</p>

		<input type="hidden" name="next" value={data.next} />

		{#if form?.error}
			<p class="error" role="alert">{form.error}</p>
		{/if}

		<label>
			Correo
			<input
				type="email"
				name="email"
				value={form?.email ?? ''}
				autocomplete="username"
				required
				autofocus
			/>
		</label>

		<label>
			Contraseña
			<input type="password" name="password" autocomplete="current-password" required />
		</label>

		<button type="submit" disabled={submitting}>
			{submitting ? 'Entrando…' : 'Entrar'}
		</button>
	</form>
</main>

<style>
	.login-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1.5rem;
		background: var(--panel-bg, #f6f7f9);
	}

	.login-card {
		width: 100%;
		max-width: 24rem;
		display: grid;
		gap: 1rem;
		padding: 2rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
	}

	h1 {
		font-size: 1.25rem;
		margin: 0;
	}

	.lead {
		margin: 0;
		color: #5b6470;
		font-size: 0.9375rem;
	}

	label {
		display: grid;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	input {
		padding: 0.625rem 0.75rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 400;
	}

	input:focus-visible {
		outline: 2px solid #2563eb;
		outline-offset: 1px;
		border-color: #2563eb;
	}

	button {
		padding: 0.75rem 1rem;
		border: 0;
		border-radius: 0.5rem;
		background: #1f2937;
		color: #fff;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: #111827;
	}

	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.error {
		margin: 0;
		padding: 0.625rem 0.75rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		color: #b91c1c;
		font-size: 0.875rem;
	}
</style>
