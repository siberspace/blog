<script lang="ts">
	import { page } from '$app/state';
	import { landmarks } from './landmarks';
	import { MAP_NATURAL, debugHotspotsEnv, mapBackgroundSrc } from './assets';
	import LandmarkNode from './LandmarkNode.svelte';

	// Breakpoint: map above 720px, list at/below. CSS-only — no JS width checks.
	const debugHotspots = $derived(
		debugHotspotsEnv || page.url.searchParams.get('hotspots') === '1'
	);
</script>

<div class="world-map">
	<!-- >720px: map scales; image + hotspots share one percentage box -->
	<section class="world-map__stage" aria-label="Iris Falls world map">
		<div
			class="world-map__frame"
			style="aspect-ratio: {MAP_NATURAL.w} / {MAP_NATURAL.h};"
		>
			<img
				src={mapBackgroundSrc}
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

	<!-- ≤720px: list fallback (same landmarks) -->
	<nav class="world-map__list" aria-label="Iris Falls destinations">
		<p class="world-map__list-title">iris falls</p>
		<ul class="world-map__list-items">
			{#each landmarks as landmark (landmark.id)}
				<li>
					<LandmarkNode {landmark} listMode={true} />
				</li>
			{/each}
		</ul>
	</nav>
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
		/* Definite width so % sizing never collapses in a centered flex column */
		width: 100%;
		box-sizing: border-box;
		min-height: 100vh;
		min-height: 100svh;
		padding: 1rem;
		gap: 0.75rem;
	}

	/*
	 * Shared box for image + hotspots.
	 * aspect-ratio reserves height before the image loads (no blank collapse).
	 * Hotspot left/top/width/height % are relative to this box.
	 */
	.world-map__frame {
		position: relative;
		width: min(100%, 520px);
		aspect-ratio: 928 / 1152;
		flex-shrink: 0;
		overflow: hidden;
		border: 2px solid #4a5a78;
		background: #050510;
		box-shadow: 0 0 0 2px #050510;
	}

	.world-map__art {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: fill;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
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

	.world-map__list {
		display: none;
	}

	/* Single breakpoint — map above, list at/below. No JS width checks. */
	@media (max-width: 720px) {
		.world-map__stage {
			display: none;
		}

		.world-map__list {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 100%;
			box-sizing: border-box;
			min-height: 100vh;
			min-height: 100svh;
			padding: 2rem 1.25rem;
			gap: 1.5rem;
			background: #050510;
		}

		.world-map__list-title {
			font-family: 'VT323', monospace;
			font-size: 2rem;
			letter-spacing: 0.08em;
			text-transform: lowercase;
			color: #d0d0d8;
			margin: 0;
		}

		.world-map__list-items {
			list-style: none;
			margin: 0;
			padding: 0;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			gap: 0.75rem;
			width: 100%;
			max-width: 22rem;
		}
	}
</style>
