<script lang="ts">
	import type { DogHealth, DogVaccine } from '#lib/data/types';

	/**
	 * Sección de salud del perfil: esterilizado, baños, visita anual y vacunas.
	 * Presentacional: los datos llegan por props desde la capa API.
	 *
	 * Si no hay nada que contar (sin vacunas, sin baños, sin veterinario y sin
	 * esterilizar) no renderiza nada: «sin datos» y «sin sección» son lo mismo.
	 */

	interface Props {
		health: DogHealth | null;
		vaccines: DogVaccine[];
		sterilized: boolean;
		/** Color del perrito, para los acentos. Ausente = marrón de la marca. */
		accent?: string;
	}

	let { health, vaccines, sterilized, accent = '#7a3f16' }: Props = $props();

	const applied = $derived(vaccines.filter((vaccine) => vaccine.applied));
	const pending = $derived(vaccines.filter((vaccine) => !vaccine.applied));
	const hasBaths = $derived(Boolean(health && (health.lastBath || health.nextBath)));
	const hasVet = $derived(Boolean(health && (health.vetVisitDone || health.vetVisitDate)));
	const hasAny = $derived(vaccines.length > 0 || hasBaths || hasVet || sterilized);

	/** Fecha ISO (YYYY-MM-DD) → «10 de octubre de 2026». */
	function formatDate(date: string): string {
		const [year, month, day] = date.split('-').map(Number);
		if (!year || !month || !day) return date;
		return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

{#if hasAny}
	<section class="salud" style="--dog: {accent}" aria-label="Salud">
		<h4>🩺 Salud</h4>

		<dl class="salud-facts">
			<div>
				<dt>Esterilizado</dt>
				<dd>{sterilized ? 'Sí' : 'No'}</dd>
			</div>
			{#if health?.lastBath}
				<div>
					<dt>Último baño integral</dt>
					<dd>{formatDate(health.lastBath)}</dd>
				</div>
			{/if}
			{#if health?.nextBath}
				<div>
					<dt>Próximo baño integral</dt>
					<dd>{formatDate(health.nextBath)}</dd>
				</div>
			{/if}
			{#if hasVet}
				<div>
					<dt>Visita anual</dt>
					<dd>
						{health?.vetVisitDone ? 'Hecha' : 'Falta'}{#if health?.vetVisitDate} · {formatDate(
								health.vetVisitDate
							)}{/if}
					</dd>
				</div>
			{/if}
		</dl>

		{#if vaccines.length > 0}
			<div class="vacunas">
				<h5>Vacunas</h5>

				{#if applied.length > 0}
					<p class="grupo">Aplicadas</p>
					<ul>
						{#each applied as vaccine (vaccine.id)}
							<li>
								<span class="chip">{vaccine.name}</span>
								{#if vaccine.appliedDate}
									<span class="fecha">{formatDate(vaccine.appliedDate)}</span>
								{/if}
								{#if vaccine.recommendation}
									<span class="rec">{vaccine.recommendation}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}

				{#if pending.length > 0}
					<p class="grupo">Pendientes</p>
					<ul>
						{#each pending as vaccine (vaccine.id)}
							<li>
								<span class="chip">{vaccine.name}</span>
								{#if vaccine.appliedDate}
									<span class="fecha">Programada: {formatDate(vaccine.appliedDate)}</span>
								{/if}
								{#if vaccine.recommendation}
									<span class="rec">{vaccine.recommendation}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</section>
{/if}

<style>
	.salud {
		margin-top: 1.25rem;
	}

	.salud h4 {
		margin: 0 0 0.625rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.375rem;
		color: var(--dog);
	}

	.salud-facts {
		display: grid;
		gap: 0.5rem;
		margin: 0;
	}

	.salud-facts > div {
		display: grid;
		grid-template-columns: 9rem 1fr;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.7);
		border: 1px solid color-mix(in srgb, var(--dog) 20%, white);
		font-size: 0.9375rem;
	}

	.salud-facts dt {
		font-weight: 700;
		opacity: 0.7;
	}

	.salud-facts dd {
		margin: 0;
	}

	/* Toda la sección de vacunas va sobre una tarjeta blanca, como el bloque
	   de datos de arriba: se lee como parte de «Salud», no como un aparte. */
	.vacunas {
		margin-top: 0.875rem;
		padding: 0.75rem;
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.7);
		border: 1px solid color-mix(in srgb, var(--dog) 20%, white);
	}

	.vacunas h5 {
		margin: 0 0 0.375rem;
		font-size: 1rem;
		color: var(--dog);
	}

	.grupo {
		margin: 0.5rem 0 0.25rem;
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		opacity: 0.6;
	}

	.vacunas ul {
		list-style: none;
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}

	.vacunas li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.9375rem;
	}

	/* Chips en el café principal de la marca. */
	.chip {
		padding: 0.0625rem 0.5rem;
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 700;
		background: var(--dog);
		color: #fff;
	}

	.fecha {
		opacity: 0.7;
	}

	.rec {
		opacity: 0.85;
		line-height: 1.45;
	}

	@media (max-width: 32rem) {
		.salud-facts > div {
			grid-template-columns: 1fr;
			gap: 0.125rem;
		}
	}
</style>
