<script lang="ts">
	interface Props {
		siteName?: string;
		variant?: 'default' | 'landing' | 'article';
		hidden?: boolean;
	}

	let { 
		siteName = 'siberspace',
		variant = 'default',
		hidden = false
	}: Props = $props();
</script>

{#if variant === 'landing'}
	<header class="header-landing">
		<a href="/" class="header-landing__logo">{siteName}</a>
		<a href="#/portal/signup" class="header-landing__subscribe" data-portal="signup">subscribe</a>
	</header>
{:else if variant === 'article'}
	<header class="header-article" class:header-article--hidden={hidden}>
		<a href="/" class="header-article__logo">{siteName}</a>
		<a href="#/portal/signup" class="header-article__subscribe" data-portal="signup">subscribe</a>
	</header>
{:else}
	<header class="header">
		<a href="/" class="header__logo">
			<span class="header__logo-name">{siteName}</span>
		</a>
		<a href="#/portal/signup" class="header__subscribe-link" data-portal="signup">subscribe</a>
	</header>
{/if}

<style>
	/* Landing variant - floating over hero */
	.header-landing {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		z-index: 100;
		pointer-events: none;
	}

	.header-landing__logo,
	.header-landing__subscribe {
		font-family: 'VT323', monospace;
		font-size: 1.5rem;
		font-weight: 400;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #e8e8e8;
		text-decoration: none;
		pointer-events: auto;
		cursor: pointer;
		text-shadow: 
			0 0 10px rgba(255, 255, 255, 0.5),
			0 0 20px rgba(255, 255, 255, 0.2);
		transition: text-shadow 0.3s ease, color 0.3s ease;
	}

	.header-landing__logo:hover,
	.header-landing__subscribe:hover {
		color: #ffffff;
		text-shadow: 
			0 0 15px rgba(255, 255, 255, 0.7),
			0 0 30px rgba(255, 255, 255, 0.4);
	}

	/* Article variant - fixed with show/hide on scroll */
	.header-article {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		z-index: 100;
		transform: translateY(0);
		transition: transform 0.3s ease-out, opacity 0.3s ease-out;
	}

	.header-article--hidden {
		transform: translateY(-100%);
		opacity: 0;
		pointer-events: none;
	}

	.header-article__logo,
	.header-article__subscribe {
		font-family: 'VT323', monospace;
		font-size: 1.5rem;
		font-weight: 400;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--headline, #e8e8e8);
		text-decoration: none;
		cursor: pointer;
		text-shadow: 
			0 0 10px var(--headline-glow, rgba(255, 255, 255, 0.5)),
			0 0 20px var(--headline-glow, rgba(255, 255, 255, 0.2));
		transition: text-shadow 0.3s ease, color 0.8s ease-out;
	}

	.header-article__logo:hover,
	.header-article__subscribe:hover {
		text-shadow: 
			0 0 15px var(--headline-glow, rgba(255, 255, 255, 0.7)),
			0 0 30px var(--headline-glow, rgba(255, 255, 255, 0.4));
	}

	/* Default variant */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background-color: var(--color-bg-content-green);
		border-bottom-left-radius: 12px;
		border-bottom-right-radius: 12px;
		margin-left: 1rem;
		margin-right: 1rem;
		gap: 1rem;
	}

	.header__logo {
		font-size: clamp(0.875rem, 2vw, 1.25rem);
		color: var(--color-text-on-green);
		font-family: var(--font-typewriter);
		text-decoration: none;
		transition: opacity var(--transition-base);
		flex-shrink: 0;
	}

	.header__logo:hover {
		opacity: 0.8;
	}

	.header__logo-name {
		font-weight: 400;
	}

	.header__subscribe-link {
		font-family: var(--font-typewriter);
		font-size: clamp(0.875rem, 2vw, 1.25rem);
		color: var(--color-text-on-green);
		text-decoration: none;
		cursor: pointer;
		transition: opacity var(--transition-base);
	}

	.header__subscribe-link:hover {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.header {
			margin-left: 0.5rem;
			margin-right: 0.5rem;
			padding: 0.75rem 1rem;
		}

		.header-landing {
			padding: 1rem;
		}

		.header-landing__logo,
		.header-landing__subscribe {
			font-size: 1.2rem;
		}

		.header-article {
			padding: 0.75rem 1rem;
		}

		.header-article__logo,
		.header-article__subscribe {
			font-size: 1.2rem;
		}
	}
</style>
