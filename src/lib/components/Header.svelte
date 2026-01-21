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
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 400;
		font-style: italic;
		color: #3d5a35;
		text-decoration: none;
		pointer-events: auto;
		cursor: pointer;
		/* Soft organic shadow */
		text-shadow: 
			0 1px 3px rgba(61, 90, 53, 0.15),
			0 2px 6px rgba(61, 90, 53, 0.1);
		transition: color 0.3s ease;
		position: relative;
	}

	.header-landing__logo::after,
	.header-landing__subscribe::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, #5a7a52, transparent);
		transition: width 0.3s ease;
	}

	.header-landing__logo:hover::after,
	.header-landing__subscribe:hover::after {
		width: 100%;
	}

	.header-landing__logo:hover,
	.header-landing__subscribe:hover {
		color: #4a6741;
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
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 400;
		font-style: italic;
		color: var(--headline, #3d5a35);
		text-decoration: none;
		cursor: pointer;
		/* Soft organic shadow */
		text-shadow: 
			0 1px 3px rgba(61, 90, 53, 0.15),
			0 2px 6px rgba(61, 90, 53, 0.1);
		transition: color 0.3s ease, text-shadow 0.8s ease-out;
		position: relative;
	}

	.header-article__logo::after,
	.header-article__subscribe::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--headline, #5a7a52), transparent);
		transition: width 0.3s ease;
	}

	.header-article__logo:hover::after,
	.header-article__subscribe:hover::after {
		width: 100%;
	}

	.header-article__logo:hover,
	.header-article__subscribe:hover {
		opacity: 0.8;
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
			font-size: 1.15rem;
		}

		.header-article {
			padding: 0.75rem 1rem;
		}

		.header-article__logo,
		.header-article__subscribe {
			font-size: 1.15rem;
		}
	}
</style>
