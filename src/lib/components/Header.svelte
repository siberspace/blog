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
		<button type="button" class="header-landing__subscribe" data-portal="signup">subscribe</button>
	</header>
{:else if variant === 'article'}
	<header class="header-article" class:header-article--hidden={hidden}>
		<a href="/" class="header-article__logo">{siteName}</a>
		<button type="button" class="header-article__subscribe" data-portal="signup">subscribe</button>
	</header>
{:else}
	<header class="header">
		<a href="/" class="header__logo">
			<span class="header__logo-name">{siteName}</span>
		</a>
		<button type="button" class="header__subscribe-link" data-portal="signup">subscribe</button>
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
		font-family: var(--font-handwritten);
		font-size: 1.75rem;
		font-weight: 700;
		color: white;
		text-decoration: none;
		pointer-events: auto;
		background: none;
		border: none;
		cursor: pointer;
		/* Embossed 3D effect for landing - white/light theme */
		text-shadow: 
			-1px -1px 0 rgba(255, 255, 255, 0.5),
			1px 1px 0 rgba(0, 0, 0, 0.4),
			2px 2px 0 rgba(0, 0, 0, 0.35),
			3px 3px 0 rgba(0, 0, 0, 0.3),
			4px 4px 0 rgba(0, 0, 0, 0.25),
			5px 5px 3px rgba(0, 0, 0, 0.3),
			0 0 20px rgba(255, 255, 255, 0.3);
		transition: transform 0.2s ease;
	}

	.header-landing__logo:hover,
	.header-landing__subscribe:hover {
		transform: scale(1.05);
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
		font-family: var(--font-handwritten);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--headline, #4a4a4a);
		text-decoration: none;
		background: none;
		border: none;
		cursor: pointer;
		/* Embossed 3D effect - scaled down for header */
		text-shadow: 
			-1px -1px 0 var(--headline-accent, #7a7a7a),
			1px 1px 0 var(--headline-shadow, #1a1a1a),
			2px 2px 0 var(--headline-shadow, #1a1a1a),
			3px 3px 0 var(--headline-shadow, #1a1a1a),
			4px 4px 0 var(--headline-shadow, #1a1a1a),
			5px 5px 3px rgba(0, 0, 0, 0.2),
			0 0 20px var(--headline-glow, rgba(74, 74, 74, 0.2));
		transition: transform 0.2s ease, color 0.8s ease-out, text-shadow 0.8s ease-out;
	}

	.header-article__logo:hover,
	.header-article__subscribe:hover {
		transform: scale(1.05);
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
		background: none;
		border: none;
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
			font-size: 1.25rem;
			text-shadow: 
				-1px -1px 0 rgba(255, 255, 255, 0.5),
				1px 1px 0 rgba(0, 0, 0, 0.4),
				2px 2px 0 rgba(0, 0, 0, 0.35),
				3px 3px 0 rgba(0, 0, 0, 0.3),
				3px 3px 2px rgba(0, 0, 0, 0.25),
				0 0 15px rgba(255, 255, 255, 0.25);
		}

		.header-article {
			padding: 0.75rem 1rem;
		}

		.header-article__logo,
		.header-article__subscribe {
			font-size: 1.25rem;
			text-shadow: 
				-1px -1px 0 var(--headline-accent, #7a7a7a),
				1px 1px 0 var(--headline-shadow, #1a1a1a),
				2px 2px 0 var(--headline-shadow, #1a1a1a),
				3px 3px 0 var(--headline-shadow, #1a1a1a),
				3px 3px 2px rgba(0, 0, 0, 0.2),
				0 0 15px var(--headline-glow, rgba(74, 74, 74, 0.2));
		}
	}
</style>
