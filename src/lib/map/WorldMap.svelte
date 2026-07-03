<script lang="ts">
	import { landmarks } from './landmarks';
	import MapBackground from './MapBackground.svelte';
	import LandmarkNode from './LandmarkNode.svelte';
</script>

<div class="world-map">
	<!-- Desktop / tablet: interactive overworld -->
	<section class="world-map__stage" aria-label="Iris Falls world map">
		<div class="world-map__canvas">
			<MapBackground />
			{#each landmarks as landmark (landmark.id)}
				<LandmarkNode {landmark} />
			{/each}
		</div>
		<p class="world-map__hint">choose a place to visit</p>
	</section>

	<!-- Mobile: same landmarks as a vertical list -->
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
		background: #050510;
		overflow: hidden;
	}

	.world-map__stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100svh;
		padding: 1.5rem;
		gap: 1rem;
	}

	.world-map__canvas {
		position: relative;
		width: min(100%, 960px);
		aspect-ratio: 16 / 9;
		border: 2px solid rgba(200, 200, 208, 0.25);
		box-shadow:
			0 0 40px rgba(10, 30, 48, 0.8),
			inset 0 0 60px rgba(5, 5, 16, 0.4);
		overflow: hidden;
		background: #050510;
		image-rendering: pixelated;
	}

	.world-map__hint {
		font-family: 'VT323', monospace;
		font-size: 1.1rem;
		letter-spacing: 0.12em;
		text-transform: lowercase;
		color: #a0a0b0;
		margin: 0;
		text-shadow: 0 0 8px rgba(200, 200, 208, 0.2);
	}

	.world-map__list {
		display: none;
	}

	@media (max-width: 640px) {
		.world-map__stage {
			display: none;
		}

		.world-map__list {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			min-height: 100vh;
			min-height: 100svh;
			padding: 2rem 1.25rem;
			gap: 1.5rem;
		}

		.world-map__list-title {
			font-family: 'Caveat', cursive;
			font-size: 2rem;
			font-weight: 600;
			letter-spacing: 0.02em;
			text-transform: lowercase;
			color: #c8c8d0;
			margin: 0;
			text-shadow:
				-1px -1px 0 rgba(255, 255, 255, 0.9),
				1px 1px 0 rgba(0, 0, 0, 0.5),
				0 0 12px rgba(192, 192, 210, 0.4);
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
