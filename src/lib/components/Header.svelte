<script lang="ts">
	interface Props {
		siteName?: string;
		siteTagline?: string;
	}

	let { 
		siteName = 'siberspace',
		siteTagline = 'poetic incite'
	}: Props = $props();
</script>

<header class="header">
	<a href="/" class="header__logo">
		<span class="header__logo-name">{siteName}</span>
		<span class="header__logo-tagline">{siteTagline}</span>
	</a>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 1.25rem 2rem;
		background-color: var(--color-bg-content-green);
		border-bottom-left-radius: 12px;
		border-bottom-right-radius: 12px;
		margin-left: 1rem;
		margin-right: 1rem;
	}

	.header__logo {
		font-size: 1.25rem;
		color: var(--color-text-on-green);
		font-family: var(--font-sans);
		text-decoration: none;
		transition: opacity var(--transition-base);
		font-style: italic;
	}

	.header__logo:hover {
		opacity: 0.8;
	}

	.header__logo-name {
		font-weight: 700;
	}

	.header__logo-tagline {
		font-weight: 400;
		margin-left: 0.35em;
	}

	@media (max-width: 768px) {
		.header {
			margin-left: 0.5rem;
			margin-right: 0.5rem;
		}
	}
</style>

