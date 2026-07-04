<script lang="ts">
	import { landmarks } from './landmarks';
	import LandmarkNode from './LandmarkNode.svelte';
</script>

<div class="world-map">
	<!-- Desktop / tablet: reference pixel-art map -->
	<section class="world-map__stage" aria-label="Iris Falls world map">
		<div class="world-map__frame">
			<img
				src="/map/background.png"
				alt="Iris Falls archipelago at night — printing press, town, observatory, and salamander"
				class="world-map__art"
				width="928"
				height="1152"
				decoding="async"
				draggable="false"
			/>
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
		padding: 1rem;
		gap: 0.75rem;
	}

	.world-map__frame {
		position: relative;
		width: min(100%, 520px, calc(min(88vh, 88svh) * 928 / 1152));
		aspect-ratio: 928 / 1152;
		border: 2px solid #4a5a78;
		overflow: hidden;
		background: #050510;
		box-shadow: 0 0 0 2px #050510;
	}

	.world-map__art {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
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
