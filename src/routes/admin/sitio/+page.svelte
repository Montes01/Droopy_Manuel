<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingTier = $state<number | null>(null);
	let editingTestimonial = $state<number | null>(null);

	const methodLabels: Record<string, string> = {
		transferencia: 'Transferencia',
		billetera: 'Billetera',
		internacional: 'Internacional'
	};

	function formatCOP(cents: number): string {
		return '$' + Math.round(cents / 100).toLocaleString('es-CO');
	}

	/** El número de WhatsApp se edita solo con dígitos. */
	let whatsappInput = $state(data.contact.whatsappNumber);

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

	{#if data.contact.socials.length > 0}
		<h3>Redes</h3>
		<ul class="socials">
			{#each data.contact.socials as social (social.label)}
				<li>
					<img src={social.icon} alt="" width="18" height="18" />
					<span>{social.label}</span>
					<a href={social.href} target="_blank" rel="noreferrer">{social.href}</a>
				</li>
			{/each}
		</ul>
	{/if}
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
								<label>Perrito (slug)<input name="dog" value={testimonial.dog ?? ''} /></label>
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
				<label>Perrito (slug, opcional)<input name="dog" placeholder="toby" /></label>
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
						<td>{account.emoji} <strong>{account.bank}</strong></td>
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
	{/if}

	<details class="add">
		<summary>Agregar cuenta</summary>
		<form method="POST" action="?/createAccount" use:enhance>
			<div class="grid">
				<label>Banco *<input name="bank" required /></label>
				<label>Emoji *<input class="emoji-input" name="emoji" placeholder="🏦" required /></label>
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
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
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

	.price-input {
		width: 7rem;
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

	.inline-edit {
		display: flex;
		gap: 0.25rem;
	}

	.tier-edit {
		padding: 0.25rem 0;
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
	}
</style>
