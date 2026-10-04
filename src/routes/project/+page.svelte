<script lang="ts">
	import { site, pageTitle } from '#lib/site';

	const title = pageTitle('Soy Droopy Manuel');
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="description"
		content="La historia de Droopy Manuel: 13 años de amor que se transformaron en propósito para perritos comunitarios y callejeritos."
	/>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.description} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.description} />
</svelte:head>

<main class="container story">
	<p class="tagline" aria-label="Soy Droopy Manuel">
		<span aria-hidden="true">🌈</span>
		<span>Soy Droopy Manuel</span>
		<span aria-hidden="true">🌈</span>
	</p>

	<img
		class="story-logo"
		src="/logo.png"
		alt="Droopy, el perrito que dio nombre a la fundación"
		width="240"
		height="150"
		fetchpriority="high"
		decoding="async"
	/>

	<section class="chapter glass" aria-label="El comienzo">
		<p>Llegué a esta familia cuando tenía apenas 2 meses. Fui un regalo lleno de intención y amor.</p>
		<p>
			Viví mis primeros años rodeado de familia, risas y hogar. Pero desde el principio, una de
			mis humanas y yo creamos un vínculo muy especial.
		</p>
	</section>

	<section class="chapter glass" aria-label="Nuestro camino juntos">
		<h2>🐾 Nuestro camino juntos</h2>
		<p>Cuando llegó el momento de que ella empezara una nueva etapa en su vida, me llevó con ella.</p>
		<p>Y así comenzamos nuestro camino juntos.</p>
	</section>

	<section class="chapter glass" aria-label="Crecimos juntos">
		<h2>🌱 Crecimos juntos</h2>
		<p>Mientras yo aprendía rutinas nuevas, ella aprendía a organizar su vida.</p>
		<p>
			En una etapa donde todo eran fiestas y llegar tarde, mi cuidado se convirtió en
			responsabilidad. Mi bienestar se volvió motivo para trabajar, madurar y construir un futuro.
		</p>
		<p><strong>No fui solo su perro. Fui parte de su crecimiento.</strong></p>
	</section>

	<section class="chapter glass" aria-label="Trece años de amor">
		<h2>💛 Trece años de amor</h2>
		<p>Vivimos 13 años llenos de amor profundo. Y el 14 de febrero de 2025 crucé el arcoíris.</p>
		<p>Mi partida fue rápida. Y el vacío… muy grande.</p>
	</section>

	<section class="chapter glass" aria-label="La historia se hizo propósito">
		<h2>⭐ La historia se hizo propósito</h2>
		<p>Pero mis humanas decidieron que mi historia no terminaría en tristeza.</p>
		<p>
			La transformaron en propósito. <strong>Así nació este proyecto.</strong> No desde la lástima,
			sino desde el amor consciente y la responsabilidad: cada regalo que nace en mi nombre ayuda a
			mejorar el bienestar de perritos comunitarios y callejeritos.
		</p>
		<p>Existe una tienda y cada compra apoya directamente a la manada comunitaria.</p>
		<p>
			El sistema de estrellas permite que la ayuda sea constante y sostenible, sin necesidad de
			exponer el dolor, sino fortaleciendo a quienes ya cuidan y acompañan.
		</p>
		<p>
			Quindi Estampados impulsa y financia este proyecto, porque también fue parte de mi historia
			desde el principio.
		</p>
	</section>

	<blockquote class="closing glass">
		<p>Hoy sigo aquí. En cada estrella que se enciende, en cada gesto que mejora la vida de otro perrito, en cada decisión de amar con responsabilidad.</p>
		<p><strong>Porque el amor verdadero no termina, se transforma en propósito.</strong></p>
		<p>Y si estás leyendo esto… ya haces parte de mi manada 🐾✨</p>
		<footer>
			<a class="see-all" href="/manada">Conoce la manada →</a>
		</footer>
	</blockquote>
</main>

<style>
	.story {
		max-width: 44rem;
		margin-inline: auto;
		padding-bottom: 3rem;
	}

	.tagline {
		position: relative;
		display: block;
		font-family: var(--font-brand);
		font-weight: 400;
		color: #fffdf8;
		text-align: center;
		text-wrap: balance;
		font-size: clamp(2rem, 8vw, 3rem);
		line-height: 1.15;
		margin: 1.5rem 0;
		padding-inline: 3rem;
		text-shadow:
			-2px -2px 0 #7a3f16,
			2px -2px 0 #7a3f16,
			-2px 2px 0 #7a3f16,
			2px 2px 0 #7a3f16,
			0 6px 20px rgb(122 63 22 / 0.6);
	}

	.tagline > span:first-child {
		position: absolute;
		top: 0;
		left: 0;
	}

	.tagline > span:last-child {
		position: absolute;
		right: 0;
		bottom: 0;
		transform: rotate(180deg);
	}

	.story-logo {
		display: block;
		width: min(15rem, 70vw);
		height: auto;
		margin: 0.5rem auto 2.5rem;
		padding: 0.75rem;
		background: rgb(255 255 255 / 0.6);
		border-radius: 1.25rem;
		box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 0.15);
	}

	.chapter {
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		font-size: 1.125rem;
		line-height: 1.7;
	}

	.chapter h2 {
		font-family: var(--font-brand);
		font-weight: 400;
		font-size: 1.625rem;
		margin-bottom: 0.75rem;
		color: #7a3f16;
	}

	.chapter p + p {
		margin-top: 0.875rem;
	}

	.closing {
		border-radius: 1.25rem;
		border: 1px solid rgb(255 255 255 / 0.6);
		padding: 1.75rem 1.5rem;
		font-size: 1.1875rem;
		line-height: 1.7;
		text-align: center;
		text-wrap: pretty;
	}

	.closing p + p {
		margin-top: 0.875rem;
	}

	.closing footer {
		margin-top: 1.5rem;
	}

	.see-all {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-min);
		padding: 0.625rem 1.75rem;
		border-radius: 999px;
		background: #7a3f16;
		color: #fff8ef;
		font-family: var(--font-brand);
		font-size: 1.375rem;
		text-decoration: none;
		transition: transform 0.25s ease;
	}

	@media (hover: hover) {
		.see-all:hover {
			transform: translateY(-0.25rem);
		}
	}

	@media (min-width: 48rem) {
		.chapter,
		.closing {
			padding: 2.25rem 2.5rem;
		}
	}
</style>
