<script lang="ts">
	import { onMount } from 'svelte';
	import { VIRTUAL_H, VIRTUAL_W } from './palette';
	import { renderScene } from './scene';
	import { mapBackgroundSrc } from './assets';

	let canvasEl: HTMLCanvasElement | undefined = $state();

	onMount(() => {
		// Background PNG is rendered as an <img>; canvas only used for procedural fallback
		if (mapBackgroundSrc) return;

		const canvas = canvasEl;
		if (!canvas) return;

		const ctx = canvas.getContext('2d', { alpha: false });
		if (!ctx) return;

		canvas.width = VIRTUAL_W;
		canvas.height = VIRTUAL_H;
		ctx.imageSmoothingEnabled = false;

		const imageData = ctx.createImageData(VIRTUAL_W, VIRTUAL_H);
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let raf = 0;
		const start = performance.now();

		const draw = (t: number) => {
			renderScene(imageData, t, reducedMotion);
			ctx.putImageData(imageData, 0, 0);
		};

		draw(0);

		if (reducedMotion) return;

		const tick = (now: number) => {
			draw(now - start);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});
</script>

{#if mapBackgroundSrc}
	<img
		src={mapBackgroundSrc}
		alt=""
		class="pixel-scene pixel-scene--img"
		width="928"
		height="1152"
		decoding="async"
		draggable="false"
	/>
{:else}
	<canvas
		bind:this={canvasEl}
		class="pixel-scene"
		width={VIRTUAL_W}
		height={VIRTUAL_H}
		aria-hidden="true"
	></canvas>
{/if}

<style>
	.pixel-scene {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		pointer-events: none;
		user-select: none;
		background: #050510;
	}

	.pixel-scene--img {
		object-fit: fill;
	}
</style>
