<script lang="ts">
	import NewsCard from '#lib/components/NewsCard.svelte';
	import { untrack } from 'svelte';
	import { getNewsPage } from '#lib/api/news';
	import type { NewsCategory, NewsFilter, NewsItem } from '#lib/data/types';
	import { site, pageTitle } from '#lib/site';

	const title = pageTitle('Noticias');

	let { data } = $props();

	const PAGE_SIZE = 15;
	const SEARCH_DEBOUNCE = 250;
	// Espera artificial antes de traer la siguiente tanda. Solo para ver la
	// diferencia entre tandas de 15. Quitar en producción.
	const LOAD_MORE_DELAY = 10_000;

	let items = $state<NewsItem[]>(untrack(() => data.news));
	let hasMore = $state(untrack(() => data.hasMore));
	let loading = $state(false);

	let query = $state('');
	let category = $state<NewsCategory | null>(null);
	let filtersOpen = $state(false);

	let sentinel: HTMLElement | undefined = $state();

	/** Filtros activos, tal como los recibe la API. */
	const filters = $derived<NewsFilter>({
		q: query.trim() || undefined,
		category: category ?? undefined
	});

	// Descarta respuestas viejas si el usuario cambia de filtro mientras carga.
	let requestId = 0;

	async function fetchPage(offset: number) {
		const id = ++requestId;
		loading = true;
		try {
			const page = await getNewsPage(offset, PAGE_SIZE, filters);
			if (id !== requestId) return;
			items = offset === 0 ? page.items : [...items, ...page.items];
			hasMore = page.hasMore;
		} finally {
			if (id === requestId) loading = false;
		}
	}

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, LOAD_MORE_DELAY));
		loading = false;
		fetchPage(items.length);
	}

	// Al cambiar búsqueda o categoría, reinicia el feed. La primera corrida
	// (montaje) se salta: `load()` ya trajo la primera página.
	let mounted = false;
	$effect(() => {
		// Dependencias: al cambiar búsqueda o categoría se reinicia el feed.
		void filters.q;
		void filters.category;

		if (!mounted) {
			mounted = true;
			return;
		}

		const handle = setTimeout(() => {
			items = [];
			hasMore = true;
			fetchPage(0);
		}, SEARCH_DEBOUNCE);

		return () => clearTimeout(handle);
	});

	$effect(() => {
		if (!sentinel || !hasMore || loading) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) loadMore();
			},
			{ rootMargin: '300px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	const hasFilters = $derived(query.trim() !== '' || category !== null);
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="Noticias y novedades de la fundación: rescates, adopciones, jornadas y todo lo que pasa con la manada."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container news-page">
	<p class="tagline">Noticias</p>

	<div class="filters glass">
		<div class="filters-row">
			<label class="search">
				<span class="search-icon" aria-hidden="true">🔍</span>
				<input
					type="search"
					placeholder="Busca por título, etiqueta o palabra…"
					aria-label="Buscar noticias"
					bind:value={query}
				/>
				{#if query}
					<button
						type="button"
						class="search-clear"
						onclick={() => (query = '')}
						aria-label="Limpiar búsqueda"
					>
						✕
					</button>
				{/if}
			</label>

			<button
				type="button"
				class="filters-toggle"
				class:active={category !== null}
				aria-expanded={filtersOpen}
				aria-controls="news-filters"
				aria-label="Filtros"
				title="Filtros"
				onclick={() => (filtersOpen = !filtersOpen)}
			>
				<svg
					class="filters-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
					<line x1="9" y1="3.5" x2="9" y2="8.5" />
					<line x1="15" y1="9.5" x2="15" y2="14.5" />
					<line x1="7" y1="15.5" x2="7" y2="20.5" />
				</svg>
				{#if category !== null}
					<span class="filters-dot" aria-hidden="true"></span>
				{/if}
			</button>
		</div>

		{#if filtersOpen}
			<div class="filters-panel" id="news-filters">
				<div class="chips" role="group" aria-label="Filtrar por categoría">
					<button
						type="button"
						class="chip"
						class:active={category === null}
						aria-pressed={category === null}
						onclick={() => (category = null)}
					>
						Todas
					</button>
					{#each data.categories as cat (cat.slug)}
						<button
							type="button"
							class="chip"
							class:active={category === cat.slug}
							aria-pressed={category === cat.slug}
							onclick={() => (category = cat.slug)}
						>
							{cat.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#if items.length > 0}
		<div class="news-feed glass">
			{#each items as item (item.slug)}
				<NewsCard {item} />
			{/each}
		</div>
	{:else if !loading}
		<p class="empty">
			No encontramos noticias con esa búsqueda.
			{#if hasFilters}
				Prueba con otras palabras o cambia de categoría.
			{/if}
		</p>
	{/if}

	<div class="feed-foot" bind:this={sentinel}>
		{#if loading}
			<span class="feed-status">Cargando noticias…</span>
		{:else if hasMore}
			<span class="feed-status">Desliza para ver más ↓</span>
		{:else if items.length > 0}
			<span class="feed-status done">No hay más noticias por ahora</span>
		{/if}
	</div>
</main>

<style>
	.news-page {
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
		-webkit-text-stroke: 4px #7a3f16;
		paint-order: stroke fill;
		text-shadow: 0 6px 20px rgb(122 63 22 / 0.6);
	}

	.filters {
		display: grid;
		gap: 0.625rem;
		max-width: 40rem;
		margin: 0 auto 0.875rem;
		padding: 0.875rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		box-shadow: 0 0.5rem 1.25rem rgb(122 63 22 / 0.15);
	}

	.filters-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.filters-row .search {
		flex: 1;
		min-width: 0;
	}

	.filters-toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: #7a3f16;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.filters-toggle.active {
		color: #b7791f;
	}

	.filters-toggle[aria-expanded='true'] {
		background: rgb(122 63 22 / 0.12);
	}

	.filters-icon {
		width: 1.25rem;
		height: 1.25rem;
		display: block;
	}

	@media (hover: hover) {
		.filters-toggle:hover {
			background: rgb(122 63 22 / 0.1);
		}
	}

	.filters-dot {
		position: absolute;
		top: 0.125rem;
		right: 0.125rem;
		width: 0.625rem;
		height: 0.625rem;
		border-radius: 50%;
		background: #b7791f;
		box-shadow: 0 0 0 2px rgb(255 253 248 / 0.9);
	}

	.filters-toggle[aria-expanded='true'] .filters-dot {
		background: #7a3f16;
	}

	.filters-panel {
		animation: filters-in 0.2s ease;
	}

	@keyframes filters-in {
		from {
			opacity: 0;
			transform: translateY(-0.25rem);
		}
	}

	.search {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		border: 2px solid #7a3f16;
		background: rgb(255 255 255 / 0.85);
	}

	.search-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.search input {
		flex: 1;
		min-width: 0;
		min-height: 0;
		border: 0;
		background: transparent;
		font: inherit;
		font-size: 1rem;
		color: inherit;
		outline: none;
	}

	.search input::-webkit-search-cancel-button {
		display: none;
	}

	.search-clear {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
		border: 0;
		border-radius: 50%;
		background: rgb(122 63 22 / 0.12);
		color: #7a3f16;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.875rem;
		border-radius: 999px;
		border: 2px solid rgb(122 63 22 / 0.35);
		background: rgb(255 255 255 / 0.7);
		font-family: var(--font-brand);
		font-size: 1.0625rem;
		line-height: 1.2;
		color: #7a3f16;
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.chip.active {
		background: #7a3f16;
		border-color: #7a3f16;
		color: #fffdf8;
	}

	.news-feed {
		max-width: 40rem;
		margin-inline: auto;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		box-shadow: 0 0.5rem 1.25rem rgb(122 63 22 / 0.15);
		overflow: hidden;
	}

	.empty {
		text-align: center;
		text-wrap: pretty;
		max-width: 30rem;
		margin: 2rem auto;
		font-size: 1.125rem;
		opacity: 0.85;
	}

	.feed-foot {
		display: flex;
		justify-content: center;
		min-height: 4rem;
		padding-block: 2rem;
	}

	.feed-status {
		font-family: var(--font-brand);
		font-size: 1.25rem;
		color: #7a3f16;
		opacity: 0.85;
		text-align: center;
	}

	.feed-status.done {
		opacity: 0.7;
	}

	@media (hover: hover) {
		.chip:hover {
			transform: translateY(-0.125rem);
		}

		.search-clear:hover {
			background: rgb(122 63 22 / 0.2);
		}
	}

	.chip:focus-visible,
	.filters-toggle:focus-visible,
	.search-clear:focus-visible,
	.search:focus-within {
		outline: 3px solid #7a3f16;
		outline-offset: 2px;
	}

	.search:focus-within {
		outline-offset: 3px;
	}

	@media (min-width: 48rem) {
		.filters {
			padding: 1rem;
		}
	}
</style>
