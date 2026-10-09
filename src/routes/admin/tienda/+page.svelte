<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { ShopItem } from '#lib/data/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state<ShopItem | null>(null);
	let showForm = $state(false);
	let activeCategory = $state<string>('');
	let editingCategory = $state<string | null>(null);

	/** Productos filtrados por la categoría elegida. */
	let visibleItems = $derived(
		activeCategory ? data.items.filter((item) => item.category === activeCategory) : data.items
	);

	/** Nombre visible de cada categoría, por slug. */
	let categoryNames = $derived(
		Object.fromEntries(data.categories.map((c) => [c.slug, `${c.emoji} ${c.name}`]))
	);

	/** Cuántos productos tiene cada categoría. */
	let countsByCategory = $derived(
		Object.fromEntries(
			data.categories.map((c) => [c.slug, data.items.filter((i) => i.category === c.slug).length])
		)
	);

	/** Filas de variantes a mostrar: las existentes más huecos para agregar. */
	let variantRows = $derived(editing?.variants ?? []);
	let emptyRows = $derived(Math.max(0, 3 - variantRows.length));

	function startCreate() {
		editing = null;
		showForm = true;
	}

	function startEdit(item: ShopItem) {
		editing = item;
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editing = null;
	}

	function formatCOP(cents: number): string {
		return '$' + Math.round(cents / 100).toLocaleString('es-CO');
	}
</script>

<svelte:head>
	<title>Tienda · Panel</title>
</svelte:head>

<header class="head">
	<div>
		<h1>Tienda</h1>
		<p class="lead">{data.items.length} productos en {data.categories.length} categorías.</p>
	</div>
	<button class="primary" onclick={startCreate}>Agregar producto</button>
</header>

{#if form?.error}
	<p class="alert error" role="alert">{form.error}</p>
{/if}
{#if form?.success}
	<p class="alert ok" role="status">{form.message}</p>
{/if}

<section class="categories">
	<h2>Categorías</h2>
	<ul>
		<li>
			<button class="chip" class:active={activeCategory === ''} onclick={() => (activeCategory = '')}>
				Todas <span class="count">{data.items.length}</span>
			</button>
		</li>
		{#each data.categories as category (category.slug)}
			<li class="cat">
				<button
					class="chip"
					class:active={activeCategory === category.slug}
					onclick={() => (activeCategory = category.slug)}
				>
					{category.emoji} {category.name}
					<span class="count">{countsByCategory[category.slug] ?? 0}</span>
				</button>
				<span class="cat-actions">
					<button
						class="mini"
						title="Editar categoría"
						onclick={() => (editingCategory = editingCategory === category.slug ? null : category.slug)}
					>
						✎
					</button>
					<form method="POST" action="?/deleteCategory" use:enhance>
						<input type="hidden" name="slug" value={category.slug} />
						<button
							class="mini danger"
							type="submit"
							title="Borrar categoría"
							onclick={(event) => {
								if (!confirm(`¿Borrar la categoría ${category.name}?`)) event.preventDefault();
							}}
						>
							🗑
						</button>
					</form>
				</span>

				{#if editingCategory === category.slug}
					<form
						class="cat-form"
						method="POST"
						action="?/updateCategory"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
								editingCategory = null;
							};
						}}
					>
						<input type="hidden" name="slug" value={category.slug} />
						<input name="name" value={category.name} placeholder="Nombre" required />
						<input class="emoji-input" name="emoji" value={category.emoji} placeholder="Emoji" required />
						<input name="blurb" value={category.blurb} placeholder="Descripción" required />
						<button class="primary small" type="submit">Guardar</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>

	<details class="new-cat">
		<summary>Nueva categoría</summary>
		<form method="POST" action="?/createCategory" use:enhance>
			<input name="name" placeholder="Nombre" required />
			<input class="emoji-input" name="emoji" placeholder="Emoji" required />
			<input name="blurb" placeholder="Descripción" required />
			<button class="primary small" type="submit">Crear</button>
		</form>
	</details>
</section>

{#if showForm}
	<section class="editor">
		<h2>{editing ? `Editar ${editing.name}` : 'Nuevo producto'}</h2>

		<form
			method="POST"
			action={editing ? '?/updateItem' : '?/createItem'}
			use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') closeForm();
				};
			}}
		>
			{#if editing}
				<input type="hidden" name="slug" value={editing.slug} />
			{/if}
			<!-- Marca que el formulario trae la sección de variantes: al guardar se reemplazan. -->
			<input type="hidden" name="variantsIncluded" value="1" />

			<div class="grid">
				<label>
					Nombre *
					<input name="name" value={editing?.name ?? ''} required />
				</label>

				<label>
					Categoría *
					<select name="category" value={editing?.category ?? data.categories[0]?.slug ?? ''}>
						{#each data.categories as category (category.slug)}
							<option value={category.slug}>{category.emoji} {category.name}</option>
						{/each}
					</select>
				</label>

				<label>
					Precio en pesos *
					<input
						name="price"
						inputmode="numeric"
						value={editing ? Math.round(editing.priceCents / 100) : ''}
						placeholder="45000"
						required
					/>
				</label>

				<label>
					Emoji *
					<input name="emoji" value={editing?.emoji ?? ''} placeholder="🍖" required />
				</label>

				<label>
					Foto (ruta)
					<input name="photo" value={editing?.photo ?? ''} placeholder="/productos/taza.jpg" />
				</label>

				<label>
					Stock (si no tiene variantes)
					<input name="stock" type="number" min="0" value={editing?.stock ?? 0} />
				</label>

				<label class="wide">
					Etiquetas (separadas por coma)
					<input name="tags" value={editing?.tags.join(', ') ?? ''} placeholder="Algodón, Unisex" />
				</label>

				<label class="wide">
					Descripción corta *
					<input name="description" value={editing?.description ?? ''} required />
				</label>

				<label class="wide">
					Detalles largos *
					<textarea name="details" rows="3" required>{editing?.details ?? ''}</textarea>
				</label>
			</div>

			<fieldset>
				<legend>Variantes (talla, color…)</legend>
				<p class="hint">
					Si un producto tiene variantes, el stock vive en cada una. Deja las filas vacías para no
					usarlas.
				</p>
				<table class="variants">
					<thead>
						<tr>
							<th>Etiqueta</th>
							<th class="narrow">Stock</th>
							<th class="narrow">Precio (opcional)</th>
						</tr>
					</thead>
					<tbody>
						{#each variantRows as variant (variant.id)}
							<tr>
								<td><input name="variantLabel" value={variant.label} /></td>
								<td><input name="variantStock" type="number" min="0" value={variant.stock} /></td>
								<td>
									<input
										name="variantPrice"
										inputmode="numeric"
										value={variant.priceCents ? Math.round(variant.priceCents / 100) : ''}
										placeholder={editing ? String(Math.round(editing.priceCents / 100)) : ''}
									/>
								</td>
							</tr>
						{/each}
						{#each Array(emptyRows) as _, index (index)}
							<tr>
								<td><input name="variantLabel" placeholder="Talla M" /></td>
								<td><input name="variantStock" type="number" min="0" /></td>
								<td><input name="variantPrice" inputmode="numeric" /></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</fieldset>

			<label class="inline">
				<input type="checkbox" name="featured" checked={editing?.featured ?? false} />
				Destacado en la tienda
			</label>

			<div class="actions">
				<button class="primary" type="submit">{editing ? 'Guardar cambios' : 'Crear producto'}</button>
				<button class="ghost" type="button" onclick={closeForm}>Cancelar</button>
			</div>
		</form>
	</section>
{/if}

{#if visibleItems.length === 0}
	<p class="empty">No hay productos en esta categoría.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Producto</th>
				<th>Categoría</th>
				<th>Precio</th>
				<th>Stock</th>
				<th>Dest.</th>
				<th class="right">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleItems as item (item.slug)}
				<tr>
					<td>
						<span class="avatar" aria-hidden="true">
							{#if item.photo}<img src={item.photo} alt="" />{:else}{item.emoji}{/if}
						</span>
						<span class="name">
							<strong>{item.name}</strong>
							<span class="sub"><code>{item.slug}</code></span>
						</span>
					</td>
					<td>{categoryNames[item.category] ?? item.category}</td>
					<td>{formatCOP(item.priceCents)}</td>
					<td>
						{#if item.variants.length > 0}
							<ul class="stock-list">
								{#each item.variants as variant (variant.id)}
									<li>
										<span class="vlabel">{variant.label}</span>
										<form method="POST" action="?/setStock" use:enhance>
											<input type="hidden" name="slug" value={item.slug} />
											<input type="hidden" name="variantId" value={variant.id} />
											<input
												class="stock-input"
												name="stock"
												type="number"
												min="0"
												value={variant.stock}
											/>
											<button class="mini" type="submit" title="Guardar stock">✓</button>
										</form>
									</li>
								{/each}
							</ul>
						{:else}
							<form class="stock-inline" method="POST" action="?/setStock" use:enhance>
								<input type="hidden" name="slug" value={item.slug} />
								<input class="stock-input" name="stock" type="number" min="0" value={item.stock} />
								<button class="mini" type="submit" title="Guardar stock">✓</button>
							</form>
						{/if}
					</td>
					<td>{item.featured ? '★' : ''}</td>
					<td class="right">
						<div class="row-actions">
							<button class="icon" onclick={() => startEdit(item)} title="Editar">✎</button>
							<form method="POST" action="?/deleteItem" use:enhance>
								<input type="hidden" name="slug" value={item.slug} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar ${item.name}? No se puede deshacer.`)) event.preventDefault();
									}}
								>
									🗑
								</button>
							</form>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
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

	.categories {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
	}

	.categories ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.cat {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		flex-wrap: wrap;
	}

	.cat-actions {
		display: inline-flex;
		gap: 0.125rem;
	}

	.cat-form {
		display: flex;
		gap: 0.375rem;
		width: 100%;
		margin-top: 0.375rem;
		flex-wrap: wrap;
	}

	.chip {
		padding: 0.375rem 0.625rem;
		border: 1px solid #ccd2d9;
		border-radius: 1rem;
		background: #fff;
		cursor: pointer;
		font: inherit;
		font-size: 0.875rem;
	}

	.chip.active {
		background: #1f2937;
		color: #fff;
		border-color: #1f2937;
	}

	.count {
		opacity: 0.7;
		font-size: 0.8125rem;
	}

	.new-cat {
		margin-top: 0.75rem;
	}

	.new-cat summary {
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.new-cat form {
		display: flex;
		gap: 0.375rem;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}

	.emoji-input {
		width: 4rem;
	}

	.empty {
		padding: 2rem;
		text-align: center;
		color: #5b6470;
		background: #fff;
		border: 1px dashed #ccd2d9;
		border-radius: 0.625rem;
	}

	.editor {
		margin-bottom: 1.5rem;
		padding: 1.25rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	label.wide {
		grid-column: 1 / -1;
	}

	label.inline {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.75rem;
		font-weight: 400;
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

	fieldset {
		margin: 1rem 0 0;
		padding: 0.75rem;
		border: 1px solid #e2e5e9;
		border-radius: 0.5rem;
	}

	legend {
		padding: 0 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.hint {
		margin: 0 0 0.5rem;
		font-size: 0.8125rem;
		color: #5b6470;
	}

	.variants {
		width: 100%;
		border-collapse: collapse;
	}

	.variants th {
		text-align: left;
		font-size: 0.8125rem;
		color: #5b6470;
		padding-bottom: 0.25rem;
	}

	.variants td {
		padding: 0.125rem 0.25rem 0.125rem 0;
	}

	.variants .narrow {
		width: 8rem;
	}

	.variants input {
		width: 100%;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
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

	button.primary.small {
		padding: 0.375rem 0.625rem;
		font-size: 0.875rem;
	}

	button.ghost {
		padding: 0.5rem 0.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		font: inherit;
		cursor: pointer;
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
		vertical-align: top;
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

	.avatar {
		display: inline-grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		background: #e8eaee;
		overflow: hidden;
		vertical-align: middle;
		margin-right: 0.5rem;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.name {
		display: inline-grid;
		vertical-align: middle;
	}

	.sub {
		font-size: 0.8125rem;
		color: #5b6470;
	}

	code {
		font-size: 0.75rem;
		background: #f1f3f5;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.25rem;
	}

	.stock-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.25rem;
	}

	.stock-list li,
	.stock-inline {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.vlabel {
		font-size: 0.8125rem;
		color: #5b6470;
		min-width: 4.5rem;
	}

	.stock-input {
		width: 4.5rem;
		padding: 0.25rem 0.375rem;
		font-size: 0.875rem;
	}

	.mini {
		width: 1.5rem;
		height: 1.5rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.25rem;
		background: #fff;
		cursor: pointer;
		font-size: 0.75rem;
		line-height: 1;
	}

	.mini.danger:hover {
		border-color: #ef4444;
	}

	.row-actions {
		display: inline-flex;
		gap: 0.25rem;
	}

	.row-actions form {
		display: inline;
	}

	.icon {
		width: 1.875rem;
		height: 1.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		cursor: pointer;
	}

	.icon.danger:hover {
		border-color: #ef4444;
		color: #b91c1c;
	}
</style>
