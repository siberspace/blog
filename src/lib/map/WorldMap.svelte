<script lang="ts">
	import { page } from '$app/state';
	import { landmarks } from './landmarks';
	import { MAP_NATURAL, debugHotspotsEnv, mapBackgroundSrc } from './assets';
	import LandmarkNode from './LandmarkNode.svelte';

	const debugHotspots = $derived(
		debugHotspotsEnv || page.url.searchParams.get('hotspots') === '1'
	);
</script>

<div class="world-map">
	<section class="world-map__stage" aria-label="Iris Falls world map">
		<!--
			Image in normal flow sets the box size (width:100%; height:auto).
			aspect-ratio reserves space before load. Hotspots are % of this same box.
		-->
		<div
			class="world-map__frame"
			style="aspect-ratio: {MAP_NATURAL.w} / {MAP_NATURAL.h};"
		>
			<img
				src="{mapBackgroundSrc}?v=2"
				alt="Iris Falls archipelago at night — printing press, town, observatory, and salamander"
				class="world-map__art"
				width={MAP_NATURAL.w}
				height={MAP_NATURAL.h}
				decoding="async"
				draggable="false"
			/>
			{#each landmarks as landmark (landmark.id)}
				<LandmarkNode {landmark} debug={debugHotspots} />
			{/each}
		</div>
		<p class="world-map__hint">choose a place to visit</p>
		{#if debugHotspots}
			<p class="world-map__debug-note">hotspot debug on — remove ?hotspots=1 when done</p>
		{/if}
	</section>
</div>

<style>
	.world-map {
		position: relative;
		min-height: 100vh;
		min-height: 100svh;
		width: 100%;
		background: #050510;
		overflow-x: hidden;
	}

	.world-map__stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		box-sizing: border-box;
		min-height: 100vh;
		min-height: 100svh;
		padding: 1rem;
		gap: 0.75rem;
	}

	.world-map__frame {
		position: relative;
		width: min(100%, 420px);
		flex-shrink: 0;
		overflow: hidden;
		border: 2px solid #4a5a78;
		background: #050510;
		box-shadow: 0 0 0 2px #050510;
	}

	.world-map__art {
		display: block;
		width: 100%;
		height: auto;
		vertical-align: top;
		image-rendering: auto;
		pointer-events: none;
		user-select: none;
	}

	.world-map__hint {
		font-family: 'VT323', monospace;
		font-size: 1.1rem;
		letter-spacing: 0.12em;
		text-transform: lowercase;
		color: #4a5a78;
		margin: 0;
	}

	.world-map__debug-note {
		font-family: 'VT323', monospace;
		font-size: 0.95rem;
		letter-spacing: 0.06em;
		color: #f0c030;
		margin: 0;
	}
</style>
