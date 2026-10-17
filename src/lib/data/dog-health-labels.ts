/**
 * Constantes de presentación de la salud del perrito.
 *
 * No son datos del backend: los datos llegan de la API (`#lib/api/dogs`). Aquí
 * viven las sugerencias que el panel ofrece al crear y las etiquetas visibles.
 */

/** Nombre de vacuna con su recomendación típica, para sugerir en el panel. */
export interface VaccineSuggestion {
	name: string;
	recommendation: string;
}

/**
 * Vacunas frecuentes con su recomendación por defecto.
 *
 * Son un punto de partida editable: el panel las ofrece al crear una vacuna,
 * pero el texto se guarda por perrito y se puede cambiar.
 */
export const vaccineSuggestions: VaccineSuggestion[] = [
	{ name: 'Rabia', recommendation: 'Obligatoria por ley. Refuerzo cada año.' },
	{
		name: 'Polivalente',
		recommendation: 'Cubre parvovirus, moquillo y hepatitis. Refuerzo anual.'
	},
	{ name: 'Parvovirus', recommendation: 'Incluida en la polivalente; refuerzo anual.' },
	{ name: 'Moquillo', recommendation: 'Incluida en la polivalente; refuerzo anual.' },
	{
		name: 'Leptospira',
		recommendation: 'Recomendada en zonas húmedas. Refuerzo anual.'
	},
	{ name: 'Bordetella', recommendation: 'Recomendada antes de guardería o eventos.' },
	{ name: 'Refuerzo anual', recommendation: 'Dosis de mantenimiento.' }
];

/** Accesorios y elementos de seguridad sugeridos, con un clic en el panel. */
export const accessorySuggestions: string[] = [
	'Collar',
	'Arnés',
	'Placa de identificación',
	'Correa',
	'Microchip',
	'Cama',
	'Transportadora'
];
