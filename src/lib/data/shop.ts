import type { ShopCategory, ShopItem } from './types';

/**
 * Tienda solidaria: catálogo simulado para desarrollo.
 * Precios en pesos colombianos (COP). Reemplazar por datos reales del backend.
 */

/** Envío a domicilio, en COP. La recogida local es gratis. */
export const SHIPPING_COST = 6000;

export const shippingOptions = [
	{ id: 'recogida', label: 'Recogida local', detail: 'Gratis · coordinamos el punto', cost: 0 },
	{
		id: 'domicilio',
		label: 'Envío a domicilio',
		detail: 'Entrega puerta a puerta',
		cost: SHIPPING_COST
	}
] as const;

export type ShippingId = (typeof shippingOptions)[number]['id'];

export const shopCategories: ShopCategory[] = [
	{
		slug: 'alimento',
		name: 'Alimento',
		emoji: '🍖',
		blurb: 'Croquetas, snacks y premios que también alimentan a la manada.'
	},
	{
		slug: 'juguetes',
		name: 'Juguetes',
		emoji: '🎾',
		blurb: 'Pelotas, mordedores y juguetes para consentir a tu peludo.'
	},
	{
		slug: 'accesorios',
		name: 'Accesorios',
		emoji: '🦮',
		blurb: 'Collares, correas, platos y todo para el día a día.'
	},
	{
		slug: 'ropa',
		name: 'Ropa',
		emoji: '👕',
		blurb: 'Camisetas, buzos y gorras para vestir a la manada con orgullo.'
	},
	{
		slug: 'hogar',
		name: 'Hogar',
		emoji: '🏠',
		blurb: 'Camas, cobijas y cojines para descansar con mucho amor.'
	},
	{
		slug: 'merch',
		name: 'Merch solidario',
		emoji: '🐾',
		blurb: 'Llaveros, tazas, stickers y detalles de Droopy Manuel.'
	}
];

export const shopItems: ShopItem[] = [
	// --- Alimento ---
	{
		slug: 'croquetas-adulto-3kg',
		name: 'Croquetas Adulto 3 kg',
		category: 'alimento',
		price: 45000,
		description: 'Bulto de 3 kg de croquetas balanceadas para perro adulto.',
		details:
			'Fórmula completa con proteína de pollo y arroz. Apta para perros de todas las razas desde el año de edad. Cada compra financia una semana de comida para un rescatado.',
		photo: null,
		emoji: '🍖',
		tags: ['3 kg', 'Pollo y arroz', 'Adulto'],
		featured: true
	},
	{
		slug: 'croquetas-cachorro-2kg',
		name: 'Croquetas Cachorro 2 kg',
		category: 'alimento',
		price: 38000,
		description: 'Croquetas con calcio y DHA para cachorros en crecimiento.',
		details:
			'Bulto de 2 kg pensado para cachorros de 2 a 12 meses. Más pequeños y fáciles de masticar, con calcio y DHA para un desarrollo sano.',
		photo: null,
		emoji: '🐶',
		tags: ['2 kg', 'Cachorro', 'DHA']
	},
	{
		slug: 'snacks-entrenamiento',
		name: 'Snacks de Entrenamiento',
		category: 'alimento',
		price: 18000,
		description: 'Bolsita de premios suaves para premiar buenas conductas.',
		details:
			'Premios blandos y pequeños, ideales para sesiones de entrenamiento. Sin colorantes artificiales.',
		photo: null,
		emoji: '🦴',
		tags: ['150 g', 'Premio']
	},

	// --- Juguetes ---
	{
		slug: 'pelota-resistente',
		name: 'Pelota Resistente',
		category: 'juguetes',
		price: 22000,
		description: 'Pelota de caucho natural resistente a mordidas fuertes.',
		details:
			'Caucho no tóxico de alta resistencia, rebota mucho y flota. Perfecta para lanzar y morder sin romperse al primer intento.',
		photo: null,
		emoji: '🎾',
		tags: ['Caucho', 'Flota', 'Antimordida'],
		featured: true
	},
	{
		slug: 'cuerda-tres-nudos',
		name: 'Cuerda de Tres Nudos',
		category: 'juguetes',
		price: 20000,
		description: 'Cuerda de algodón para jalar y limpiar los dientes.',
		details:
			'Juguete de jalar con tres nudos, ayuda a la limpieza dental y a gastar energía. Algodón resistente y seguro.',
		photo: null,
		emoji: '🪢',
		tags: ['Algodón', 'Dental']
	},
	{
		slug: 'mordedor-kong',
		name: 'Mordedor Rellenable',
		category: 'juguetes',
		price: 32000,
		description: 'Mordedor de caucho que puedes rellenar con premios.',
		details:
			'Rellénalo con pasta o premios y congélalo: horas de entretenimiento para perros ansiosos o enérgicos.',
		photo: null,
		emoji: '🧩',
		tags: ['Rellenable', 'Anti-estrés']
	},

	// --- Accesorios ---
	{
		slug: 'collar-ajustable',
		name: 'Collar Ajustable',
		category: 'accesorios',
		price: 28000,
		description: 'Collar de nylon con hebilla metálica y talla ajustable.',
		details:
			'Disponible en tallas S, M y L. Nylon suave pero resistente, con anillo metálico reforzado para el arnés o la placa.',
		photo: null,
		emoji: '🦮',
		tags: ['Nylon', 'S/M/L'],
		featured: true
	},
	{
		slug: 'correa-reflectiva',
		name: 'Correa Reflectiva',
		category: 'accesorios',
		price: 35000,
		description: 'Correa de 1.5 m con costura reflectiva para paseos de noche.',
		details:
			'Correa de 1,5 metros con cinta reflectiva en toda la longitud. Mango acolchado para un agarre cómodo y seguro.',
		photo: null,
		emoji: '🌙',
		tags: ['1.5 m', 'Reflectiva']
	},
	{
		slug: 'comedero-silicona',
		name: 'Comedero Plegable',
		category: 'accesorios',
		price: 25000,
		description: 'Plato de silicona plegable para viajes y paseos.',
		details:
			'Dos compartimentos plegables, fácil de lavar y llevar. Ideal para el parque, la calle o de viaje.',
		photo: null,
		emoji: '🥣',
		tags: ['Silicona', 'Plegable']
	},

	// --- Ropa ---
	{
		slug: 'camiseta-solidaria',
		name: 'Camiseta Solidaria',
		category: 'ropa',
		price: 55000,
		description: 'Camiseta de algodón con el logo de la fundación.',
		details:
			'Camiseta unisex 100% algodón peinado, estampado de Droopy Manuel. Tallas S a XXL. El 100% de la venta va a la manada.',
		photo: null,
		emoji: '👕',
		tags: ['Algodón', 'Unisex', 'S–XXL'],
		featured: true
	},
	{
		slug: 'buzo-con-capucha',
		name: 'Buzo con Capucha',
		category: 'ropa',
		price: 95000,
		description: 'Buzo abrigado con capucha y bolsillo canguro.',
		details:
			'Buzo de felpa perchada con capucha, cordón y bolsillo canguro. Interior suave y cálido, con diseño de la manada.',
		photo: null,
		emoji: '🧥',
		tags: ['Felpa', 'Unisex']
	},
	{
		slug: 'gorra-paw',
		name: 'Gorra Paw',
		category: 'ropa',
		price: 48000,
		description: 'Gorra ajustable con huellita bordada.',
		details:
			'Gorra de algodón con broche ajustable y huellita bordada. Talla única para toda la manada.',
		photo: null,
		emoji: '🧢',
		tags: ['Bordada', 'Talla única']
	},

	// --- Hogar ---
	{
		slug: 'cama-acolchada-m',
		name: 'Cama Acolchada M',
		category: 'hogar',
		price: 85000,
		description: 'Cama acolchada de 60 × 45 cm, lavable y antideslizante.',
		details:
			'Espuma de alta densidad con funda removible y lavable. Base antideslizante. Tamaño mediano, ideal para perros de 10 a 20 kg.',
		photo: null,
		emoji: '🛏️',
		tags: ['60×45 cm', 'Lavable'],
		featured: true
	},
	{
		slug: 'cobija-termica',
		name: 'Cobija Térmica',
		category: 'hogar',
		price: 45000,
		description: 'Cobija suave que conserva el calor en noches frías.',
		details:
			'Tela polar doble cara, muy suave y fácil de lavar. Perfecta para el descanso diario o para los perritos en el refugio.',
		photo: null,
		emoji: '🧣',
		tags: ['Polar', 'Suave']
	},
	{
		slug: 'cojin-descanso',
		name: 'Cojín de Descanso',
		category: 'hogar',
		price: 65000,
		description: 'Cojín ortopédico para perros mayores o con dolencias.',
		details:
			'Espuma viscoelástica que reparte el peso y alivia las articulaciones. Recomendado para perros mayores o con displasia.',
		photo: null,
		emoji: '💤',
		tags: ['Ortopédico', 'Viscoelástica']
	},

	// --- Merch ---
	{
		slug: 'llavero-droopy',
		name: 'Llavero Droopy',
		category: 'merch',
		price: 15000,
		description: 'Llavero metálico con la silueta de Droopy.',
		details:
			'Llavero de metal con baño dorado y la silueta de Droopy. Un detalle pequeño que apoya a la manada.',
		photo: null,
		emoji: '🔑',
		tags: ['Metal', 'Dorado']
	},
	{
		slug: 'taza-manada',
		name: 'Taza Manada',
		category: 'merch',
		price: 42000,
		description: 'Taza de cerámica de 350 ml con las huellitas de la manada.',
		details:
			'Taza de cerámica de 350 ml, apta para microondas y lavavajillas. Estampado resistente de la manada comunitaria.',
		photo: null,
		emoji: '☕',
		tags: ['350 ml', 'Cerámica'],
		featured: true
	},
	{
		slug: 'stickers-pack',
		name: 'Pack de Stickers',
		category: 'merch',
		price: 12000,
		description: 'Pack de 10 stickers resistentes al agua.',
		details:
			'Diez stickers con ilustraciones de la manada, vinilo resistente al agua. Perfectos para el portátil, la botella o el carro.',
		photo: null,
		emoji: '✨',
		tags: ['10 un.', 'Resistente al agua']
	}
];

/** Productos marcados como destacados para la portada de la tienda. */
export const featuredItems = shopItems.filter((item) => item.featured);

export function categoryBySlug(slug: string): ShopCategory | undefined {
	return shopCategories.find((category) => category.slug === slug);
}

export function itemsByCategory(slug: string): ShopItem[] {
	return shopItems.filter((item) => item.category === slug);
}

export function itemBySlug(slug: string): ShopItem | undefined {
	return shopItems.find((item) => item.slug === slug);
}

/** Formatea un valor en pesos colombianos: $45.000. */
export function formatCOP(value: number): string {
	return '$' + value.toLocaleString('es-CO');
}
