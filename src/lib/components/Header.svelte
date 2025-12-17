<script lang="ts">
	interface Props {
		siteName?: string;
		indexLink?: string;
		indexLabel?: string;
	}

	let { 
		siteName = 'saberspace',
		indexLink = '/',
		indexLabel = 'Quick Index'
	}: Props = $props();
</script>

<header class="header">
	<a href="/" class="header__logo">
		{siteName}
	</a>
	<a href={indexLink} class="header__index">
		{indexLabel}
	</a>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		background-color: var(--color-bg-primary);
	}

	.header__logo {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		letter-spacing: -0.025em;
		text-decoration: none;
		transition: opacity var(--transition-base);
	}

	.header__logo:hover {
		opacity: 0.8;
	}

	.header__index {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		text-decoration: none;
		transition: opacity var(--transition-base);
	}

	.header__index:hover {
		opacity: 0.8;
	}
</style>
