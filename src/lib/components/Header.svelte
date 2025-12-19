<script lang="ts">
	interface Props {
		siteName?: string;
		siteTagline?: string;
	}

	let { 
		siteName = 'saberspace',
		siteTagline = 'internet zone'
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
		background-color: var(--color-bg-primary);
	}

	.header__logo {
		font-size: 1.25rem;
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		text-decoration: none;
		transition: opacity var(--transition-base);
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
</style>

