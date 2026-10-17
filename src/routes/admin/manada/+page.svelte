<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import ImageUpload from '#lib/components/ImageUpload.svelte';
	import type { Dog, DogVaccine } from '#lib/data/admin-types';
	import { DOG_STATUSES, dogStatusLabels } from '#lib/data/dog-status';
	import { dogNewsKindEmoji, dogNewsKindLabels } from '#lib/data/dog-news-labels';
	import { accessorySuggestions, vaccineSuggestions } from '#lib/data/dog-health-labels';
	import { formatDogAge } from '#lib/data/format';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/** Perrito en edición; `null` significa «crear uno nuevo». */
	let editing = $state<Dog | null>(null);
	let showForm = $state(false);

	/** Comunicados del perrito en edición (solo para uno ya creado). */
	let newsEditingId = $state<number | null>(null);
	let showNewsForm = $state(false);
	let currentNews = $derived(editing ? (data.newsByDog[editing.slug] ?? []) : []);

	/** Salud del perrito en edición (solo para uno ya creado). */
	let vaccineEditingId = $state<number | null>(null);
	let showVaccineForm = $state(false);
	let accessoryEditingId = $state<number | null>(null);
	let showAccessoryForm = $state(false);

	let currentProfile = $derived(editing ? (data.healthByDog[editing.slug] ?? null) : null);
	let currentHealth = $derived(currentProfile?.health ?? null);
	let currentVaccines = $derived(currentProfile?.vaccines ?? []);
	let currentAccessories = $derived(currentProfile?.accessories ?? []);

	/** Fecha y estado del formulario de vacuna nueva. */
	let newVaccineDate = $state('');
	let newVaccineApplied = $state(false);

	/** Fecha y estado del formulario de vacuna en edición. */
	let editVaccineDate = $state('');
	let editVaccineApplied = $state(false);

	// Al abrir el formulario de vacuna nueva, parte vacío.
	$effect(() => {
		if (showVaccineForm) {
			newVaccineDate = '';
			newVaccineApplied = false;
		}
	});

	// Al editar una vacuna, carga su fecha y estado.
	$effect(() => {
		const id = vaccineEditingId;
		if (id === null) return;
		const vaccine = currentVaccines.find((item) => item.id === id);
		if (vaccine) {
			editVaccineDate = vaccine.appliedDate ?? '';
			editVaccineApplied = vaccine.applied;
		}
	});

	// Si se marca como aplicada con fecha futura, la fecha pasa a hoy.
	$effect(() => {
		if (newVaccineApplied && isFutureDate(newVaccineDate)) newVaccineDate = todayISO();
	});
	$effect(() => {
		if (editVaccineApplied && isFutureDate(editVaccineDate)) editVaccineDate = todayISO();
	});

	/** Hoy en ISO (`YYYY-MM-DD`), en hora local. */
	function todayISO(): string {
		const now = new Date();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${now.getFullYear()}-${month}-${day}`;
	}

	/** ¿La fecha es posterior a hoy? Se comparan como texto (`YYYY-MM-DD`). */
	function isFutureDate(value: string): boolean {
		if (!value) return false;
		return value > todayISO();
	}

	/** Orden actual, para mover arriba/abajo. */
	let orderedSlugs = $derived(data.dogs.map((dog) => dog.slug).join(','));

	function resetNews() {
		newsEditingId = null;
		showNewsForm = false;
	}

	function resetCare() {
		vaccineEditingId = null;
		showVaccineForm = false;
		accessoryEditingId = null;
		showAccessoryForm = false;
	}

	function startCreate() {
		editing = null;
		showForm = true;
		resetNews();
		resetCare();
	}

	function startEdit(dog: Dog) {
		editing = dog;
		showForm = true;
		resetNews();
		resetCare();
	}

	function closeForm() {
		showForm = false;
		editing = null;
		resetNews();
		resetCare();
	}
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
					<input name="birthDate" type="date" value={editing?.birthDate ?? ''} />
				</label>

				<label>
					Aproximada
					<div class="switch">
						<input name="isApprox" type="checkbox" class="switch-input" checked={editing?.isApprox ?? false} />
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
					<select name="status" value={editing?.status ?? DOG_STATUSES[0]}>
						{#each data.options.statuses as option (option)}
							<option value={option}>{dogStatusLabels[option] ?? option}</option>
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
				<legend>Esterilizado y visibilidad</legend>
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

		{#if editing}
			<section class="news-block">
				<header class="news-head">
					<h3>Comunicados</h3>
					<button
						class="ghost"
						type="button"
						onclick={() => {
							newsEditingId = null;
							showNewsForm = !showNewsForm;
						}}
					>
						{showNewsForm ? 'Cancelar' : 'Agregar comunicado'}
					</button>
				</header>

				{#if showNewsForm}
					<form
						method="POST"
						action="?/addNews"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
								if (result.type === 'success') showNewsForm = false;
							};
						}}
					>
						<input type="hidden" name="slug" value={editing.slug} />
						<div class="grid">
							<label>
								Tipo
								<select name="kind">
									{#each data.options.kinds as kind (kind)}
										<option value={kind}>{dogNewsKindLabels[kind]}</option>
									{/each}
								</select>
							</label>
							<label>
								Fecha
								<input name="date" type="date" required />
							</label>
						</div>

						<label class="wide">
							Título *
							<input name="title" maxlength="160" required placeholder="Exámenes pendientes" />
						</label>

						<label class="wide">
							Detalle *
							<textarea
								name="body"
								rows="3"
								required
								placeholder="Qué está pasando y qué se necesita…"
							></textarea>
						</label>

						<div class="news-photo">
							<ImageUpload name="photo" folder="comunicados" label="Foto (opcional)" />
						</div>

						<label class="inline">
							<input type="hidden" name="urgent" value="off" />
							<input type="checkbox" name="urgent" value="on" />
							Urgente (necesita ayuda)
						</label>

						<div class="actions">
							<button class="primary" type="submit">Publicar</button>
						</div>
					</form>
				{/if}

				{#if currentNews.length === 0}
					<p class="empty">Sin comunicados todavía.</p>
				{:else}
					<ul class="news-list">
						{#each currentNews as item (item.id)}
							<li>
								{#if newsEditingId === item.id}
									<form
										method="POST"
										action="?/updateNews"
										use:enhance={() => {
											return async ({ result, update }) => {
												await update();
												if (result.type === 'success') newsEditingId = null;
											};
										}}
									>
										<input type="hidden" name="slug" value={editing.slug} />
										<input type="hidden" name="id" value={item.id} />
										<div class="grid">
											<label>
												Tipo
												<select name="kind" value={item.kind}>
													{#each data.options.kinds as kind (kind)}
														<option value={kind}>{dogNewsKindLabels[kind]}</option>
													{/each}
												</select>
											</label>
											<label>
												Fecha
												<input name="date" type="date" value={item.date} required />
											</label>
										</div>
										<label class="wide">
											Título *
											<input name="title" maxlength="160" value={item.title} required />
										</label>
										<label class="wide">
											Detalle *
											<textarea name="body" rows="3" required>{item.body}</textarea>
										</label>
										<div class="news-photo">
											{#key item.id}
												<ImageUpload
													name="photo"
													folder="comunicados"
													label="Foto (opcional)"
													value={item.photo ?? ''}
												/>
											{/key}
										</div>
										<label class="inline">
											<input type="hidden" name="urgent" value="off" />
											<input
												type="checkbox"
												name="urgent"
												value="on"
												checked={item.urgent ?? false}
											/>
											Urgente (necesita ayuda)
										</label>
										<div class="actions">
											<button class="primary" type="submit">Guardar</button>
											<button
												class="ghost"
												type="button"
												onclick={() => (newsEditingId = null)}
											>
												Cancelar
											</button>
										</div>
									</form>
								{:else}
									<div class="news-row">
										<div class="news-info">
											<span class="news-meta">
												{dogNewsKindEmoji[item.kind]}
												{dogNewsKindLabels[item.kind]} · {item.date}
												{#if item.urgent}<span class="tag urgent">Urgente</span>{/if}
											</span>
											<strong>{item.title}</strong>
										</div>
										<div class="row-actions">
											<button
												class="icon"
												type="button"
												title="Editar"
												onclick={() => (newsEditingId = item.id)}
											>
												✏️
											</button>
											<form method="POST" action="?/deleteNews" use:enhance>
												<input type="hidden" name="slug" value={editing.slug} />
												<input type="hidden" name="id" value={item.id} />
												<button
													class="icon danger"
													type="submit"
													title="Borrar"
													onclick={(event) => {
														if (!confirm('¿Borrar este comunicado? No se puede deshacer.')) {
															event.preventDefault();
														}
													}}
												>
													🗑
												</button>
											</form>
										</div>
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="care-block">
				<header class="care-head">
					<h3>Salud</h3>
				</header>

				<form
					method="POST"
					action="?/saveHealth"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
						};
					}}
				>
					<input type="hidden" name="slug" value={editing.slug} />
					<div class="grid">
						<label>
							Último baño integral
							<input name="lastBath" type="date" value={currentHealth?.lastBath ?? ''} />
						</label>
						<label>
							Próximo baño integral
							<input name="nextBath" type="date" value={currentHealth?.nextBath ?? ''} />
						</label>
						<label>
							Fecha visita anual
							<input name="vetVisitDate" type="date" value={currentHealth?.vetVisitDate ?? ''} />
						</label>
						<label class="inline end">
							<input type="checkbox" name="vetVisitDone" checked={currentHealth?.vetVisitDone ?? false} />
							Visita anual hecha
						</label>
					</div>
					<div class="actions">
						<button class="primary" type="submit">Guardar salud</button>
					</div>
				</form>

				<div class="care-sub">
					<header class="care-head">
						<h4>Vacunas</h4>
						<button
							class="ghost"
							type="button"
							onclick={() => {
								vaccineEditingId = null;
								showVaccineForm = !showVaccineForm;
							}}
						>
							{showVaccineForm ? 'Cancelar' : 'Agregar vacuna'}
						</button>
					</header>

					{#if showVaccineForm}
						<div class="suggest">
							<span class="hint">Sugerencias:</span>
							{#each vaccineSuggestions as suggestion (suggestion.name)}
								<form method="POST" action="?/addVaccine" use:enhance>
									<input type="hidden" name="slug" value={editing.slug} />
									<input type="hidden" name="name" value={suggestion.name} />
									<input type="hidden" name="recommendation" value={suggestion.recommendation} />
									<button class="chip" type="submit" title={suggestion.recommendation}>
										{suggestion.name}
									</button>
								</form>
							{/each}
						</div>

						<form
							method="POST"
							action="?/addVaccine"
							use:enhance={() => {
								return async ({ result, update }) => {
									await update();
									if (result.type === 'success') showVaccineForm = false;
								};
							}}
						>
							<input type="hidden" name="slug" value={editing.slug} />
							<div class="grid">
								<label>
									Nombre *
									<input name="name" maxlength="120" required placeholder="Rabia" />
								</label>
								<label>
									Fecha de aplicación
									<input name="appliedDate" type="date" bind:value={newVaccineDate} />
								</label>
							</div>
							<label class="wide">
								Recomendación
								<textarea name="recommendation" rows="2" placeholder="Refuerzo anual…"></textarea>
							</label>
							<label class="inline">
								<input type="checkbox" name="applied" bind:checked={newVaccineApplied} />
								Ya está aplicada
							</label>
							<div class="actions">
								<button class="primary" type="submit">Agregar</button>
							</div>
						</form>
					{/if}

					{#if currentVaccines.length === 0}
						<p class="empty">Sin vacunas registradas.</p>
					{:else}
						<ul class="care-list">
							{#each currentVaccines as vaccine (vaccine.id)}
								<li>
									{#if vaccineEditingId === vaccine.id}
										<form
											method="POST"
											action="?/updateVaccine"
											use:enhance={() => {
												return async ({ result, update }) => {
													await update();
													if (result.type === 'success') vaccineEditingId = null;
												};
											}}
										>
											<input type="hidden" name="slug" value={editing.slug} />
											<input type="hidden" name="id" value={vaccine.id} />
											<div class="grid">
												<label>
													Nombre *
													<input name="name" maxlength="120" value={vaccine.name} required />
												</label>
												<label>
													Fecha de aplicación
													<input name="appliedDate" type="date" bind:value={editVaccineDate} />
												</label>
											</div>
											<label class="wide">
												Recomendación
												<textarea name="recommendation" rows="2">{vaccine.recommendation}</textarea>
											</label>
											<label class="inline">
												<input type="checkbox" name="applied" bind:checked={editVaccineApplied} />
												Ya está aplicada
											</label>
											<div class="actions">
												<button class="primary" type="submit">Guardar</button>
												<button class="ghost" type="button" onclick={() => (vaccineEditingId = null)}>
													Cancelar
												</button>
											</div>
										</form>
									{:else}
										<div class="care-row">
											<div class="care-info">
												<span class="care-meta">
													<span class="tag {vaccine.applied ? 'ok' : 'warn'}">
														{vaccine.applied ? 'Aplicada' : 'Pendiente'}
													</span>
													{#if vaccine.appliedDate}· {vaccine.appliedDate}{/if}
												</span>
												<strong>{vaccine.name}</strong>
												{#if vaccine.recommendation}
													<span class="rec">{vaccine.recommendation}</span>
												{/if}
											</div>
											<div class="row-actions">
												<form
													method="POST"
													action="?/toggleVaccine"
													use:enhance
												>
													<input type="hidden" name="slug" value={editing.slug} />
													<input type="hidden" name="id" value={vaccine.id} />
													<input type="hidden" name="appliedDate" value={vaccine.appliedDate ?? ''} />
													<label
														class="switch"
														title={vaccine.applied ? 'Marcar como pendiente' : 'Marcar como aplicada'}
													>
														<input
															class="switch-input"
															type="checkbox"
															name="applied"
															checked={vaccine.applied}
															aria-label="Aplicada"
															onchange={(event) => event.currentTarget.form?.requestSubmit()}
														/>
														<span class="switch-slider"></span>
													</label>
												</form>
												<button
													class="icon"
													type="button"
													title="Editar"
													onclick={() => (vaccineEditingId = vaccine.id)}
												>
													✏️
												</button>
												<form method="POST" action="?/deleteVaccine" use:enhance>
													<input type="hidden" name="slug" value={editing.slug} />
													<input type="hidden" name="id" value={vaccine.id} />
													<button
														class="icon danger"
														type="submit"
														title="Borrar"
														onclick={(event) => {
															if (!confirm('¿Borrar esta vacuna? No se puede deshacer.')) {
																event.preventDefault();
															}
														}}
													>
														🗑
													</button>
												</form>
											</div>
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="care-sub">
					<header class="care-head">
						<h4>Accesorios y seguridad</h4>
						<button
							class="ghost"
							type="button"
							onclick={() => {
								accessoryEditingId = null;
								showAccessoryForm = !showAccessoryForm;
							}}
						>
							{showAccessoryForm ? 'Cancelar' : 'Agregar accesorio'}
						</button>
					</header>

					{#if showAccessoryForm}
						<div class="suggest">
							<span class="hint">Sugerencias:</span>
							{#each accessorySuggestions as label (label)}
								<form method="POST" action="?/addAccessory" use:enhance>
									<input type="hidden" name="slug" value={editing.slug} />
									<input type="hidden" name="label" value={label} />
									<button class="chip" type="submit">{label}</button>
								</form>
							{/each}
						</div>

						<form
							method="POST"
							action="?/addAccessory"
							use:enhance={() => {
								return async ({ result, update }) => {
									await update();
									if (result.type === 'success') showAccessoryForm = false;
								};
							}}
						>
							<input type="hidden" name="slug" value={editing.slug} />
							<div class="grid">
								<label>
									Nombre *
									<input name="label" maxlength="120" required placeholder="Collar" />
								</label>
								<label>
									Nota (talla, color…)
									<input name="value" maxlength="160" />
								</label>
							</div>
							<label class="inline">
								<input type="checkbox" name="provided" />
								Lo tiene (si no, se marca como «falta»)
							</label>
							<div class="actions">
								<button class="primary" type="submit">Agregar</button>
							</div>
						</form>
					{/if}

					{#if currentAccessories.length === 0}
						<p class="empty">Sin accesorios registrados.</p>
					{:else}
						<ul class="care-list">
							{#each currentAccessories as accessory (accessory.id)}
								<li>
									{#if accessoryEditingId === accessory.id}
										<form
											method="POST"
											action="?/updateAccessory"
											use:enhance={() => {
												return async ({ result, update }) => {
													await update();
													if (result.type === 'success') accessoryEditingId = null;
												};
											}}
										>
											<input type="hidden" name="slug" value={editing.slug} />
											<input type="hidden" name="id" value={accessory.id} />
											<div class="grid">
												<label>
													Nombre *
													<input name="label" maxlength="120" value={accessory.label} required />
												</label>
												<label>
													Nota
													<input name="value" maxlength="160" value={accessory.value ?? ''} />
												</label>
											</div>
											<label class="inline">
												<input type="checkbox" name="provided" checked={accessory.provided} />
												Lo tiene
											</label>
											<div class="actions">
												<button class="primary" type="submit">Guardar</button>
												<button class="ghost" type="button" onclick={() => (accessoryEditingId = null)}>
													Cancelar
												</button>
											</div>
										</form>
									{:else}
										<div class="care-row">
											<div class="care-info">
												<span class="care-meta">
													<span class="tag {accessory.provided ? 'ok' : 'warn'}">
														{accessory.provided ? 'Tiene' : 'Falta'}
													</span>
												</span>
												<strong>{accessory.label}</strong>
												{#if accessory.value}
													<span class="rec">{accessory.value}</span>
												{/if}
											</div>
											<div class="row-actions">
												<form method="POST" action="?/toggleAccessory" use:enhance>
													<input type="hidden" name="slug" value={editing.slug} />
													<input type="hidden" name="id" value={accessory.id} />
													<label
														class="switch"
														title={accessory.provided ? 'Marcar como que falta' : 'Marcar como que lo tiene'}
													>
														<input
															class="switch-input"
															type="checkbox"
															name="provided"
															checked={accessory.provided}
															aria-label="Lo tiene"
															onchange={(event) => event.currentTarget.form?.requestSubmit()}
														/>
														<span class="switch-slider"></span>
													</label>
												</form>
												<button
													class="icon"
													type="button"
													title="Editar"
													onclick={() => (accessoryEditingId = accessory.id)}
												>
													✏️
												</button>
												<form method="POST" action="?/deleteAccessory" use:enhance>
													<input type="hidden" name="slug" value={editing.slug} />
													<input type="hidden" name="id" value={accessory.id} />
													<button
														class="icon danger"
														type="submit"
														title="Borrar"
														onclick={(event) => {
															if (!confirm('¿Borrar este accesorio? No se puede deshacer.')) {
																event.preventDefault();
															}
														}}
													>
														🗑
													</button>
												</form>
											</div>
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</section>
		{/if}
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
					<td><span class="tag">{dogStatusLabels[dog.status] ?? dog.status}</span></td>
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
							<button class="icon" onclick={() => startEdit(dog)} title="Editar">✏️</button>
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
		display: contents;
	}

	.row-actions .switch {
		display: block;
		margin: 0;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
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

	/* ---------- Comunicados (dentro del editor del perrito) ---------- */

	.news-block {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 2px dashed #e2e5e9;
	}

	.news-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.news-head h3 {
		margin: 0;
		font-size: 1rem;
	}

	.news-block form {
		margin-bottom: 0.75rem;
	}

	.news-photo {
		margin: 0.75rem 0;
	}

	.news-block .empty {
		padding: 1rem;
	}

	.news-list {
		list-style: none;
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}

	.news-list > li {
		padding: 0.75rem;
		border: 1px solid #e2e5e9;
		border-radius: 0.5rem;
		background: #fbfcfd;
	}

	.news-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.news-info {
		display: grid;
		gap: 0.125rem;
		min-width: 0;
	}

	.news-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: #5b6470;
	}

	.tag.urgent {
		background: #fdecec;
		color: #b91c1c;
	}

	/* ---------- Salud, vacunas y accesorios (dentro del editor) ---------- */

	.care-block {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 2px dashed #e2e5e9;
	}

	.care-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.care-head h3 {
		margin: 0;
		font-size: 1rem;
	}

	.care-head h4 {
		margin: 0;
		font-size: 0.9375rem;
	}

	.care-sub {
		margin-top: 1.25rem;
	}

	.care-block form {
		margin-bottom: 0.75rem;
	}

	.care-block .empty {
		padding: 1rem;
	}

	label.end {
		align-self: end;
	}

	.suggest {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.75rem;
	}

	.hint {
		font-size: 0.8125rem;
		color: #5b6470;
	}

	.suggest form {
		margin: 0;
		display: inline;
	}

	.chip {
		padding: 0.1875rem 0.625rem;
		border: 1px solid #ccd2d9;
		border-radius: 999px;
		background: #fff;
		font: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
	}

	.chip:hover {
		border-color: #7a3f16;
		color: #7a3f16;
	}

	.care-list {
		list-style: none;
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}

	.care-list > li {
		padding: 0.75rem;
		border: 1px solid #e2e5e9;
		border-radius: 0.5rem;
		background: #fbfcfd;
	}

	.care-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.care-info {
		display: grid;
		gap: 0.125rem;
		min-width: 0;
	}

	.care-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: #5b6470;
	}

	.rec {
		font-size: 0.8125rem;
		color: #5b6470;
	}

	.tag.ok {
		background: #e7f6ec;
		color: #15803d;
	}

	.tag.warn {
		background: #fdf3e0;
		color: #b45309;
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
