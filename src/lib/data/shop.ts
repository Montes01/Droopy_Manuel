import type { CheckoutForm, Product, ShopCategory, ShippingOption } from './types';

/**
 * Categorías de la tienda. El orden define cómo se muestran en /tienda.
 * El slug es la URL: /tienda/[slug].
 */
export const shopCategories: ShopCategory[] = [
	{
		slug: 'camisetas',
		name: 'Camisetas',
		emoji: '👕',
		blurb: 'Algodón suave con la carita de la manada.'
	},
	{
		slug: 'gorras',
		name: 'Gorras',
		emoji: '🧢',
		blurb: 'Para el sol, para el paseo, para la manada.'
	},
	{
		slug: 'juguetes',
		name: 'Juguetes',
		emoji: '🦴',
		blurb: 'Mordedores y pelotas resistentes de verdad.'
	},
	{
		slug: 'libros',
		name: 'Libros',
		emoji: '📚',
		blurb: 'Cuentos e historias con huella de perro.'
	},
	{
		slug: 'llaveros',
		name: 'Llaveros',
		emoji: '🔑',
		blurb: 'Lleva la manada siempre contigo.'
	},
	{
		slug: 'mugs',
		name: 'Mugs',
		emoji: '☕',
		blurb: 'Café caliente, corazón perruno.'
	}
];

/**
 * Catálogo simulado. Cuando existan fotos reales, guardarlas en
 * `static/tienda/<categoria>/<slug>.jpg` y cambiar `photo` a esa ruta.
 * Mientras `photo` sea null, la UI muestra un avatar con la inicial.
 */
export const products: Product[] = [
	// --- Camisetas ---
	{
		slug: 'camiseta-manada',
		category: 'camisetas',
		name: 'Camiseta Manada',
		price: 65000,
		currency: 'COP',
		tagline: 'La carita de la manada en el pecho.',
		description:
			'Camiseta de algodón peinado 100% colombiano. Estampado de Droopy Manuel en el pecho y la manada completa en la espalda.',
		photo: null,
		stock: 24,
		sizes: ['S', 'M', 'L', 'XL']
	},
	{
		slug: 'camiseta-hogar',
		category: 'camisetas',
		name: 'Camiseta Adopta',
		price: 65000,
		currency: 'COP',
		tagline: '"Adopta, no compres" con mucho estilo.',
		description:
			'Camiseta de corte unisex con el mensaje que más nos importa. Cada compra financia una jornada de vacunación.',
		photo: null,
		stock: 18,
		sizes: ['S', 'M', 'L', 'XL']
	},

	// --- Gorras ---
	{
		slug: 'gorra-paw',
		category: 'gorras',
		name: 'Gorra Huella',
		price: 55000,
		currency: 'COP',
		tagline: 'Ajustable, bordada y siempre lista.',
		description:
			'Gorra con cierre ajustable y huella bordada. Visera curva y tela transpirable para el clima quindiano.',
		photo: null,
		stock: 30
	},
	{
		slug: 'gorra-droopy',
		category: 'gorras',
		name: 'Gorra Droopy',
		price: 58000,
		currency: 'COP',
		tagline: 'El logo clásico de la fundación.',
		description:
			'Edición de la gorra con el logo bordado de Droopy Manuel. Color arena, estructura media.',
		photo: null,
		stock: 12
	},

	// --- Juguetes ---
	{
		slug: 'mordedor-cuerda',
		category: 'juguetes',
		name: 'Mordedor de cuerda',
		price: 22000,
		currency: 'COP',
		tagline: 'Para las mandíbulas más juguetonas.',
		description:
			'Mordedor de cuerda de algodón trenzado, resistente y sin plásticos. Ideal para el juego de tirar.',
		photo: null,
		stock: 40
	},
	{
		slug: 'pelota-chirriante',
		category: 'juguetes',
		name: 'Pelota chirriante',
		price: 18000,
		currency: 'COP',
		tagline: 'Diversión que hace ruido.',
		description:
			'Pelota de caucho natural con chifle interno. Rebota bien, aguanta mordidas y jamás pasa desapercibida.',
		photo: null,
		stock: 55
	},

	// --- Libros ---
	{
		slug: 'cuento-droopy',
		category: 'libros',
		name: 'El cuento de Droopy',
		price: 42000,
		currency: 'COP',
		tagline: 'Su historia para leer en familia.',
		description:
			'Libro ilustrado con la historia de Droopy Manuel y la manada que creció a su alrededor. Tapa blanda, 48 páginas.',
		photo: null,
		stock: 26
	},
	{
		slug: 'manual-rescate',
		category: 'libros',
		name: 'Manual de rescate',
		price: 38000,
		currency: 'COP',
		tagline: 'Cómo cuidar a un perrito rescatado.',
		description:
			'Guía práctica de la fundación: primeros auxilios, adaptación al hogar y señales de una adopción responsable.',
		photo: null,
		stock: 15
	},

	// --- Llaveros ---
	{
		slug: 'llavero-placa',
		category: 'llaveros',
		name: 'Llavero placa',
		price: 15000,
		currency: 'COP',
		tagline: 'Una placa en miniatura.',
		description:
			'Llavero metálico con forma de placa de identificación y el nombre de la fundación grabado.',
		photo: null,
		stock: 60
	},
	{
		slug: 'llavero-silueta',
		category: 'llaveros',
		name: 'Llavero silueta',
		price: 12000,
		currency: 'COP',
		tagline: 'Silueta perruna en madera.',
		description:
			'Llavero de madera con silueta de perro tallada a mano por artesanos locales.',
		photo: null,
		stock: 45
	},

	// --- Mugs ---
	{
		slug: 'mug-manada',
		category: 'mugs',
		name: 'Mug Manada',
		price: 35000,
		currency: 'COP',
		tagline: 'Tu café con la manada al frente.',
		description:
			'Jarra cerámica de 11 oz con impresión de larga duración. Apta para microondas y lavavajillas.',
		photo: null,
		stock: 33
	},
	{
		slug: 'mug-droopy',
		category: 'mugs',
		name: 'Mug Droopy clásico',
		price: 32000,
		currency: 'COP',
		tagline: 'El logo que ya es casa.',
		description:
			'Jarra de cerámica blanca con el logo clásico de Droopy Manuel. Perfecta para regalar.',
		photo: null,
		stock: 28
	}
];

/** Opciones de envío del carrito. El id se usa en el formulario de compra. */
export const shippingOptions: ShippingOption[] = [
	{
		id: 'recogida',
		label: 'Recogida local',
		detail: 'En Armenia, Quindío. Coordinamos por WhatsApp.',
		price: 0
	},
	{
		id: 'domicilio',
		label: 'Domicilio en Armenia, Quindío',
		detail: 'Entrega a domicilio dentro de la ciudad.',
		price: 6000
	}
];

export function categoryBySlug(slug: string): ShopCategory | undefined {
	return shopCategories.find((category) => category.slug === slug);
}

export function productsByCategory(category: string): Product[] {
	return products.filter((product) => product.category === category);
}

export function productBySlug(category: string, slug: string): Product | undefined {
	return products.find((product) => product.category === category && product.slug === slug);
}

/** Formato de precio en pesos colombianos, sin decimales. */
export function formatPrice(value: number, currency = 'COP'): string {
	return new Intl.NumberFormat('es-CO', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	}).format(value);
}

export const emptyCheckoutForm: CheckoutForm = {
	firstName: '',
	lastName: '',
	country: 'Colombia',
	address: '',
	city: '',
	phone: '',
	email: '',
	notes: ''
};
