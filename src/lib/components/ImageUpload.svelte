<script lang="ts">
	import { untrack } from 'svelte';

	/**
	 * Subida de imagen a Vercel Blob para el panel.
	 *
	 * Cuadro clásico: marco cuadrado con texto interior; al elegir, la vista
	 * previa llena el cuadro. Expone un solo campo `name` con la URL (editable
	 * a mano, como antes), así las acciones del formulario no cambian. Usar
	 * dentro de `{#key id}` para reiniciar al cambiar de ítem en edición.
	 */

	interface Props {
		name?: string;
		value?: string;
		folder?: string;
		label?: string;
	}

	let { name = 'photo', value = '', folder = 'admin', label = 'Foto' }: Props = $props();

	let current = $state(untrack(() => value));
	let uploading = $state(false);
	let error = $state<string | null>(null);

	function isBlobUrl(url: string): boolean {
		try {
			return new URL(url).hostname.endsWith('.blob.vercel-storage.com');
		} catch {
			return false;
		}
	}

	async function onFile(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		uploading = true;
		error = null;
		try {
			const form = new FormData();
			form.append('file', file);
			form.append('folder', folder);
			if (isBlobUrl(current)) form.append('previousUrl', current);

			const response = await fetch('/api/upload', { method: 'POST', body: form });
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(
					body && typeof body === 'object' && 'message' in body
						? String((body as { message: unknown }).message)
						: `Subida fallida (${response.status}).`
				);
			}
			const { url } = (await response.json()) as { url: string };
			current = url;
		} catch (err) {
			error = err instanceof Error ? err.message : 'No se pudo subir la imagen.';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="photo-field">
	<span class="field-label">{label}</span>
	<label class="drop">
		<input type="file" accept="image/*" onchange={onFile} disabled={uploading} />
		{#if current}
			<img class="preview" src={current} alt="" />
			<span class="change">{uploading ? 'Subiendo…' : 'Cambiar imagen'}</span>
		{:else}
			<span class="inner">
				<span class="icon" aria-hidden="true">📷</span>
				<span class="action">{uploading ? 'Subiendo…' : 'Elegir imagen'}</span>
				<small>JPG · PNG · máx 4 MB</small>
			</span>
		{/if}
	</label>
	<input type="hidden" {name} value={current} />
	{#if uploading}<p class="hint">Subiendo a Vercel Blob, espera a que termine…</p>{/if}
	{#if error}<p class="error" role="alert">{error}</p>{/if}
</div>

<style>
	.photo-field {
		display: grid;
		gap: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.drop {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		max-width: 13rem;
		aspect-ratio: 1;
		overflow: hidden;
		border: 2px dashed #b9c2cb;
		border-radius: 0.75rem;
		background: #f7f9fb;
		cursor: pointer;
	}

	.drop:hover {
		border-color: #7a3f16;
		background: #fdf8f1;
	}

	.drop input[type='file'] {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		overflow: hidden;
	}

	.inner {
		display: grid;
		gap: 0.25rem;
		justify-items: center;
		padding: 1rem;
		text-align: center;
		color: #5b6470;
	}

	.icon {
		font-size: 2rem;
		line-height: 1;
	}

	.action {
		color: #7a3f16;
	}

	.inner small {
		font-weight: 400;
		font-size: 0.75rem;
	}

	.preview {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.change {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		padding: 0.375rem;
		text-align: center;
		font-size: 0.75rem;
		background: rgb(0 0 0 / 0.6);
		color: #fff;
	}

	.hint {
		margin: 0;
		font-weight: 400;
		color: #5b6470;
	}

	.error {
		margin: 0;
		font-weight: 400;
		color: #b91c1c;
	}
</style>
