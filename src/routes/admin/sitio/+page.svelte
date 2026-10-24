<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingTier = $state<number | null>(null);
	let editingTestimonial = $state<number | null>(null);
	let editingSocial = $state<string | null>(null);

	/** Redes gestionables: WhatsApp se edita desde su número, no aquí. */
	const socials = $derived((data.contact.socials ?? []).filter((s) => s.key !== 'whatsapp'));

	/** Iconos disponibles en /static/icons. */
	const knownIcons = [
		'/icons/instagram.png',
		'/icons/tiktok.png',
		'/icons/facebook.png',
		'/icons/youtube.png',
		'/icons/whatsapp.png'
	];

	const methodLabels: Record<string, string> = {
		transferencia: 'Transferencia',
		billetera: 'Billetera',
		internacional: 'Internacional'
	};

	function formatCOP(cents: number): string {
		return '$' + Math.round(cents / 100).toLocaleString('es-CO');
	}

	/** El número de WhatsApp se edita solo con dígitos. */
	let whatsappInput = $state(untrack(() => data.contact.whatsappNumber));

	/** Perks como texto, una línea cada uno, para el textarea. */
	function perksText(perks: string[]): string {
		return perks.join('\n');
	}
</script>

<svelte:head>
	<title>Sitio · Panel</title>
</svelte:head>

<h1>Sitio</h1>
<p class="lead">Textos, contacto, donaciones y cuentas de la fundación.</p>

{#if form?.error}
	<p class="alert error" role="alert">{form.error}</p>
{/if}
{#if form?.success}
	<p class="alert ok" role="status">{form.message}</p>
{/if}

<!-- ------------------------------------------------------------- Contacto -->
<section class="card">
	<h2>Contacto</h2>

	<div class="split">
		<form
			method="POST"
			action="?/saveWhatsapp"
			use:enhance
		>
			<label>
				WhatsApp (formato internacional, sin signos) *
				<input
					name="whatsappNumber"
					value={whatsappInput}
					placeholder="573226438857"
					inputmode="numeric"
					required
				/>
			</label>
			<p class="hint">
				Se muestra como <strong>{data.contact.whatsappDisplay || '—'}</strong> y el enlace es
				<code>{data.contact.whatsappUrl || '—'}</code>. Ambos se calculan solos a partir del número,
				así que no pueden quedar desfasados.
			</p>
			<button class="primary" type="submit">Guardar número</button>
		</form>

		<form method="POST" action="?/saveEmail" use:enhance>
			<label>
				Correo de contacto *
				<input name="email" type="email" value={data.contact.email} required />
			</label>
			<p class="hint">Aparece en la web y se usa como respuesta en los correos de pedido.</p>
			<button class="primary" type="submit">Guardar correo</button>
		</form>
	</div>

	{#if socials.length > 0}
		<h3>Redes</h3>
		<ul class="socials">
			{#each socials as social (social.key)}
				<li>
					{#if editingSocial === social.key}
						<form
							class="social-edit"
							method="POST"
							action="?/updateSocial"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									editingSocial = null;
								};
							}}
						>
							<input type="hidden" name="key" value={social.key} />
							<div class="grid">
								<label>Nombre *<input name="label" value={social.label} required /></label>
								<label class="wide">Enlace *<input name="href" value={social.href} required /></label>
								<label class="wide">
									Icono
									<input name="icon" value={social.icon} list="social-icons" />
								</label>
							</div>
							<div class="actions">
								<button class="primary small" type="submit">Guardar</button>
								<button
									class="ghost small"
									type="button"
									onclick={() => (editingSocial = null)}
								>
									Cancelar
								</button>
							</div>
						</form>
					{:else}
						<img src={social.icon} alt="" width="18" height="18" />
						<span>{social.label}</span>
						<a href={social.href} target="_blank" rel="noreferrer">{social.href}</a>
						<div class="row-actions">
							<button class="icon" onclick={() => (editingSocial = social.key)} title="Editar">✎</button>
							<form method="POST" action="?/deleteSocial" use:enhance>
								<input type="hidden" name="key" value={social.key} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar la red ${social.label}?`)) event.preventDefault();
									}}
								>
									🗑
								</button>
							</form>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<details class="add">
		<summary>Agregar red</summary>
		<form method="POST" action="?/createSocial" use:enhance>
			<div class="grid">
				<label>Nombre *<input name="label" placeholder="Instagram" required /></label>
				<label class="wide">Enlace *<input name="href" placeholder="https://instagram.com/…" required /></label>
				<label class="wide">
					Icono (opcional)
					<input name="icon" placeholder="/icons/instagram.png" list="social-icons" />
				</label>
			</div>
			<p class="hint">Si no indicas icono se usa <code>/icons/&lt;nombre&gt;.png</code>.</p>
			<button class="primary" type="submit">Agregar red</button>
		</form>
	</details>
	<datalist id="social-icons">
		{#each knownIcons as icon}
			<option value={icon}></option>
		{/each}
	</datalist>
</section>

<!-- ------------------------------------------------------- Anuncio de inicio -->
<section class="card">
	<h2>Anuncio de inicio</h2>
	<p class="hint">
		El pop-up que aparece al entrar a la portada, con los últimos perritos en adopción.
		Se muestra una vez por día a cada visitante.
	</p>

	<form method="POST" action="?/saveAnnouncement" use:enhance>
		<label class="check">
			<input type="checkbox" name="enabled" checked={data.announcement.enabled} />
			Mostrar el anuncio al entrar a la portada
		</label>

		<div class="grid">
			<label>
				Perritos a mostrar *
				<input
					name="dogsCount"
					type="number"
					min="1"
					max="12"
					value={data.announcement.dogsCount}
					required
				/>
			</label>
			<label>
				Título *
				<input name="title" value={data.announcement.title} maxlength="120" required />
			</label>
			<label class="wide">
				Mensaje (opcional)
				<textarea name="message" rows="2" maxlength="300">{data.announcement.message}</textarea>
			</label>
		</div>

		<p class="hint">
			Se mostrarán los últimos <strong>{data.announcement.dogsCount}</strong> perritos con
			estado «En adopción», del más reciente al más antiguo.
		</p>

		<button class="primary" type="submit">Guardar anuncio</button>
	</form>
</section>

<!-- --------------------------------------------------------- Sobre nosotros -->
<section class="card">
	<h2>Sobre nosotros</h2>
	<form method="POST" action="?/saveAbout" use:enhance>
		<label>
			Texto de la portada
			<textarea name="aboutBlurb" rows="3">{data.content.aboutBlurb}</textarea>
		</label>
		<button class="primary" type="submit">Guardar texto</button>
	</form>
</section>

<!-- ---------------------------------------------------------- Estadísticas -->
<section class="card">
	<h2>Estadísticas</h2>
	<form method="POST" action="?/saveStats" use:enhance>
		<div class="stats-grid">
			<label>
				Rescatados
				<input name="rescued" type="number" min="0" value={data.content.stats.rescued} required />
			</label>
			<label>
				Adoptados
				<input name="adopted" type="number" min="0" value={data.content.stats.adopted} required />
			</label>
			<label>
				Esterilizados
				<input name="sterilized" type="number" min="0" value={data.content.stats.sterilized} required />
			</label>
			<label>
				En cuidado
				<input name="inCare" type="number" min="0" value={data.content.stats.inCare} required />
			</label>
		</div>
		<button class="primary" type="submit">Guardar estadísticas</button>
	</form>
</section>

<!-- ------------------------------------------------- Niveles de donación -->
<section class="card">
	<h2>Niveles de donación</h2>

	{#if data.tiers.length === 0}
		<p class="empty">No hay niveles.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Estrellas</th>
						<th>Nombre</th>
						<th>Precio</th>
						<th>Beneficios</th>
						<th class="right">Acciones</th>
					</tr>
				</thead>
			<tbody>
				{#each data.tiers as tier (tier.stars)}
					{#if editingTier === tier.stars}
						<!--
							Una fila de edición con un único formulario que abarca toda
							la fila: un <form> no puede empezar en una celda y terminar
							en otra, así que la fila entera es el formulario.
						-->
						<tr>
							<td colspan="5">
								<form
									class="tier-edit"
									method="POST"
									action="?/updateTier"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											editingTier = null;
										};
									}}
								>
									<input type="hidden" name="stars" value={tier.stars} />
									<div class="grid">
										<label>Estrellas<input value={tier.stars} disabled /></label>
										<label>Nombre *<input name="name" value={tier.name} required /></label>
										<label>
											Precio en pesos *
											<input
												name="price"
												inputmode="numeric"
												value={Math.round(tier.priceCents / 100)}
												required
											/>
										</label>
										<label class="wide">Descripción *<input name="blurb" value={tier.blurb} required /></label>
										<label class="wide">
											Beneficios (uno por línea)
											<textarea name="perks" rows="3">{perksText(tier.perks)}</textarea>
										</label>
									</div>
									<div class="actions">
										<button class="primary small" type="submit">Guardar</button>
										<button
											class="ghost small"
											type="button"
											onclick={() => (editingTier = null)}
										>
											Cancelar
										</button>
									</div>
								</form>
							</td>
						</tr>
					{:else}
						<tr>
							<td><strong>{tier.stars}</strong> ★</td>
							<td>{tier.name}</td>
							<td>{formatCOP(tier.priceCents)}</td>
							<td class="perks">
								<span class="blurb">{tier.blurb}</span>
								<span class="perk-list">{tier.perks.join(' · ')}</span>
							</td>
							<td class="right">
								<div class="row-actions">
									<button class="icon" onclick={() => (editingTier = tier.stars)} title="Editar">✎</button>
									<form method="POST" action="?/deleteTier" use:enhance>
										<input type="hidden" name="stars" value={tier.stars} />
										<button
											class="icon danger"
											type="submit"
											title="Borrar"
											onclick={(event) => {
												if (!confirm(`¿Borrar el nivel ${tier.name}?`)) event.preventDefault();
											}}
										>
											🗑
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			</table>
		</div>
	{/if}

	<details class="add">
		<summary>Agregar nivel</summary>
		<form method="POST" action="?/createTier" use:enhance>
			<div class="grid">
				<label>Estrellas *<input name="stars" type="number" min="1" required /></label>
				<label>Nombre *<input name="name" required /></label>
				<label>Precio en pesos *<input name="price" inputmode="numeric" required /></label>
				<label class="wide">Descripción *<input name="blurb" required /></label>
				<label class="wide">
					Beneficios (uno por línea)
					<textarea name="perks" rows="3"></textarea>
				</label>
			</div>
			<button class="primary" type="submit">Crear nivel</button>
		</form>
	</details>
</section>

<!-- ------------------------------------------------------------ Testimonios -->
<section class="card">
	<h2>Testimonios</h2>

	{#if data.testimonials.length === 0}
		<p class="empty">No hay testimonios.</p>
	{:else}
		<ul class="testimonials">
			{#each data.testimonials as testimonial (testimonial.id)}
				<li>
					{#if editingTestimonial === testimonial.id}
						<form method="POST" action="?/updateTestimonial" use:enhance={() => {
							return async ({ update }) => { await update(); editingTestimonial = null; };
						}}>
							<input type="hidden" name="id" value={testimonial.id} />
							<div class="grid">
								<label>Nombre *<input name="name" value={testimonial.name} required /></label>
								<label>Rol *<input name="role" value={testimonial.role} required /></label>
								<label class="wide">Cita *<textarea name="quote" rows="3" required>{testimonial.quote}</textarea></label>
								<label>
									Perrito (opcional)
									<select name="dog" value={testimonial.dog ?? ''}>
										<option value="">— Sin perrito —</option>
										{#each data.dogs as dog (dog.slug)}
											<option value={dog.slug}>{dog.name} ({dog.slug})</option>
										{/each}
									</select>
								</label>
							</div>
							<div class="actions">
								<button class="primary small" type="submit">Guardar</button>
								<button class="ghost small" type="button" onclick={() => (editingTestimonial = null)}>Cancelar</button>
							</div>
						</form>
					{:else}
						<p class="quote">«{testimonial.quote}»</p>
						<p class="who">
							<strong>{testimonial.name}</strong> · {testimonial.role}
							{#if testimonial.dog}· <code>{testimonial.dog}</code>{/if}
						</p>
						<div class="row-actions">
							<button class="icon" onclick={() => (editingTestimonial = testimonial.id ?? null)} title="Editar">✎</button>
							<form method="POST" action="?/deleteTestimonial" use:enhance>
								<input type="hidden" name="id" value={testimonial.id} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar el testimonio de ${testimonial.name}?`)) event.preventDefault();
									}}
								>
									🗑
								</button>
							</form>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<details class="add">
		<summary>Agregar testimonio</summary>
		<form method="POST" action="?/createTestimonial" use:enhance>
			<div class="grid">
				<label>Nombre *<input name="name" required /></label>
				<label>Rol *<input name="role" required /></label>
				<label class="wide">Cita *<textarea name="quote" rows="3" required></textarea></label>
				<label>
					Perrito (opcional)
					<select name="dog">
						<option value="">— Sin perrito —</option>
						{#each data.dogs as dog (dog.slug)}
							<option value={dog.slug}>{dog.name} ({dog.slug})</option>
						{/each}
					</select>
				</label>
			</div>
			<button class="primary" type="submit">Agregar</button>
		</form>
	</details>
</section>

<!-- ------------------------------------------------------ Cuentas bancarias -->
<section class="card">
	<h2>Cuentas para donaciones</h2>

	{#if data.accounts.length === 0}
		<p class="empty">No hay cuentas.</p>
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Banco</th>
						<th>Método</th>
						<th>Titular</th>
						<th>Datos</th>
						<th class="right">Acciones</th>
					</tr>
				</thead>
			<tbody>
				{#each data.accounts as account (account.id)}
					<tr>
						<td>{#if account.emoji}{account.emoji} {/if}<strong>{account.bank}</strong></td>
						<td><span class="tag">{methodLabels[account.method] ?? account.method}</span></td>
						<td>{account.holder}</td>
						<td>
							<ul class="fields">
								{#each account.fields as field (field.label)}
									<li>
										<span class="flabel">{field.label}:</span> {field.value}
										{#if field.copyable}<span class="copy" title="Se copia desde la web">copiable</span>{/if}
									</li>
								{/each}
							</ul>
						</td>
						<td class="right">
							<form method="POST" action="?/deleteAccount" use:enhance>
								<input type="hidden" name="id" value={account.id} />
								<button
									class="icon danger"
									type="submit"
									title="Borrar"
									onclick={(event) => {
										if (!confirm(`¿Borrar la cuenta de ${account.bank}?`)) event.preventDefault();
									}}
								>
									🗑
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
			</table>
		</div>
	{/if}

	<details class="add">
		<summary>Agregar cuenta</summary>
		<form method="POST" action="?/createAccount" use:enhance>
			<div class="grid">
				<label>Banco *<input name="bank" required /></label>
				<label>Emoji (opcional)<input class="emoji-input" name="emoji" placeholder="🏦" /></label>
				<label>
					Método *
					<select name="method">
						<option value="transferencia">Transferencia</option>
						<option value="billetera">Billetera</option>
						<option value="internacional">Internacional</option>
					</select>
				</label>
				<label>Titular *<input name="holder" value="Fundación Animales de Droopy Manuel" required /></label>
				<label>Tipo de cuenta<input name="type" placeholder="Ahorros" /></label>
				<label>Número *<input name="number" required /></label>
			</div>
			<button class="primary" type="submit">Agregar cuenta</button>
		</form>
	</details>
</section>

<style>
	h1 {
		margin: 0 0 0.25rem;
		font-size: 1.5rem;
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
	}

	h3 {
		margin: 1.25rem 0 0.5rem;
		font-size: 0.9375rem;
	}

	.lead {
		margin: 0 0 1.5rem;
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

	.card {
		margin-bottom: 1.5rem;
		padding: 1.25rem;
		background: #fff;
		border: 1px solid #e2e5e9;
		border-radius: 0.625rem;
	}

	.split {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 1.5rem;
	}

	.grid,
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 0.75rem;
		margin-bottom: 0.75rem;
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

	label.check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		cursor: pointer;
	}

	label.check input {
		width: auto;
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

	.hint {
		margin: 0.5rem 0;
		font-size: 0.8125rem;
		color: #5b6470;
		line-height: 1.5;
	}

	.empty {
		margin: 0;
		padding: 1rem;
		text-align: center;
		color: #5b6470;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.socials,
	.fields {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.socials li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
		font-size: 0.875rem;
		flex-wrap: wrap;
	}

	.socials a {
		color: #2563eb;
		text-decoration: none;
		word-break: break-all;
	}

	.socials a:hover {
		text-decoration: underline;
	}

	table {
		width: 100%;
		min-width: 36rem;
		border-collapse: collapse;
		font-size: 0.9375rem;
	}

	th,
	td {
		padding: 0.5rem 0.625rem;
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

	.right {
		text-align: right;
	}

	.perks {
		max-width: 22rem;
	}

	.blurb,
	.perk-list {
		display: block;
		font-size: 0.875rem;
	}

	.perk-list {
		color: #5b6470;
		margin-top: 0.25rem;
	}

	.flabel {
		color: #5b6470;
	}

	.copy {
		margin-left: 0.375rem;
		padding: 0.0625rem 0.375rem;
		border-radius: 1rem;
		background: #ecfdf5;
		color: #047857;
		font-size: 0.75rem;
	}

	.tier-edit {
		padding: 0.25rem 0;
	}

	.social-edit {
		flex: 1 1 100%;
	}

	.testimonials {
		list-style: none;
		margin: 0 0 0.75rem;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}

	.testimonials li {
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.quote {
		margin: 0 0 0.375rem;
		font-style: italic;
	}

	.who {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
		color: #5b6470;
	}

	.add {
		margin-top: 0.75rem;
	}

	.add summary {
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.add form {
		margin-top: 0.75rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.row-actions {
		display: inline-flex;
		gap: 0.25rem;
		align-items: center;
	}

	.row-actions form {
		display: inline;
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

	button.primary.small,
	button.ghost.small {
		padding: 0.375rem 0.625rem;
		font-size: 0.875rem;
	}

	button.ghost {
		border: 1px solid #ccd2d9;
		border-radius: 0.375rem;
		background: #fff;
		font: inherit;
		cursor: pointer;
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

	code {
		font-size: 0.75rem;
		background: #f1f3f5;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.25rem;
		word-break: break-all;
	}

	@media (max-width: 40rem) {
		.card {
			padding: 0.875rem;
		}

		.split {
			gap: 1rem;
		}

		.grid,
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.perks {
			max-width: none;
		}

		.actions {
			flex-wrap: wrap;
		}

		.actions button {
			flex: 1 1 auto;
		}
	}
</style>
