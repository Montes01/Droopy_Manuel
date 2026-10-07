<script lang="ts">
	import { socials } from '#lib/site';

	const whatsapp = socials.find((social) => social.label === 'WhatsApp')?.href ?? '';
	const whatsappHref = `${whatsapp}?text=${encodeURIComponent(
		'¡Hola! Acabo de hacer un pedido en la tienda y envío mi soporte de pago 🐾'
	)}`;
</script>

<section class="transfer glass" aria-labelledby="transfer-title">
	<h2 class="transfer-title" id="transfer-title">🐾 Pago por transferencia</h2>
	<p>
		Transfiere a nuestra cuenta bancaria usando el <strong>número de tu pedido</strong> como
		referencia.
	</p>

	<ul class="transfer-list">
		<li>
			<strong>Completa tus datos y finaliza.</strong> Al terminar verás los datos bancarios para
			pagar.
		</li>
		<li>
			<strong>📧 Recibirás el resumen por correo.</strong> Si no llega, revisa Spam o Promociones
			💛
		</li>
		<li>
			<strong>📲 Envía el soporte de pago por WhatsApp</strong>
			al <a href={whatsappHref} target="_blank" rel="noreferrer">322 643 8857</a> para confirmar más
			rápido 🐶✨
		</li>
	</ul>

	<p class="transfer-foot">Al confirmar el pago, tu pedido se prepara con mucho amor 💛</p>
</section>

<style>
	.transfer {
		padding: 1.25rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
	}

	.transfer-title {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.75rem;
		line-height: 1.15;
		color: #7a3f16;
		margin-bottom: 0.75rem;
	}

	.transfer p {
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.transfer-list {
		list-style: none;
		display: grid;
		gap: 0.625rem;
		margin: 0.875rem 0;
		padding: 0;
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	.transfer-list li {
		padding-left: 1.125rem;
		position: relative;
	}

	.transfer-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.55em;
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: #b7791f;
	}

	.transfer-list a {
		color: #7a3f16;
		font-weight: 700;
	}

	.transfer-foot {
		font-weight: 700;
		color: #2e7d32;
	}
</style>
