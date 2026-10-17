import type { Dog, DogNews, PackView } from '#lib/data/types';
import { api } from './client';

/** Capa de acceso a datos de la manada. Todo viene del backend. */

export async function getDogs(): Promise<Dog[]> {
	return api.get<Dog[]>('/api/dogs');
}

export async function getDog(slug: string): Promise<Dog | null> {
	return api.getOrNull<Dog>(`/api/dogs/${encodeURIComponent(slug)}`);
}

export async function getFeaturedDogs(): Promise<Dog[]> {
	return api.get<Dog[]>('/api/dogs/featured');
}

/** La manada de /manada: viva o en el cielo. */
export async function getPack(view: PackView): Promise<Dog[]> {
	return api.get<Dog[]>(`/api/dogs/pack?view=${view}`);
}

/** Los comunicados de un perrito, más reciente primero. */
export async function getDogNews(slug: string): Promise<DogNews[]> {
	return api.get<DogNews[]>(`/api/dogs/${encodeURIComponent(slug)}/news`);
}

/** Todos los comunicados de la manada (feed global / panel). */
export async function getAllDogNews(): Promise<DogNews[]> {
	return api.get<DogNews[]>('/api/dogs/news');
}