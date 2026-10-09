<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import type { Dog } from '#lib/data/admin-types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/** Perrito en edición; `null` significa «crear uno nuevo». */
	let editing = $state<Dog | null>(null);
	let showForm = $state(false);

	/** Orden actual, para mover arriba/abajo. */
	let orderedSlugs = $derived(data.dogs.map((dog) => dog.slug).join(','));

	function startCreate() {
		editing = null;
		showForm = true;
	}

	function startEdit(dog: Dog) {
		editing = dog;
		showForm = true;
	}

	function closeForm() {
		showForm = false;
		editing = null;
	}

	const statusLabels: Record<string, string> = {
		'en-adopcion': 'En adopción',
		'hogar-temporal': 'Hogar temporal',
		adoptado: 'Adoptado',
		'en-memoria': 'En memoria'
	};
</script>

<svelte:head>
	<title>Manada · Panel</title>
</svelte:head>

<header class="head">
	<div>
		<h1>Manada</h1>
		<p class="lead">{data.dogs.length} perritos en total.</p>
	</div>
	<button class="primary" onclick={startCreate}>Agregar perrito</button>
</header>

{#if form?.error}
	<p class="alert error" role="alert">{form.error}</p>
{/if}
{#if form?.success}
	<p class="alert ok" role="status">{form.message}</p>
{/if}

{#if showForm}
	<section class="editor">
		<h2>{editing ? `Editar ${editing.name}` : 'Nuevo perrito'}</h2>

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
				<label>
					Nombre *
					<input name="name" value={editing?.name ?? ''} required />
				</label>

				<label>
					Raza *
					<input name="breed" value={editing?.breed ?? ''} required />
				</label>

				<label>
					Edad (años) *
					<input name="ageYears" type="number" min="0" value={editing?.ageYears ?? ''} required />
				</label>

				<label>
					Edad como se muestra *
					<input name="ageLabel" value={editing?.ageLabel ?? ''} placeholder="Ej. 10 meses" required />
				</label>

				<label>
					Sexo *
					<select name="sex" value={editing?.sex ?? 'hembra'}>
						{#each data.options.sexes as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label>
					Tamaño *
					<select name="size" value={editing?.size ?? 'mediano'}>
						{#each data.options.sizes as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label>
					Energía *
					<select name="energy" value={editing?.energy ?? 'moderado'}>
						{#each data.options.energies as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label>
					Estado *
					<select name="status" value={editing?.status ?? 'en-adopcion'}>
						{#each data.options.statuses as option (option)}
							<option value={option}>{statusLabels[option] ?? option}</option>
						{/each}
					</select>
				</label>

				<label>
					Llegada *
					<input name="arrival" type="date" value={editing?.arrival ?? ''} required />
				</label>

				<label>
					Foto (ruta)
					<input name="photo" value={editing?.photo ?? ''} placeholder="/perros/luna.jpg" />
				</label>

				<label class="wide">
					Rasgos (separados por coma)
					<input
						name="traits"
						value={editing?.traits.join(', ') ?? ''}
						placeholder="juguetona, sociable"
					/>
				</label>

				<label class="wide">
					Historia *
					<textarea name="story" rows="4" required>{editing?.story ?? ''}</textarea>
				</label>
			</div>

			<fieldset>
				<legend>Se lleva bien con</legend>
				<label class="inline">
					<input type="checkbox" name="goodWithKids" checked={editing?.goodWith.kids ?? false} />
					Niños
				</label>
				<label class="inline">
					<input type="checkbox" name="goodWithDogs" checked={editing?.goodWith.dogs ?? false} />
					Perros
				</label>
				<label class="inline">
					<input type="checkbox" name="goodWithCats" checked={editing?.goodWith.cats ?? false} />
					Gatos
				</label>
			</fieldset>

			<fieldset>
				<legend>Salud y visibilidad</legend>
				<label class="inline">
					<input type="checkbox" name="vaccinated" checked={editing?.vaccinated ?? false} />
					Vacunado
				</label>
				<label class="inline">
					<input type="checkbox" name="sterilized" checked={editing?.sterilized ?? false} />
					Esterilizado
				</label>
				<label class="inline">
					<input type="checkbox" name="featured" checked={editing?.featured ?? false} />
					Destacado en la portada
				</label>
			</fieldset>

			<div class="actions">
				<button class="primary" type="submit">{editing ? 'Guardar cambios' : 'Crear perrito'}</button>
				<button class="ghost" type="button" onclick={closeForm}>Cancelar</button>
			</div>
		</form>
	</section>
{/if}

{#if data.dogs.length === 0}
	<p class="empty">Todavía no hay perritos. Agrega el primero.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th class="num">#</th>
				<th>Perrito</th>
				<th>Estado</th>
				<th>Edad</th>
				<th>Dest.</th>
				<th class="right">Acciones</th>
			</tr>
		</thead>
		<tbody>
			{#each data.dogs as dog, index (dog.slug)}
				<tr>
					<td class="num">{index + 1}</td>
					<td>
						<span class="avatar" aria-hidden="true">
							{#if dog.photo}
								<img src={dog.photo} alt="" />
							{:else}
								{dog.name.charAt(0)}
							{/if}
						</span>
						<span class="name">
							<strong>{dog.name}</strong>
							<span class="sub">{dog.breed} · <code>{dog.slug}</code></span>
						</span>
					</td>
					<td><span class="tag">{statusLabels[dog.status] ?? dog.status}</span></td>
					<td>{dog.ageLabel}</td>
					<td>{dog.featured ? '★' : ''}</td>
					<td class="right">
						<div class="row-actions">
							<form method="POST" action="?/reorder" use:enhance>
								<input type="hidden" name="slug" value={dog.slug} />
								<input type="hidden" name="order" value={orderedSlugs} />
								<input type="hidden" name="direction" value="up" />
								<button class="icon" type="submit" disabled={index === 0} title="Subir">↑</button>
							</form>
							<form method="POST" action="?/reorder" use:enhance>
								<input type="hidden" name="slug" value={dog.slug} />
								<input type="hidden" name="order" value={orderedSlugs} />
								<input type="hidden" name="direction" value="down" />
								<button
									class="icon"
									type="submit"
									disabled={index === data.dogs.length - 1}
									title="Bajar"
								>
									↓
								</button>
							</form>
							<button class="icon" onclick={() => startEdit(dog)} title="Editar">✎</button>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="slug" value={dog.slug} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar a ${dog.name}? No se puede deshacer.`)) {
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

	.num {
		width: 2.5rem;
		color: #8b949e;
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
		font-weight: 700;
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
</style>
