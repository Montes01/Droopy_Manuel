import type { DonationTier, SiteStats, Testimonial } from './types';

export const stats: SiteStats = {
	rescued: 248,
	adopted: 196,
	sterilized: 312,
	inCare: 34
};

export const donationTiers: DonationTier[] = [
	{
		stars: 1,
		name: 'Estrella Cachorra',
		price: 50,
		currency: 'MXN',
		blurb: 'Un día de croquetas para un rescatado.',
		perks: ['Mención en el muro de estrellas', 'Foto de agradecimiento']
	},
	{
		stars: 3,
		name: 'Estrella Guardián',
		price: 150,
		currency: 'MXN',
		blurb: 'Vacunas y desparasitación de un rescate nuevo.',
		perks: ['Todo lo anterior', 'Carta del perrito que ayudaste', 'Sticker de la manada']
	},
	{
		stars: 5,
		name: 'Estrella Arcoíris',
		price: 300,
		currency: 'MXN',
		blurb: 'Esterilización completa + seguimiento post-operatorio.',
		perks: ['Todo lo anterior', 'Videollamada con la manada', 'Tu nombre en una casita del refugio']
	},
	{
		stars: 12,
		name: 'Constelación Droopy',
		price: 600,
		currency: 'MXN',
		blurb: 'Apadrina a un perrito por un mes: comida, vet y amor.',
		perks: ['Todo lo anterior', 'Padrino oficial con certificado', 'Visitas programadas al refugio']
	}
];

export const testimonials: Testimonial[] = [
	{
		name: 'Familia Hernández',
		role: 'Adoptantes de Toby',
		quote:
			'Nos pidieron paciencia las primeras semanas y tenían razón: Toby hoy es el centro de la casa. Adoptar con acompañamiento lo cambia todo.',
		dog: 'toby'
	},
	{
		name: 'Mariana G.',
		role: 'Voluntaria desde 2022',
		quote:
			'Empecé paseando perros los sábados y terminé coordinando hogares temporales. La manada te atrapa, en el buen sentido.',
		dog: 'rocky'
	},
	{
		name: 'Enfermera Paola R.',
		role: 'Adoptante de Max',
		quote:
			'Max y yo visitamos hospitales cada semana. Ver a un paciente sonreír por primera vez gracias a él no tiene precio.',
		dog: 'max'
	},
	{
		name: 'Don Emilio',
		role: 'Padrino Constelación',
		quote:
			'Apadrino a dos perritos al mes. Me mandan fotos y avances: es la mejor suscripción que tengo, por mucho.',
		dog: 'canela'
	}
];

export interface Achievement {
	title: string;
	date: string;
	excerpt: string;
	/** Ruta en /static cuando haya foto real. Null = holder ilustrado. */
	image: string | null;
}

export const achievementsNews: Achievement[] = [
	{
		title: 'Jornada masiva de esterilización',
		date: '2026-09-12',
		excerpt:
			'Esterilizamos a 40 perritos comunitarios en un solo fin de semana junto a dos clínicas aliadas. Cero camadas callejeras nacen de la prevención.',
		image: null
	},
	{
		title: 'Luna encontró a su familia',
		date: '2026-08-28',
		excerpt:
			'Después de 9 meses con nosotros, Luna se fue a casa con los Fernández. Lloramos, reímos y le preparamos su mochila de despedida.',
		image: null
	},
	{
		title: 'Nuevo techo para la manada',
		date: '2026-07-15',
		excerpt:
			'Gracias a las Estrellas Arcoíris inauguramos 6 casitas nuevas con techo térmico. Los días de lluvia ya no nos preocupan.',
		image: null
	},
	{
		title: 'Max, perro de terapia certificado',
		date: '2026-05-30',
		excerpt:
			'Max aprobó su certificación y ya visita hospitales cada semana. Del abandono a sanar corazones: orgullo total de la manada.',
		image: null
	}
];

export const aboutBlurb =
	'Somos una fundación dedicada al rescate, rehabilitación y adopción de perritos. Cada estrella que donas se convierte en croquetas, vacunas y segundas oportunidades.';
