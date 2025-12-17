<script lang="ts">
	import { sketchPaths, tagColors } from '$lib/design-system/tokens';

	interface Props {
		label: string;
		color?: string;
		pathIndex?: number;
		size?: 'sm' | 'md' | 'lg';
	}

	let { label, color, pathIndex, size = 'md' }: Props = $props();

	// Default to a random color if not provided
	const tagColor = color || tagColors[Math.floor(Math.random() * tagColors.length)];
	
	// Use provided pathIndex or randomize
	const path = sketchPaths[pathIndex ?? Math.floor(Math.random() * sketchPaths.length)];

	const sizeClasses = {
		sm: 'text-lg px-3 py-1.5',
		md: 'text-xl px-4 py-2',
		lg: 'text-2xl px-5 py-2.5',
	};
</script>

<span 
	class="tag-pill {sizeClasses[size]}"
	style="color: {tagColor};"
>
	<svg viewBox="0 0 100 65" preserveAspectRatio="none" aria-hidden="true">
		<path class="sketch-outline" d={path} />
	</svg>
	{label}
</span>

<style>
	.tag-pill {
		position: relative;
		font-family: var(--font-handwritten);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: default;
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
