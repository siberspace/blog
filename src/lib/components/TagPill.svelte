<script lang="ts">
	import { sketchPaths } from '$lib/design-system/tokens';

	interface Props {
		label: string;
		pathIndex?: number;
		size?: 'sm' | 'md' | 'lg';
	}

	let { label, pathIndex, size = 'md' }: Props = $props();
	
	// Use provided pathIndex or randomize
	const path = sketchPaths[pathIndex ?? Math.floor(Math.random() * sketchPaths.length)];

	const sizeClasses = {
		sm: 'text-lg px-3 py-1.5',
		md: 'text-xl px-4 py-2',
		lg: 'text-2xl px-5 py-2.5',
	};
</script>

<span class="tag-pill {sizeClasses[size]}">
	<svg viewBox="0 0 100 65" preserveAspectRatio="none" aria-hidden="true">
		<path class="sketch-outline" d={path} />
	</svg>
	{label}
</span>

<style>
	.tag-pill {
		position: relative;
		font-family: 'Caveat', cursive;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: default;
		color: inherit;
		transition: color 0.8s ease-out;
	}

	.tag-pill svg {
		position: absolute;
		inset: -4px;
		width: calc(100% + 8px);
		height: calc(100% + 8px);
		overflow: visible;
		pointer-events: none;
	}

	.tag-pill .sketch-outline {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>





