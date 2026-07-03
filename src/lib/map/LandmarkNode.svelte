<script lang="ts">
	import type { Landmark } from './landmarks';
	import { landmarkImageSrc } from './assets';
	import PrintPressIcon from './icons/PrintPressIcon.svelte';

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
	{:else if landmark.icon === 'printpress'}
		<span class="landmark__svg-wrap">
			<PrintPressIcon />
		</span>
	{:else}
		<span class="landmark__fallback" aria-hidden="true">◆</span>
	{/if}
{/snippet}

{#if listMode}
	<a href={landmark.href} class="landmark landmark--list" aria-label={landmark.label}>
		<span class="landmark__glow" aria-hidden="true"></span>
		<span class="landmark__icon">
			{@render icon()}
		</span>
		<span class="landmark__label-text">{landmark.label}</span>
	</a>
{:else}
	<a
		href={landmark.href}
		class="landmark landmark--map"
		style="left: {landmark.x}%; top: {landmark.y}%;"
		aria-label={landmark.label}
	>
		<span class="landmark__glow" aria-hidden="true"></span>
		<span class="landmark__icon">
			{@render icon()}
		</span>
		<span class="landmark__tooltip" role="tooltip">{landmark.label}</span>
	</a>
{/if}

<style>
	.landmark {
		position: relative;
		display: flex;
		align-items: center;
		text-decoration: none;
		color: #c8c8d0;
		cursor: pointer;
		outline: none;
	}

	.landmark--map {
		position: absolute;
		transform: translate(-50%, -50%);
		flex-direction: column;
		z-index: 2;
	}

	.landmark--list {
		gap: 1rem;
		padding: 0.85rem 1.1rem;
		border: 1px solid rgba(200, 200, 208, 0.2);
		border-radius: 4px;
		background: rgba(10, 22, 32, 0.85);
		width: 100%;
		max-width: 22rem;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}

	.landmark__icon {
		position: relative;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		filter: drop-shadow(0 0 6px rgba(200, 200, 208, 0.35));
		transition:
			transform 0.25s ease,
			filter 0.25s ease;
		z-index: 1;
	}

	.landmark--list .landmark__icon {
		width: 36px;
		height: 36px;
		flex-shrink: 0;
	}

	.landmark__svg-wrap {
		display: block;
		width: 100%;
		height: 100%;
	}

	.landmark__img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	.landmark__fallback {
		font-size: 1.5rem;
		color: #e59d50;
	}

	.landmark__glow {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 52px;
		height: 52px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(158, 207, 90, 0.35) 0%,
			rgba(69, 144, 179, 0.15) 45%,
			transparent 70%
		);
		pointer-events: none;
		opacity: 0.7;
		transition: opacity 0.25s ease, transform 0.25s ease;
		z-index: 0;
	}

	.landmark--list .landmark__glow {
		left: 1.1rem;
		top: 50%;
		transform: translate(0, -50%);
		width: 44px;
		height: 44px;
	}

	.landmark__tooltip {
		position: absolute;
		bottom: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%) translateY(4px);
		font-family: 'VT323', monospace;
		font-size: 1.05rem;
		letter-spacing: 0.06em;
		text-transform: lowercase;
		white-space: nowrap;
		padding: 0.25rem 0.55rem;
		background: rgba(5, 5, 16, 0.92);
		border: 1px solid rgba(200, 200, 208, 0.45);
		color: #e0e0e8;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
		box-shadow: 0 0 12px rgba(200, 200, 208, 0.15);
	}

	.landmark__tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: rgba(200, 200, 208, 0.45);
	}

	.landmark__label-text {
		font-family: 'VT323', monospace;
		font-size: 1.25rem;
		letter-spacing: 0.06em;
		text-transform: lowercase;
		color: #e0e0e8;
		text-shadow: 0 0 8px rgba(200, 200, 208, 0.3);
	}

	.landmark:hover .landmark__icon,
	.landmark:focus-visible .landmark__icon {
		transform: translateY(-3px) scale(1.08);
		filter: drop-shadow(0 0 12px rgba(200, 200, 208, 0.7))
			drop-shadow(0 0 20px rgba(158, 207, 90, 0.35));
	}

	.landmark:hover .landmark__glow,
	.landmark:focus-visible .landmark__glow {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1.15);
	}

	.landmark--list:hover .landmark__glow,
	.landmark--list:focus-visible .landmark__glow {
		transform: translate(0, -50%) scale(1.15);
	}

	.landmark:hover .landmark__tooltip,
	.landmark:focus-visible .landmark__tooltip {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	.landmark:focus-visible {
		outline: 2px solid #c8c8d0;
		outline-offset: 4px;
	}

	.landmark--list:hover,
	.landmark--list:focus-visible {
		border-color: rgba(200, 200, 208, 0.5);
		box-shadow: 0 0 16px rgba(200, 200, 208, 0.15);
		transform: translateY(-1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.landmark,
		.landmark__icon,
		.landmark__glow,
		.landmark__tooltip {
			transition: none;
		}

		.landmark:hover .landmark__icon,
		.landmark:focus-visible .landmark__icon {
			transform: none;
		}
	}
</style>
