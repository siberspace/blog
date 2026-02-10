<script lang="ts">
	import { onMount } from 'svelte';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';

	interface Post {
		slug: string;
		feature_image?: string | null;
	}

	interface Props {
		posts: Post[];
		colors?: Map<string, ColorPalette>;
	}

	let { posts, colors = new Map() }: Props = $props();

	// Self-extracted colors (fallback when parent doesn't provide them)
	let selfExtracted = $state(new Map<string, ColorPalette>());

	// Use parent colors if available, otherwise self-extracted
	const flowerColors = $derived(colors.size > 0 ? colors : selfExtracted);
	const colorsLoaded = $derived(flowerColors.size > 0);

	// Only self-extract if parent doesn't provide colors
	onMount(async () => {
		// Wait a tick to see if parent colors arrive
		await new Promise(resolve => setTimeout(resolve, 100));
		if (colors.size > 0) return; // Parent provided colors, skip

		const isMobile = window.innerWidth <= 768;
		if (isMobile) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}

		const colorPromises = posts.map(async (post) => {
			if (post.feature_image) {
				try {
					const extracted = await extractColors(post.feature_image);
					return { slug: post.slug, colors: extracted };
				} catch {
					return { slug: post.slug, colors: defaultColors };
				}
			}
			return { slug: post.slug, colors: defaultColors };
		});

		const results = await Promise.all(colorPromises);
		const newColors = new Map<string, ColorPalette>();
		results.forEach(({ slug, colors }) => {
			newColors.set(slug, colors);
		});
		selfExtracted = newColors;
	});
</script>

<section class="flower-garden">
	<div class="garden-ground">
		<div class="ground-texture"></div>
	</div>
	<div class="flowers-row">
		{#each posts as post, i}
			{@const colors = flowerColors.get(post.slug) || defaultColors}
			{@const randomHeight = 80 + (i * 17) % 40}
			{@const randomX = (i * 7) % 10 - 5}
			{@const randomDelay = (i * 0.15) % 1}
			{@const swayDuration = 3.5 + (i * 0.7) % 3}
			<a href="/{post.slug}" class="garden-flower" class:garden-flower--loaded={colorsLoaded} style="
				--flower-color: {colors.headlineColor};
				--flower-accent: {colors.headlineAccent};
				--flower-height: {randomHeight}px;
				--flower-x: {randomX}px;
				--animation-delay: {randomDelay}s;
				--sway-duration: {swayDuration}s;
			">
			<svg class="flower-svg" viewBox="0 0 40 120" fill="none" xmlns="http://www.w3.org/2000/svg">
				<!-- Stem -->
				<path class="stem" d="M20 120 Q18 90 20 50" stroke="#4a7c3f" stroke-width="2" fill="none" stroke-linecap="round"/>
				
				<!-- Leaves -->
				<path class="leaf leaf--left" d="M16 85 Q8 80 6 74 Q14 72 20 80 Q18 84 16 85" fill="#5a9c4a"/>
				<path class="leaf leaf--right" d="M24 95 Q32 92 34 86 Q26 84 20 90 Q22 94 24 95" fill="#4a8c3a"/>
				
				<!-- Petals -->
				<path class="petal" d="M20 28 Q14 20 20 8 Q26 20 20 28" fill="var(--flower-color)"/>
				<path class="petal" d="M28 34 Q36 28 42 36 Q34 44 28 34" fill="var(--flower-color)" opacity="0.95"/>
				<path class="petal" d="M12 34 Q4 28 -2 36 Q6 44 12 34" fill="var(--flower-color)" opacity="0.95"/>
				<path class="petal" d="M26 44 Q34 50 30 60 Q20 54 26 44" fill="var(--flower-color)" opacity="0.9"/>
				<path class="petal" d="M14 44 Q6 50 10 60 Q20 54 14 44" fill="var(--flower-color)" opacity="0.9"/>
				
				<!-- Center -->
				<circle class="center" cx="20" cy="38" r="8" fill="#ffd93d"/>
				<circle cx="17" cy="36" r="1.5" fill="#e8a800" opacity="0.6"/>
				<circle cx="23" cy="39" r="1" fill="#e8a800" opacity="0.6"/>
				<circle cx="20" cy="42" r="1" fill="#e8a800" opacity="0.6"/>
			</svg>
			</a>
		{/each}
	</div>
</section>

<style>
	/* ===== FLOWER GARDEN ===== */
	.flower-garden {
		position: relative;
		z-index: 3;
		padding: 0 2rem;
		margin-top: 0;
		clip-path: inset(0);
		height: 160px;
	}

	.garden-ground {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 70px;
		background: linear-gradient(180deg, 
			transparent 0%,
			#3D4D2F26 10%,
			#3D4D2F66 24%,
			#3D4D2F 40%,
			#3D4D2F 100%
		);
		border-radius: 100% 100% 0 0 / 30px 30px 0 0;
		z-index: 0;
		overflow: hidden;
	}

	/* Grassy earth texture overlay on the ground */
	.ground-texture {
		position: absolute;
		inset: 0;
		background-image:
			url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grass'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='6' seed='3' stitchTiles='stitch' result='n'/%3E%3CfeDiffuseLighting in='n' lighting-color='%2360804a' surfaceScale='3.5'%3E%3CfeDistantLight azimuth='180' elevation='45'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grass)'/%3E%3C/svg%3E"),
			url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='soil'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.09' numOctaves='4' seed='12' stitchTiles='stitch' result='g'/%3E%3CfeDiffuseLighting in='g' lighting-color='%23506838' surfaceScale='2'%3E%3CfeDistantLight azimuth='100' elevation='55'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23soil)'/%3E%3C/svg%3E");
		background-size: 400px 400px, 300px 300px;
		background-blend-mode: overlay, soft-light;
		opacity: 0.28;
		border-radius: inherit;
		pointer-events: none;
	}

	.flowers-row {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		flex-wrap: nowrap;
		position: absolute;
		bottom: 25px;
		left: 0;
		right: 0;
		z-index: 1;
	}

	.garden-flower {
		position: relative;
		width: 50px;
		min-width: 20px;
		flex-shrink: 1;
		height: var(--flower-height, 100px);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		transform: translateX(var(--flower-x, 0));
		transform-origin: bottom center;
		cursor: pointer;
		text-decoration: none;
	}

	/* Gentle sway after colors have loaded */
	.garden-flower--loaded {
		animation: sway var(--sway-duration, 4s) ease-in-out var(--animation-delay, 0s) infinite alternate;
	}

	@keyframes sway {
		0%   { transform: translateX(var(--flower-x, 0)) rotate(-1.5deg); }
		100% { transform: translateX(var(--flower-x, 0)) rotate(1.5deg); }
	}

	.garden-flower:hover {
		animation-play-state: paused;
		transform: translateX(var(--flower-x, 0)) scale(1.08);
	}

	.flower-svg {
		width: 100%;
		height: 100%;
	}

	/* Petals start invisible, fade in when colors are extracted */
	.flower-svg :global(.petal) {
		opacity: 0;
		transition: opacity 0.5s ease-in;
	}

	.garden-flower--loaded .flower-svg :global(.petal) {
		opacity: 1;
	}

	/* Restore per-petal opacity variations after loaded */
	.garden-flower--loaded .flower-svg :global(.petal:nth-child(n+6)) {
		opacity: 0.95;
	}
	.garden-flower--loaded .flower-svg :global(.petal:nth-child(n+7)) {
		opacity: 0.9;
	}

	/* Responsive flower garden */
	@media (max-width: 768px) {
		.flower-garden {
			padding: 0 0.5rem;
			height: 140px;
		}

		.flowers-row {
			bottom: 15px;
		}

		.garden-flower {
			width: 40px;
			min-width: 15px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.garden-flower--loaded {
			animation: none;
		}
	}

	@media (max-width: 480px) {
		.flower-garden {
			height: 120px;
		}

		.flowers-row {
			bottom: 10px;
		}

		.garden-flower {
			width: 32px;
			min-width: 10px;
		}
	}
</style>

