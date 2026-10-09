import type {
	BankAccount,
	DonationTarget,
	DonationTier,
	SiteContact,
	SiteContent,
	SiteStats,
	Testimonial
} from '#lib/data/types';
import { api } from './client';

/** Capa de acceso a datos del sitio: contenido, donaciones y cuentas. */

export async function getSiteContent(): Promise<SiteContent> {
	return api.get<SiteContent>('/api/site/content');
}

/** WhatsApp, correo y redes. Fuente única del número de contacto. */
export async function getSiteContact(): Promise<SiteContact> {
	return api.get<SiteContact>('/api/site/contact');
}

export async function getStats(): Promise<SiteStats> {
	return api.get<SiteStats>('/api/site/stats');
}

export async function getDonationTiers(): Promise<DonationTier[]> {
	return api.get<DonationTier[]>('/api/site/donation-tiers');
}

export async function getTestimonials(): Promise<Testimonial[]> {
	return api.get<Testimonial[]>('/api/site/testimonials');
}

export async function getDonationTargets(): Promise<DonationTarget[]> {
	return api.get<DonationTarget[]>('/api/site/donation-targets');
}

export async function getBankAccounts(): Promise<BankAccount[]> {
	return api.get<BankAccount[]>('/api/site/bank-accounts');
}