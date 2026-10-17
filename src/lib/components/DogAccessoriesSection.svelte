<script lang="ts">
	import type { DogAccessory } from '#lib/data/types';

	/**
	 * Sección de accesorios y seguridad del perfil: qué tiene el perrito y qué
	 * le falta. Presentacional: los datos llegan por props desde la capa API.
	 *
	 * Si la lista está vacía no renderiza nada.
	 */

	interface Props {
		accessories: DogAccessory[];
		/** Color del perrito, para los acentos. Ausente = marrón de la marca. */
		accent?: string;
	}

	let { accessories, accent = '#7a3f16' }: Props = $props();
</script>

{#if accessories.length > 0}
	<section class="accesorios" style="--dog: {accent}" aria-label="Accesorios y seguridad">
		<h4>🎒 Accesorios y seguridad</h4>
		<ul>
			{#each accessories as accessory (accessory.id)}
				<li class:missing={!accessory.provided}>
					<span class="badge">{accessory.provided ? '✓ Tiene' : 'Falta'}</span>
					<span class="label">{accessory.label}</span>
					{#if accessory.value}
						<span class="value">{accessory.value}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.accesorios {
		margin-top: 1.25rem;
	}

	.accesorios h4 {
		margin: 0 0 0.625rem;
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.375rem;
		color: var(--dog);
	}

	ul {
		list-style: none;
		display: grid;
		gap: 0.375rem;
		margin: 0;
		padding: 0;
	}

	li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		background: rgb(255 255 255 / 0.7);
		border: 1px solid color-mix(in srgb, var(--dog) 20%, white);
		font-size: 0.9375rem;
	}

	li.missing {
		background: #fff7ed;
		border-color: #fed7aa;
	}

	.badge {
		padding: 0.0625rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		background: #e7f6ec;
		color: #15803d;
	}

	li.missing .badge {
		background: #fdebd3;
		color: #b45309;
	}

	.label {
		font-weight: 700;
	}

	.value {
		opacity: 0.75;
	}
</style>
