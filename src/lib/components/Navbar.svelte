<script lang="ts">
	import { page } from '$app/state';
	import { nav } from '#lib/site';

	let open = $state(false);

	function close() {
		open = false;
	}

	function toggle() {
		open = !open;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	let pathname = $derived(page.url.pathname);
</script>

<svelte:window onkeydown={onkeydown} />

<header class="topbar glass">
	<div class="container topbar-inner">
		<a href="/" class="brand" aria-label="Fundación Droopy Manuel — inicio" onclick={close}>
			<img src="/logo.png" alt="" width="64" height="40" class="brand-mark" fetchpriority="high" />
			<img src="/titulo.png" alt="Fundación Droopy Manuel" width="220" height="36" class="brand-title" fetchpriority="high" />
		</a>

		<button
			type="button"
			class="menu-button"
			aria-expanded={open}
			aria-controls="primary-nav"
			aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
			onclick={toggle}
		>
			<span class="menu-icon" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
			</span>
		</button>

		<nav id="primary-nav" class="nav glass" class:open aria-label="Navegación principal">
			<ul>
				{#each nav as item (item.href)}
					{@const active = pathname === item.href}
					<li>
						<a
							href={item.href}
							aria-current={active ? 'page' : undefined}
							class:active
							onclick={close}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: 1000;
		isolation: isolate;
		border-bottom: 1px solid rgb(0 0 0 / 0.08);
		padding-top: env(safe-area-inset-top);
	}

	.topbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-height: 3.75rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		min-height: var(--tap-min);
		font-weight: 700;
		font-size: 1.0625rem;
		color: inherit;
		text-decoration: none;
	}

	.brand-mark {
		height: 2.5rem;
		width: auto;
		border-radius: 0.5rem;
	}

	.brand-title {
		height: 1.5rem;
		width: auto;
	}

	.menu-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--tap-min);
		background: none;
		border: 1px solid #d4d4d4;
		border-radius: 0.625rem;
		cursor: pointer;
		color: inherit;
	}

	.menu-icon {
		display: flex;
		flex-direction: column;
		gap: 0.28125rem;
	}

	.menu-icon > span {
		display: block;
		width: 1.25rem;
		height: 0.125rem;
		background: currentColor;
		border-radius: 999px;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.menu-button[aria-expanded='true'] .menu-icon > span:first-child {
		transform: translateY(0.40625rem) rotate(45deg);
	}

	.menu-button[aria-expanded='true'] .menu-icon > span:nth-child(2) {
		opacity: 0;
	}

	.menu-button[aria-expanded='true'] .menu-icon > span:last-child {
		transform: translateY(-0.40625rem) rotate(-45deg);
	}

	.nav {
		position: absolute;
		inset-inline: 0;
		top: 100%;
		z-index: 1000;
		display: grid;
		grid-template-rows: 0fr;
		visibility: hidden;
		transition:
			grid-template-rows 0.25s ease,
			visibility 0.25s;
	}

	.nav.open {
		grid-template-rows: 1fr;
		visibility: visible;
		border-bottom: 1px solid rgb(0 0 0 / 0.08);
		box-shadow: 0 0.75rem 1.5rem rgb(0 0 0 / 0.12);
	}

	.nav ul {
		list-style: none;
		padding: 0.5rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		overflow: hidden;
		min-height: 0;
		opacity: 0;
		transform: translateY(-0.5rem);
		transition:
			opacity 0.2s ease,
			transform 0.25s ease;
	}

	.nav.open ul {
		opacity: 1;
		transform: none;
	}

	.nav a {
		display: flex;
		align-items: center;
		min-height: var(--tap-min);
		padding-inline: 0.75rem;
		border-radius: 0.625rem;
		color: inherit;
		text-decoration: none;
		font-family: var(--font-brand);
		font-size: 1.25rem;
		font-weight: 400;
	}

	.nav a:hover {
		background: #f2f2f2;
	}

	.nav a.active {
		background: #ebebeb;
	}

	@media (min-width: 48rem) {
		.brand-title {
			height: 1.75rem;
		}

		.menu-button {
			display: none;
		}

		.nav {
			display: block;
			position: static;
			visibility: visible;
			background: transparent;
			-webkit-backdrop-filter: none;
			backdrop-filter: none;
			border-bottom: 0;
			box-shadow: none;
			transition: none;
		}

		.nav ul {
			flex-direction: row;
			align-items: center;
			gap: 0.25rem;
			padding: 0;
			overflow: visible;
			opacity: 1;
			transform: none;
			transition: none;
		}

		.nav a {
			padding-inline: 0.875rem;
		}
	}
</style>
