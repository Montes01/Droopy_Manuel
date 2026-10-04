<script lang="ts">
	import { site, socials } from '#lib/site';
</script>

<footer class="site-footer">
	<p class="footer-title">📬 Contáctanos 📬</p>
	<div class="contact-grid">
		{#each socials as item}
			<a
				class="contact-btn glass"
				href={item.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${site.name} en ${item.label}`}
				title={item.label}
			>
				<img src={item.icon} alt="" width="28" height="28" loading="lazy" decoding="async" />
			</a>
		{/each}
	</div>
	<p class="footer-note">© {new Date().getFullYear()} {site.name} · Hecho con amor y croquetas 🐾</p>
</footer>

<style>
	.site-footer {
		margin-top: 2rem;
		padding: 2rem 1rem calc(2.5rem + env(safe-area-inset-bottom));
		text-align: center;
	}

	.footer-title {
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-wrap: balance;
		font-size: clamp(1.5rem, 6vw, 2rem);
		line-height: 1.2;
		margin-bottom: 1.25rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.contact-grid {
		display: grid;
		grid-template-columns: repeat(5, auto);
		justify-content: center;
		gap: 0.75rem;
	}

	.contact-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		border: 1px solid rgb(255 255 255 / 0.6);
		color: inherit;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	.contact-btn img {
		width: 1.75rem;
		height: 1.75rem;
		object-fit: contain;
	}

	.footer-note {
		margin-top: 1.5rem;
		font-size: 1rem;
		opacity: 0.85;
	}

	@media (hover: hover) {
		.contact-btn:hover {
			transform: translateY(-0.25rem);
		}
	}

	@media (min-width: 64rem) {
		.contact-grid {
			gap: 1.25rem;
		}

		.contact-btn {
			width: 4.5rem;
			height: 4.5rem;
		}

		.contact-btn img {
			width: 2.25rem;
			height: 2.25rem;
		}
	}
</style>
