/**
 * ¿Un color hex es claro?
 *
 * Acepta `#rrggbb`, `#rgb`, con o sin `#`. Lo irreconocible se considera
 * oscuro para no cambiar el estilo por defecto. Se usa para decidir tintas
 * que contrasten (p. ej. el delineado del nombre en la tarjeta del perrito).
 */
export function isLightColor(hex: string): boolean {
	let clean = hex.trim().replace(/^#/, '');
	if (clean.length === 3) clean = clean.replace(/./g, (char) => char + char);
	if (!/^[0-9a-fA-F]{6}$/.test(clean)) return false;
	const red = parseInt(clean.slice(0, 2), 16);
	const green = parseInt(clean.slice(2, 4), 16);
	const blue = parseInt(clean.slice(4, 6), 16);
	return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.6;
}
