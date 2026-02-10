<script lang="ts">
	interface Props {
		siteName?: string;
		variant?: 'default' | 'landing' | 'article';
		hidden?: boolean;
	}

	let { 
		siteName = 'iris falls',
		variant = 'default',
		hidden = false
	}: Props = $props();

	function openSubscribe(e: Event) {
		e.preventDefault();
		if (typeof window !== 'undefined' && (window as any).openSubscribeModal) {
			(window as any).openSubscribeModal();
		}
	}
</script>

{#snippet moonLogo()}
	<a href="/" class="moon-logo" aria-label="Home">
		<svg viewBox="0 -2 50 38" xmlns="http://www.w3.org/2000/svg" class="moon-logo__svg">
			<!-- Crescent moon — upright, points facing left -->
			<path d="M22.8-1a3.8 3.8 0 1 1 0 7.2 3.0 3.0 0 1 0 0-7.2z" fill="currentColor" opacity="0.9"/>
			<!-- Stars -->
			<circle cx="14" cy="3.5" r="0.5" fill="currentColor" opacity="0.5"/>
			<circle cx="36" cy="3" r="0.4" fill="currentColor" opacity="0.4"/>
			<circle cx="10" cy="8" r="0.35" fill="currentColor" opacity="0.3"/>
			<circle cx="40" cy="7" r="0.4" fill="currentColor" opacity="0.35"/>
			<circle cx="18" cy="9" r="0.3" fill="currentColor" opacity="0.25"/>
			<circle cx="33" cy="8.5" r="0.35" fill="currentColor" opacity="0.3"/>
			<!-- Left rock — darker, more opaque -->
			<path d="M10 28 L16 11 L21 10 L24 14 L25 28 Z" fill="currentColor" opacity="0.55"/>
			<path d="M12 28 L17 13 L20.5 12 L23 15 L24 28 Z" fill="currentColor" opacity="0.4"/>
			<!-- Right rock — darker, more opaque -->
			<path d="M25 28 L26 14 L29 10 L34 11 L40 28 Z" fill="currentColor" opacity="0.55"/>
			<path d="M26 28 L27 15 L29.5 12 L33 13 L38 28 Z" fill="currentColor" opacity="0.4"/>
			<!-- Waterfall stream — brighter to contrast with rocks -->
			<rect x="23" y="10" width="4" height="18" rx="2" fill="currentColor" opacity="0.65"/>
			<rect x="23.8" y="11" width="2.4" height="17" rx="1.2" fill="currentColor" opacity="0.8"/>
			<rect x="24.3" y="11.5" width="1.4" height="16.5" rx="0.7" fill="currentColor" opacity="0.95"/>
			<!-- Pool — brighter to contrast with rocks -->
			<ellipse cx="25" cy="29" rx="10" ry="2.2" fill="currentColor" opacity="0.25"/>
			<ellipse cx="25" cy="28.8" rx="6.5" ry="1.5" fill="currentColor" opacity="0.2"/>
		</svg>
	</a>
{/snippet}

{#if variant === 'landing'}
	<header class="header-landing">
		<a href="/" class="header-landing__logo">{siteName}</a>
		{@render moonLogo()}
		<button class="header-landing__subscribe" onclick={openSubscribe}>subscribe</button>
	</header>
{:else if variant === 'article'}
	<header class="header-article" class:header-article--hidden={hidden}>
		<a href="/" class="header-article__logo">{siteName}</a>
		{@render moonLogo()}
		<button class="header-article__subscribe" onclick={openSubscribe}>subscribe</button>
	</header>
{:else}
	<header class="header">
		<a href="/" class="header__logo">
			<span class="header__logo-name">{siteName}</span>
		</a>
		{@render moonLogo()}
		<button class="header__subscribe-link" onclick={openSubscribe}>subscribe</button>
	</header>
{/if}

<style>
	/* ===== Moon waterfall logo — centered in header ===== */
	.moon-logo {
		pointer-events: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		color: #c8c8d0;
		filter: drop-shadow(0 0 6px rgba(192, 192, 210, 0.5))
				drop-shadow(0 0 12px rgba(192, 192, 210, 0.2));
		transition: filter 0.3s ease, transform 0.3s ease;
	}

	.moon-logo:hover {
		color: #e0e0e8;
		filter: drop-shadow(0 0 8px rgba(200, 200, 220, 0.7))
				drop-shadow(0 0 18px rgba(200, 200, 220, 0.35));
		transform: scale(1.05);
	}

	.moon-logo__svg {
		width: 40px;
		height: 29px;
	}

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
		font-family: 'Caveat', cursive;
		font-size: 1.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: lowercase;
		color: #c8c8d0;
		text-decoration: none;
		pointer-events: auto;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		/* Silver embossed */
		text-shadow: 
			-1px -1px 0 rgba(255, 255, 255, 0.9),
			1px 1px 0 rgba(0, 0, 0, 0.5),
			2px 2px 2px rgba(0, 0, 0, 0.2),
			0 0 10px rgba(192, 192, 210, 0.4);
		transition: text-shadow 0.3s ease, color 0.3s ease;
	}

	.header-landing__logo:hover,
	.header-landing__subscribe:hover {
		color: #e0e0e8;
		text-shadow: 
			-1px -1px 0 rgba(255, 255, 255, 1),
			1px 1px 0 rgba(0, 0, 0, 0.4),
			2px 2px 2px rgba(0, 0, 0, 0.15),
			0 0 15px rgba(200, 200, 220, 0.5),
			0 0 25px rgba(180, 180, 200, 0.3);
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
		font-family: 'Caveat', cursive;
		font-size: 1.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: lowercase;
		color: #c8c8d0;
		text-decoration: none;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		/* Silver embossed */
		text-shadow: 
			-1px -1px 0 rgba(255, 255, 255, 0.9),
			1px 1px 0 rgba(0, 0, 0, 0.5),
			2px 2px 2px rgba(0, 0, 0, 0.2),
			0 0 10px rgba(192, 192, 210, 0.4);
		transition: text-shadow 0.3s ease, color 0.8s ease-out;
	}

	.header-article__logo:hover,
	.header-article__subscribe:hover {
		color: #e0e0e8;
		text-shadow: 
			-1px -1px 0 rgba(255, 255, 255, 1),
			1px 1px 0 rgba(0, 0, 0, 0.4),
			2px 2px 2px rgba(0, 0, 0, 0.15),
			0 0 15px rgba(200, 200, 220, 0.5),
			0 0 25px rgba(180, 180, 200, 0.3);
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
		background: none;
		border: none;
		padding: 0;
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

		.moon-logo__svg {
			width: 34px;
			height: 24px;
		}
	}
</style>
