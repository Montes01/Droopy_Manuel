<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	let { children, data } = $props();

	/** Secciones del panel, en el orden en que se usan a diario. */
	const sections = [
		{ href: '/admin', label: 'Resumen', exact: true },
		{ href: '/admin/pedidos', label: 'Pedidos' },
		{ href: '/admin/manada', label: 'Manada' },
		{ href: '/admin/tienda', label: 'Tienda' },
		{ href: '/admin/noticias', label: 'Noticias' },
		{ href: '/admin/sitio', label: 'Sitio' }
	];

	let current = $derived(page.url.pathname);

	function isActive(href: string, exact = false): boolean {
		return exact ? current === href : current === href || current.startsWith(`${href}/`);
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="panel">
	<header class="topbar">
		<a class="brand" href="/admin">
			<span aria-hidden="true">🐾</span>
			<span>Droopy Manuel <span class="brand-sub">Panel</span></span>
		</a>

		<div class="account">
			<span class="who">
				{data.user?.name ?? ''}
				<span class="role">{data.user?.role ?? ''}</span>
			</span>
			<a class="ghost" href="/" target="_blank" rel="noreferrer">Ver la web</a>
			<form method="POST" action="?/logout" use:enhance>
				<button class="ghost" type="submit">Salir</button>
			</form>
		</div>
	</header>

	<div class="columns">
		<nav aria-label="Secciones del panel">
			<ul>
				{#each sections as section (section.href)}
					<li>
						<a
							href={section.href}
							class:active={isActive(section.href, section.exact)}
							aria-current={isActive(section.href, section.exact) ? 'page' : undefined}
						>
							{section.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<main class="content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.panel {
		min-height: 100vh;
		background: #f6f7f9;
		color: #1f2937;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		background: #1f2937;
		color: #fff;
		flex-wrap: wrap;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		text-decoration: none;
		font-weight: 700;
	}

	.brand-sub {
		font-weight: 400;
		opacity: 0.7;
	}

	.account {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.who {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.role {
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		background: rgb(255 255 255 / 0.15);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.ghost {
		padding: 0.375rem 0.625rem;
		border: 1px solid rgb(255 255 255 / 0.3);
		border-radius: 0.375rem;
		background: transparent;
		color: #fff;
		font: inherit;
		text-decoration: none;
		cursor: pointer;
	}

	.ghost:hover {
		background: rgb(255 255 255 / 0.12);
	}

	.columns {
		display: grid;
		grid-template-columns: 14rem 1fr;
		align-items: start;
		gap: 1.5rem;
		padding: 1.5rem;
		max-width: 90rem;
		margin: 0 auto;
	}

	nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.125rem;
		position: sticky;
		top: 1.5rem;
	}

	nav a {
		display: block;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		color: #374151;
		text-decoration: none;
		font-size: 0.9375rem;
	}

	nav a:hover {
		background: #e8eaee;
	}

	nav a.active {
		background: #1f2937;
		color: #fff;
		font-weight: 600;
	}

	.content {
		min-width: 0;
	}

	@media (max-width: 48rem) {
		.columns {
			grid-template-columns: 1fr;
		}

		nav ul {
			position: static;
			grid-auto-flow: column;
			overflow-x: auto;
		}
	}
</style>
