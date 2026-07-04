<script lang="ts">
	import type { Landmark } from './landmarks';
	import { landmarkImageSrc } from './assets';
	import PixelIcon from './PixelIcon.svelte';

	interface Props {
		landmark: Landmark;
		/** When true, render as a list row instead of map-positioned node */
		listMode?: boolean;
		/** Draw visible hotspot outline (dev only) */
		debug?: boolean;
	}

	let { landmark, listMode = false, debug = false }: Props = $props();

	const imageSrc = $derived(landmarkImageSrc[landmark.icon] ?? null);
</script>

{#snippet icon()}
	{#if imageSrc}
		<img
			src={imageSrc}
			alt=""
			class="landmark__img"
			width="32"
			height="32"
			decoding="async"
			loading="lazy"
		/>
	{:else}
		<PixelIcon icon={landmark.icon} size={listMode ? 32 : 28} />
	{/if}
{/snippet}

{#if listMode}
	<a href={landmark.href} class="landmark landmark--list" aria-label={landmark.label}>
		<span class="landmark__icon">
			{@render icon()}
		</span>
		<span class="landmark__label-text">{landmark.label}</span>
	</a>
{:else}
	<a
		href={landmark.href}
		class="landmark landmark--map"
		class:landmark--debug={debug}
		style="left: {landmark.left}%; top: {landmark.top}%; width: {landmark.width}%; height: {landmark.height}%;"
		aria-label={landmark.label}
	>
		<span class="landmark__tooltip" role="tooltip">{landmark.label}</span>
	</a>
{/if}

<style>
	.landmark {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: #d0d0d8;
		cursor: pointer;
		outline: none;
	}

	/* Percentage box relative to the shared image wrapper — no translate, no min-width */
	.landmark--map {
		position: absolute;
		z-index: 2;
		box-sizing: border-box;
	}

	.landmark--debug {
		outline: 2px solid #f0c030;
		outline-offset: -2px;
		background: rgba(240, 192, 48, 0.12);
	}

	.landmark--list {
		position: relative;
		gap: 1rem;
		padding: 0.85rem 1.1rem;
		border: 2px solid #4a5a78;
		background: #0a1020;
		width: 100%;
		max-width: 22rem;
		image-rendering: pixelated;
	}

	.landmark__icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		z-index: 1;
	}

	.landmark__img {
		width: 32px;
		height: 32px;
		object-fit: contain;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	.landmark__tooltip {
		position: absolute;
		bottom: calc(100% + 4px);
		left: 50%;
		transform: translateX(-50%);
		font-family: 'VT323', monospace;
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: lowercase;
		white-space: nowrap;
		padding: 2px 6px;
		background: #050510;
		border: 2px solid #d0d0d8;
		color: #d0d0d8;
		opacity: 0;
		pointer-events: none;
		image-rendering: pixelated;
	}

	.landmark__label-text {
		font-family: 'VT323', monospace;
		font-size: 1.25rem;
		letter-spacing: 0.06em;
		text-transform: lowercase;
		color: #d0d0d8;
	}

	.landmark--map:hover .landmark__tooltip,
	.landmark--map:focus-visible .landmark__tooltip {
		opacity: 1;
	}

	.landmark--map:hover,
	.landmark--map:focus-visible {
		outline: 2px solid #f0c030;
		outline-offset: -2px;
	}

	.landmark--map:focus-visible {
		outline: 2px solid #f0c030;
	}

	.landmark--list:hover,
	.landmark--list:focus-visible {
		border-color: #f0c030;
	}
</style>
