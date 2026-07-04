<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { landmarks } from './landmarks';
	import { MAP_NATURAL, debugHotspotsEnv, mapBackgroundSrc } from './assets';
	import LandmarkNode from './LandmarkNode.svelte';

	const debugHotspots = $derived(
		debugHotspotsEnv || page.url.searchParams.get('hotspots') === '1'
	);

	/** Touch-primary UI: first tap reveals label, second tap navigates. */
	let touchUi = $state(false);
	/** Currently armed hotspot id (touch path only). */
	let armedId = $state<string | null>(null);

	onMount(() => {
		touchUi = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
	});

	function armHotspot(id: string) {
		armedId = id;
	}

	function disarmHotspot() {
		armedId = null;
	}

	function onBackdropPointerDown(e: PointerEvent) {
		if (!touchUi || armedId === null) return;
		const t = e.target;
		if (t instanceof Element && t.closest('.landmark--map')) return;
		disarmHotspot();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="world-map" onpointerdown={onBackdropPointerDown}>
	<section class="world-map__stage" aria-label="Iris Falls world map">
		<!--
			Desktop: fit-width, full art visible.
			Mobile: cover 100dvh (image+hotspots scale/crop together).
			Very tall/narrow phones: fit-width letterbox so edge landmarks stay reachable.
		-->
		<div
			class="world-map__frame"
			style="aspect-ratio: {MAP_NATURAL.w} / {MAP_NATURAL.h};"
		>
			<img
				src="{mapBackgroundSrc}?v=6"
				alt="Iris Falls archipelago at night"
				class="world-map__art"
				width={MAP_NATURAL.w}
				height={MAP_NATURAL.h}
				decoding="async"
				draggable="false"
			/>
			{#each landmarks as landmark (landmark.id)}
				<LandmarkNode
					{landmark}
					debug={debugHotspots}
					{touchUi}
					armed={armedId === landmark.id}
					onArm={armHotspot}
					onDisarm={disarmHotspot}
				/>
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

	/*
	 * Mobile cover: fill 100dvh. Art is wider than the viewport when scaled by height,
	 * so left/right crop. Landmarks span ~8%–92% of art width; center crop stays safe
	 * while viewport aspect-ratio (w/h) ≥ ~0.47. Narrower than that → letterbox below.
	 */
	@media (max-width: 720px) and (min-aspect-ratio: 47 / 100) {
		.world-map {
			height: 100dvh;
			min-height: 100dvh;
			overflow: hidden;
		}

		.world-map__stage {
			position: relative;
			height: 100dvh;
			min-height: 100dvh;
			padding: 0;
			gap: 0;
			overflow: hidden;
		}

		.world-map__frame {
			position: absolute;
			top: 50%;
			left: 50%;
			width: auto;
			height: auto;
			min-width: 100%;
			min-height: 100%;
			max-width: none;
			transform: translate(-50%, -50%);
			border: none;
			box-shadow: none;
		}

		.world-map__art {
			width: 100%;
			height: 100%;
			object-fit: fill;
		}

		.world-map__hint {
			position: absolute;
			bottom: 0.75rem;
			left: 0;
			right: 0;
			z-index: 3;
			text-align: center;
			text-shadow: 0 1px 4px #050510;
			pointer-events: none;
		}

		.world-map__debug-note {
			position: absolute;
			bottom: 2.25rem;
			left: 0;
			right: 0;
			z-index: 3;
			text-align: center;
			pointer-events: none;
		}
	}

	/*
	 * Extremely tall/narrow viewports: cover would clip edge landmarks
	 * (reality enjoyer at 8%, saudi oil at 92%). Fit by width instead.
	 */
	@media (max-width: 720px) and (max-aspect-ratio: 469 / 1000) {
		.world-map {
			height: auto;
			min-height: 100dvh;
			overflow-x: hidden;
		}

		.world-map__stage {
			position: static;
			height: auto;
			min-height: 100dvh;
			padding: 0.75rem;
			gap: 0.5rem;
			overflow: visible;
		}

		.world-map__frame {
			position: relative;
			top: auto;
			left: auto;
			width: 100%;
			height: auto;
			min-width: 0;
			min-height: 0;
			max-width: 100%;
			transform: none;
			border: 2px solid #4a5a78;
			box-shadow: 0 0 0 2px #050510;
		}

		.world-map__art {
			width: 100%;
			height: auto;
			object-fit: unset;
		}

		.world-map__hint,
		.world-map__debug-note {
			position: static;
			text-shadow: none;
		}
	}
</style>
