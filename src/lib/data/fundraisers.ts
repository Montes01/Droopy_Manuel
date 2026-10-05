import { alivePackSlugs, packFromSlugs } from './dogs';
import type { BankAccount } from './types';

/**
 * Perritos a los que se puede dirigir una estrella. Reusa la manada viva de
 * /manada para que las dos páginas muestren a los mismos perritos, en el mismo
 * orden. Todavía no hay metas ni montos por perrito: eso llega con el backend.
 */
export const donationTargets = packFromSlugs(alivePackSlugs);

/**
 * Cuentas de la fundación. Datos totalmente simulados para desarrollo:
 * reemplazar por los reales antes de publicar.
 */
export const bankAccounts: BankAccount[] = [
	{
		bank: 'Bancolombia',
		emoji: '🏦',
		method: 'transferencia',
		holder: 'Fundación Animales de Droopy Manuel',
		fields: [
			{ label: 'Tipo de cuenta', value: 'Ahorros' },
			{ label: 'Número', value: '1234567890', copyable: true }
		]
	},
	{
		bank: 'Nequi',
		emoji: '📱',
		method: 'billetera',
		holder: 'Fundación Animales de Droopy Manuel',
		fields: [{ label: 'Número', value: '3001234567', copyable: true }]
	},
	{
		bank: 'Daviplata',
		emoji: '📲',
		method: 'billetera',
		holder: 'Fundación Animales de Droopy Manuel',
		fields: [
			{ label: 'Tipo de documento', value: 'Cédula de ciudadanía' },
			{ label: 'Número', value: '123456789', copyable: true }
		]
	},
	{
		bank: 'PayPal',
		emoji: '🌐',
		method: 'internacional',
		holder: 'Fundación Animales de Droopy Manuel',
		fields: [{ label: 'Correo', value: 'donaciones@droopymanuel.co', copyable: true }]
	}
];