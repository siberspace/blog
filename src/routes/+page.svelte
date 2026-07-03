<script lang="ts">
	import { WorldMap } from '$lib/map';
</script>

<svelte:head>
	<title>iris falls</title>
	<meta
		name="description"
		content="iris falls — a record label. explore the map."
	/>
	<meta property="og:title" content="iris falls" />
	<meta
		property="og:description"
		content="iris falls — a record label. explore the map."
	/>
	<meta property="og:image" content="https://siberrr.space/site.png" />
	<meta property="og:url" content="https://siberrr.space" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="iris falls" />
	<meta
		name="twitter:description"
		content="iris falls — a record label. explore the map."
	/>
	<meta name="twitter:image" content="https://siberrr.space/site.png" />
</svelte:head>

<main class="map-home">
	<WorldMap />
</main>

<style>
	.map-home {
		min-height: 100vh;
		min-height: 100svh;
		background: #050510;
	}
</style>
