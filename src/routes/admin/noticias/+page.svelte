<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { NewsItem } from '#lib/data/types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state<NewsItem | null>(null);
	let showForm = $state(false);

	const categoryLabels: Record<string, string> = {
		rescate: '🚑 Rescate',
		adopcion: '🏠 Adopción',
		salud: '💉 Salud',
		evento: '🎉 Evento',
		tienda: '🛍️ Tienda'
	};

	/** El cuerpo se edita como texto: un párrafo por línea. */
	let bodyText = $derived(editing?.body.join('\n\n') ?? '');

	function startCreate() {
		editing = null;
		showForm = true;
	}

	function startEdit(item: NewsItem) {
		editing = item;
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editing = null;
	}

	/** Fecha corta para la tabla. */
	function shortDate(iso: string): string {
		const [year, month, day] = iso.split('-');
		return `${day}/${month}/${year}`;
	}
</script>

<svelte:head>
	<title>Noticias · Panel</title>
</svelte:head>

<header class="head">
	<div>
		<h1>Noticias</h1>
		<p class="lead">{data.items.length} noticias publicadas.</p>
	</div>
	<button class="primary" onclick={startCreate}>Redactar noticia</button>
</header>

{#if form?.error}
	<p class="alert error" role="alert">{form.error}</p>
{/if}
{#if form?.success}
	<p class="alert ok" role="status">{form.message}</p>
{/if}

{#if showForm}
	<section class="editor">
		<h2>{editing ? `Editar «${editing.title}»` : 'Nueva noticia'}</h2>

		<form
			method="POST"
			action={editing ? '?/update' : '?/create'}
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

			<div class="grid">
				<label class="wide">
					Título *
					<input name="title" value={editing?.title ?? ''} required />
				</label>

				<label>
					Fecha *
					<input name="date" type="date" value={editing?.date ?? ''} required />
				</label>

				<label>
					Categoría *
					<select name="category" value={editing?.category ?? 'rescate'}>
						{#each data.categories as category (category)}
							<option value={category}>{categoryLabels[category] ?? category}</option>
						{/each}
					</select>
				</label>

				<label>
					Emoji *
					<input class="emoji-input" name="emoji" value={editing?.emoji ?? ''} placeholder="🚑" required />
				</label>

				<label>
					Foto (ruta)
					<input name="photo" value={editing?.photo ?? ''} placeholder="/noticias/rescate.jpg" />
				</label>

				<label class="wide">
					Bajada corta *
					<input name="excerpt" value={editing?.excerpt ?? ''} required />
				</label>

				<label class="wide">
					Cuerpo * <span class="hint">(un párrafo por línea; las líneas vacías se ignoran)</span>
					<textarea name="body" rows="10" required>{bodyText}</textarea>
				</label>

				<label class="wide">
					Etiquetas (separadas por coma)
					<input name="tags" value={editing?.tags.join(', ') ?? ''} placeholder="rescate, cachorros" />
				</label>
			</div>

			<fieldset>
				<legend>Perritos relacionados</legend>
				{#if data.dogs.length === 0}
					<p class="hint">No hay perritos todavía.</p>
				{:else}
					<div class="dog-picker">
						{#each data.dogs as dog (dog.slug)}
							<label class="inline">
								<input
									type="checkbox"
									name="relatedDogSlugs"
									value={dog.slug}
									checked={editing?.relatedDogSlugs.includes(dog.slug) ?? false}
								/>
								{dog.name}
							</label>
						{/each}
					</div>
				{/if}
			</fieldset>

			<label class="inline standalone">
				<input type="checkbox" name="featured" checked={editing?.featured ?? false} />
				Destacada
			</label>

			<div class="actions">
				<button class="primary" type="submit">{editing ? 'Guardar cambios' : 'Publicar'}</button>
				<button class="ghost" type="button" onclick={closeForm}>Cancelar</button>
			</div>
		</form>
	</section>
{/if}

{#if data.items.length === 0}
	<p class="empty">Todavía no hay noticias. Escribe la primera.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Noticia</th>
				<th>Categoría</th>
				<th>Fecha</th>
				<th>Perritos</th>
				<th>Dest.</th>
				<th class="right">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each data.items as item (item.slug)}
				<tr>
					<td>
						<span class="avatar" aria-hidden="true">
							{#if item.photo}<img src={item.photo} alt="" />{:else}{item.emoji}{/if}
						</span>
						<span class="name">
							<strong>{item.title}</strong>
							<span class="sub"><code>{item.slug}</code></span>
						</span>
					</td>
					<td><span class="tag">{categoryLabels[item.category] ?? item.category}</span></td>
					<td>{shortDate(item.date)}</td>
					<td>
						{#if item.relatedDogSlugs.length > 0}
							{item.relatedDogSlugs.length}
						{:else}
							<span class="muted">—</span>
						{/if}
					</td>
					<td>{item.featured ? '★' : ''}</td>
					<td class="right">
						<div class="row-actions">
							<a class="icon" href={`/noticias/${item.slug}`} target="_blank" rel="noreferrer" title="Ver en la web">
								↗
							</a>
							<button class="icon" onclick={() => startEdit(item)} title="Editar">✎</button>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="slug" value={item.slug} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar «${item.title}»? No se puede deshacer.`)) event.preventDefault();
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
		margin: 0 0 1rem;
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
		margin-right: 1rem;
		font-weight: 400;
	}

	label.standalone {
		margin-top: 0.75rem;
	}

	.hint {
		font-weight: 400;
		color: #5b6470;
		font-size: 0.8125rem;
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

	textarea {
		resize: vertical;
		line-height: 1.5;
	}

	.emoji-input {
		width: 5rem;
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

	.dog-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
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
		vertical-align: middle;
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
		max-width: 28rem;
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

	.muted {
		color: #9aa3af;
	}

	.tag {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 1rem;
		background: #eef2ff;
		color: #3730a3;
		font-size: 0.8125rem;
		white-space: nowrap;
	}

	.row-actions {
		display: inline-flex;
		gap: 0.25rem;
	}

	.row-actions form {
		display: inline;
	}

	.icon {
		display: inline-grid;
		place-items: center;
		width: 1.875rem;
		height: 1.875rem;
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
		font-size: 0.875rem;
	}

	.icon.danger:hover {
		border-color: #ef4444;
		color: #b91c1c;
	}
</style>
