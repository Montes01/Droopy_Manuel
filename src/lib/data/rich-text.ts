/**
 * Texto enriquecido mínimo para contenido del panel.
 *
 * Los párrafos llegan en texto plano y `**negrita**` es el único formato: se
 * escapa el HTML y luego se convierten los pares `**…**` en `<strong>`. Un
 * `**` sin cerrar se deja como texto literal.
 */
export function renderRichText(text: string): string {
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
	return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
