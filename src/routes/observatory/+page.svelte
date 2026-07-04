<script lang="ts">
	import { Header } from '$lib/components';
</script>

<svelte:head>
	<title>observatory | iris falls</title>
	<meta name="description" content="The observatory — coming soon." />
	<meta property="og:title" content="observatory | iris falls" />
	<meta property="og:description" content="The observatory — coming soon." />
	<meta property="og:url" content="https://siberrr.space/observatory" />
</svelte:head>

<main class="placeholder">
	<Header variant="landing" />
	<div class="placeholder__body">
		<h1 class="placeholder__title">observatory</h1>
		<p class="placeholder__copy">under construction. look up.</p>
		<a href="/" class="placeholder__back">← back to map</a>
	</div>
</main>

<style>
	.placeholder {
		min-height: 100vh;
		min-height: 100svh;
		background: #050510;
		color: #d0d0d8;
	}

	.placeholder__body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100svh;
		padding: 6rem 1.5rem 2rem;
		gap: 1rem;
		text-align: center;
	}

	.placeholder__title {
		font-family: 'VT323', monospace;
		font-size: 2.5rem;
		letter-spacing: 0.1em;
		text-transform: lowercase;
		margin: 0;
		color: #d0d0d8;
	}

	.placeholder__copy {
		font-family: 'VT323', monospace;
		font-size: 1.25rem;
		letter-spacing: 0.06em;
		color: #4a5a78;
		margin: 0;
	}

	.placeholder__back {
		font-family: 'VT323', monospace;
		font-size: 1.1rem;
		letter-spacing: 0.08em;
		text-transform: lowercase;
		color: #f0c030;
		text-decoration: none;
		margin-top: 1rem;
		border: 2px solid #4a5a78;
		padding: 0.4rem 0.8rem;
	}

	.placeholder__back:hover {
		border-color: #f0c030;
	}
</style>
