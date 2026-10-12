<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import ImageUpload from '#lib/components/ImageUpload.svelte';
	import type { Dog } from '#lib/data/admin-types';
	import { formatDogAge } from '#lib/data/format';

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
					Fecha de nacimiento
					<input name="birthDate" type="date" />
				</label>

				<label>
					Aproximada
					<div class="switch">
						<input name="isApprox" type="checkbox" class="switch-input" />
						<span class="switch-slider"></span>
					</div>
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
			</div>

			{#key editing?.slug ?? 'nuevo'}
				<div class="image-upload-wrapper">
					<ImageUpload name="photo" value={editing?.photo ?? ''} folder="manada" />
				</div>
			{/key}

			<label>
				Color principal (opcional)
				<span class="color-row">
					<input
						type="color"
						value={editing?.color ?? '#7a3f16'}
						aria-label="Elegir color"
						oninput={(event) => {
							const picker = event.currentTarget;
							const text = picker.nextElementSibling as HTMLInputElement | null;
							if (text) text.value = picker.value;
						}}
					/>
					<input type="hidden" name="color" value={editing?.color ?? ''} />
				</span>
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
	<div class="table-wrap">
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
					<td>{formatDogAge(dog.birthDate, dog.isApprox)}</td>
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

	.color-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.color-row input[type='color'] {
		width: 2.5rem;
		height: 2.5rem;
		padding: 0.125rem;
		cursor: pointer;
	}

	/* Toggle switch para "Aproximada" */
	.switch {
		position: relative;
		width: 3rem;
		height: 1.75rem;
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.image-upload-wrapper {
		margin: 1.5rem 0;
	}

	.switch-input {
		opacity: 0;
		width: 0;
		height: 0;
		position: absolute;
	}

	.switch-slider {
		position: absolute;
		inset: 0;
		background-color: #ccd2d9;
		border-radius: 1.75rem;
		transition: background-color 0.2s ease;
		cursor: pointer;
	}

	.switch-slider::before {
		content: '';
		position: absolute;
		width: 1.375rem;
		height: 1.375rem;
		border-radius: 50%;
		background-color: white;
		top: 0.1875rem;
		left: 0.1875rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
	}

	.switch-input:checked + .switch-slider {
		background-color: #7a3f16;
	}

	.switch-input:checked + .switch-slider::before {
		transform: translateX(1.25rem);
	}

	.switch-input:focus-visible + .switch-slider {
		outline: 3px solid #7a3f16;
		outline-offset: 2px;
	}

	.switch-input:disabled + .switch-slider {
		opacity: 0.5;
		cursor: not-allowed;
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
