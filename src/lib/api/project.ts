import type { ProjectSection } from '#lib/data/types';
import { api } from './client';

/** Capa de acceso a datos de la página del proyecto. Todo viene del backend. */

/** Secciones de /project, ya ordenadas por `position` desde la API. */
export async function getProjectSections(): Promise<ProjectSection[]> {
	return api.get<ProjectSection[]>('/api/project');
}
