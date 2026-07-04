<script lang="ts">
	import { onMount } from 'svelte';
	import { PALETTE_RGBA } from './palette';
	import { ICONS } from './sprites';
	import { landmarkImageSrc } from './assets';

	interface Props {
		icon: string;
		size?: number;
	}

	let { icon, size = 32 }: Props = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();

	onMount(() => {
		const canvas = canvasEl;
		if (!canvas) return;

		const imgSrc = landmarkImageSrc[icon];
		if (imgSrc) return;

		const sprite = ICONS[icon];
		if (!sprite) return;

		const h = sprite.length;
		const w = sprite[0]?.length ?? 0;
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;

		const imageData = ctx.createImageData(w, h);
		const data = imageData.data;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const c = sprite[y][x];
				const o = (y * w + x) * 4;
				if (!c) {
					data[o + 3] = 0;
					continue;
				}
				const rgba = PALETTE_RGBA[c];
				data[o] = rgba[0];
				data[o + 1] = rgba[1];
				data[o + 2] = rgba[2];
				data[o + 3] = rgba[3];
			}
		}
		ctx.putImageData(imageData, 0, 0);
	});
</script>

<canvas
	bind:this={canvasEl}
	class="pixel-icon"
	style="width: {size}px; height: {size}px;"
	aria-hidden="true"
></canvas>

<style>
	.pixel-icon {
		display: block;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}
</style>
