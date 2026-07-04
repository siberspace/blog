<script lang="ts">
	import type { Landmark } from './landmarks';
	import { landmarkImageSrc } from './assets';
	import PixelIcon from './PixelIcon.svelte';

	interface Props {
		landmark: Landmark;
		/** When true, render as a list row instead of map-positioned node */
		listMode?: boolean;
	}

	let { landmark, listMode = false }: Props = $props();

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
	<!-- Hotspot only: building is already painted on the pixel canvas -->
	<a
		href={landmark.href}
		class="landmark landmark--map"
		style="left: {landmark.x}%; top: {landmark.y}%;"
		aria-label={landmark.label}
	>
		<span class="landmark__hit" aria-hidden="true"></span>
		<span class="landmark__tooltip" role="tooltip">{landmark.label}</span>
	</a>
{/if}

<style>
	.landmark {
		position: relative;
		display: flex;
		align-items: center;
		text-decoration: none;
		color: #d0d0d8;
		cursor: pointer;
		outline: none;
	}

	.landmark--map {
		position: absolute;
		transform: translate(-50%, -50%);
		flex-direction: column;
		z-index: 2;
		/* Hotspot over building in the background art */
		width: 14%;
		min-width: 48px;
		min-height: 48px;
		aspect-ratio: 1;
		justify-content: center;
	}

	.landmark--list {
		gap: 1rem;
		padding: 0.85rem 1.1rem;
		border: 2px solid #4a5a78;
		background: #0a1020;
		width: 100%;
		max-width: 22rem;
		image-rendering: pixelated;
	}

	.landmark__hit {
		position: absolute;
		inset: 0;
	}

	.landmark__icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		z-index: 1;
		transition: filter 0.15s steps(2);
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
		transform: translateX(-50%) translateY(2px);
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
		transition: opacity 0.1s steps(2);
		image-rendering: pixelated;
	}

	.landmark__label-text {
		font-family: 'VT323', monospace;
		font-size: 1.25rem;
		letter-spacing: 0.06em;
		text-transform: lowercase;
		color: #d0d0d8;
	}

	.landmark:hover .landmark__tooltip,
	.landmark:focus-visible .landmark__tooltip {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	.landmark--map:hover .landmark__hit,
	.landmark--map:focus-visible .landmark__hit {
		box-shadow: inset 0 0 0 2px #f0c030;
	}

	.landmark:focus-visible {
		outline: 2px solid #f0c030;
		outline-offset: 2px;
	}

	.landmark--list:hover,
	.landmark--list:focus-visible {
		border-color: #f0c030;
	}

	@media (prefers-reduced-motion: reduce) {
		.landmark__icon,
		.landmark__tooltip {
			transition: none;
		}
	}
</style>
