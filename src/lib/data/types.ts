export type DogStatus = 'en-adopcion' | 'hogar-temporal' | 'adoptado' | 'en-memoria';

export type DogSize = 'pequeño' | 'mediano' | 'grande';

export interface Dog {
	slug: string;
	name: string;
	breed: string;
	ageYears: number;
	ageLabel: string;
	sex: 'macho' | 'hembra';
	size: DogSize;
	energy: 'tranquilo' | 'moderado' | 'juguetón';
	goodWith: { kids: boolean; dogs: boolean; cats: boolean };
	vaccinated: boolean;
	sterilized: boolean;
	status: DogStatus;
	arrival: string;
	traits: string[];
	story: string;
	/** Ruta en /static cuando haya foto real. Null = avatar con inicial. */
	photo: string | null;
	featured?: boolean;
}

/** Medio por el que se puede pagar: define la etiqueta del badge. */
export type PaymentMethod = 'transferencia' | 'billetera' | 'internacional';

/** Un dato de la cuenta. Solo `copyable` ofrece botón de copiar. */
export interface AccountField {
	label: string;
	value: string;
	copyable?: boolean;
}

export interface BankAccount {
	bank: string;
	emoji: string;
	method: PaymentMethod;
	holder: string;
	/** El campo con `copyable` es el que la persona transcribe al transferir. */
	fields: AccountField[];
}

export interface DonationTier {
	stars: number;
	name: string;
	price: number;
	currency: string;
	blurb: string;
	perks: string[];
}

export interface Testimonial {
	name: string;
	role: string;
	quote: string;
	dog?: string;
}

export interface SiteStats {
	rescued: number;
	adopted: number;
	sterilized: number;
	inCare: number;
}
