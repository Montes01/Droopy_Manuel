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
