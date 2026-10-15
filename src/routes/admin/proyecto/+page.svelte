<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { ProjectSection } from '#lib/data/admin-types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/** Sección en edición; `null` significa «crear una nueva». */
	let editing = $state<ProjectSection | null>(null);
	let showForm = $state(false);

	function startCreate() {
		editing = null;
		selectedKind = 'chapter';
		showForm = true;
	}

	function startEdit(section: ProjectSection) {
		editing = section;
		selectedKind = section.kind;
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editing = null;
	}

	const kindLabels: Record<string, string> = {
		hero: 'Portada',
		chapter: 'Capítulo',
		closing: 'Cierre'
	};

	/**
	 * Clase elegida en el formulario: la portada no usa texto y el cierre no
	 * usa título, así que esos campos se ocultan (lo oculto se conserva, no se
	 * borra: el campo simplemente no se envía).
	 */
	let selectedKind = $state('chapter');

	/** Cuerpo en edición, un párrafo por línea. */
	let bodyText = $derived(editing?.body.join('\n') ?? '');

	/** Posición sugerida para una sección nueva: después de la última. */
	let nextPosition = $derived(
		data.sections.length === 0 ? 1 : Math.max(...data.sections.map((s) => s.position)) + 1
	);
</script>

<svelte:head>
	<title>Proyecto · Panel</title>
</svelte:head>

<header class="head">
	<div>
		<h1>Proyecto</h1>
		<p class="lead">{data.sections.length} secciones en /project, en orden de posición.</p>
	</div>
	<button class="primary" onclick={startCreate}>Agregar sección</button>
</header>

{#if form?.error}
	<p class="alert error" role="alert">{form.error}</p>
{/if}
{#if form?.success}
	<p class="alert ok" role="status">{form.message}</p>
{/if}

{#if showForm}
	<section class="editor">
		<h2>{editing ? `Editar sección ${editing.position}` : 'Nueva sección'}</h2>

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
				<input type="hidden" name="id" value={editing.id} />
			{/if}

			<div class="grid">
				<label>
					Clase *
					<select
						name="kind"
						value={selectedKind}
						onchange={(event) => (selectedKind = event.currentTarget.value)}
					>
						{#each data.kinds as option (option)}
							<option value={option}>{kindLabels[option] ?? option}</option>
						{/each}
					</select>
				</label>

				<label>
					Posición
					<input
						name="position"
						type="number"
						min="1"
						step="1"
						value={editing?.position ?? nextPosition}
						placeholder="Vacío = al final"
					/>
					<span class="hint">Si está ocupada, las demás se recorren solas.</span>
				</label>

				{#if selectedKind !== 'closing'}
					<label class="wide">
						Título (opcional)
						<input name="title" value={editing?.title ?? ''} placeholder="Sin título = sin encabezado" />
					</label>
				{/if}

				{#if selectedKind !== 'hero'}
					<label class="wide">
						Texto: un párrafo por línea
						<textarea name="body" rows="8">{bodyText}</textarea>
						<span class="hint">**negrita** es el único formato.</span>
					</label>
				{/if}
			</div>

			<div class="actions">
				<button class="primary" type="submit">{editing ? 'Guardar cambios' : 'Crear sección'}</button>
				<button class="ghost" type="button" onclick={closeForm}>Cancelar</button>
			</div>
		</form>
	</section>
{/if}

{#if data.sections.length === 0}
	<p class="empty">Todavía no hay secciones. Agrega la primera.</p>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th class="num">#</th>
					<th>Clase</th>
					<th>Título</th>
					<th>Texto</th>
					<th class="right">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each data.sections as section, index (section.id)}
					<tr>
						<td class="num">{section.position}</td>
						<td><span class="tag">{kindLabels[section.kind] ?? section.kind}</span></td>
						<td>{section.title ?? '—'}</td>
						<td class="preview">
							{section.body.length === 0
								? '—'
								: `${section.body.length} párrafo${section.body.length === 1 ? '' : 's'} · ${section.body[0]?.slice(0, 60) ?? ''}…`}
						</td>
						<td class="right">
							<div class="row-actions">
								<form method="POST" action="?/update" use:enhance>
									<input type="hidden" name="id" value={section.id} />
									<input type="hidden" name="position" value={section.position - 1} />
									<button class="icon" type="submit" disabled={index === 0} title="Subir">↑</button>
								</form>
								<form method="POST" action="?/update" use:enhance>
									<input type="hidden" name="id" value={section.id} />
									<input type="hidden" name="position" value={section.position + 1} />
									<button
										class="icon"
										type="submit"
										disabled={index === data.sections.length - 1}
										title="Bajar"
									>
										↓
									</button>
								</form>
								<button class="icon" onclick={() => startEdit(section)} title="Editar">✎</button>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={section.id} />
									<button
										class="icon danger"
										type="submit"
										title="Borrar"
										onclick={(event) => {
											if (!confirm(`¿Borrar la sección ${section.position}? No se puede deshacer.`)) {
												event.preventDefault();
											}
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
	</div>
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

	.editor h2 {
		margin: 0 0 1rem;
		font-size: 1.125rem;
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
		align-content: start;
	}

	label.wide {
		grid-column: 1 / -1;
	}

	.hint {
		font-weight: 400;
		font-size: 0.8125rem;
		color: #5b6470;
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

	.table-wrap {
		overflow-x: auto;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
		background: #fff;
	}

	table {
		width: 100%;
		min-width: 42rem;
		border-collapse: collapse;
		background: #fff;
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

	.num {
		width: 2.5rem;
		color: #8b949e;
	}

	.right {
		text-align: right;
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

	.preview {
		max-width: 24rem;
		font-size: 0.875rem;
		color: #5b6470;
	}

	.row-actions {
		display: inline-flex;
		gap: 0.25rem;
		align-items: center;
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
		font-size: 0.875rem;
		line-height: 1;
	}

	.icon:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.icon.danger:hover {
		border-color: #ef4444;
		color: #b91c1c;
	}

	@media (max-width: 40rem) {
		.editor {
			padding: 0.875rem;
		}

		.grid {
			grid-template-columns: 1fr;
		}

		.actions button {
			flex: 1 1 auto;
		}
	}
</style>
