import { getProjectSections } from '#lib/api/project';

/** Secciones de la historia, en el orden que define el panel. */
export async function load() {
	return { sections: await getProjectSections() };
}
