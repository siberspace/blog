<script lang="ts">
	import { onMount } from 'svelte';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';

	interface Post {
		slug: string;
		feature_image?: string | null;
	}

	interface Props {
		posts: Post[];
	}

	let { posts }: Props = $props();

	let flowerColors = $state(new Map<string, ColorPalette>());

	onMount(async () => {
		// Extract colors for all posts in parallel
		const colorPromises = posts.map(async (post) => {
			if (post.feature_image) {
				try {
					const colors = await extractColors(post.feature_image);
					return { slug: post.slug, colors };
				} catch (e) {
					console.warn('Color extraction failed for', post.slug, e);
					return { slug: post.slug, colors: defaultColors };
				}
			}
			return { slug: post.slug, colors: defaultColors };
		});

		const results = await Promise.all(colorPromises);
		const newFlowerColors = new Map<string, ColorPalette>();
		results.forEach(({ slug, colors }) => {
			newFlowerColors.set(slug, colors);
		});
		flowerColors = newFlowerColors;
	});
</script>

<section class="flower-garden">
	<div class="garden-ground"></div>
	<div class="flowers-row">
		{#each posts as post, i}
			{@const colors = flowerColors.get(post.slug) || defaultColors}
			{@const randomHeight = 80 + (i * 17) % 40}
			{@const randomX = (i * 7) % 10 - 5}
			{@const randomDelay = (i * 0.15) % 1}
			<a href="/{post.slug}" class="garden-flower" style="
				--flower-color: {colors.headlineColor};
				--flower-accent: {colors.headlineAccent};
				--flower-height: {randomHeight}px;
				--flower-x: {randomX}px;
				--animation-delay: {randomDelay}s;
			">
				<svg class="flower-svg" viewBox="0 0 40 120" fill="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<filter id="roughEdge-{i}" x="-10%" y="-10%" width="120%" height="120%">
							<feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" seed="{i * 3}"/>
							<feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G"/>
						</filter>
					</defs>
					
					<g filter="url(#roughEdge-{i})">
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
					</g>
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
		overflow: hidden;
		height: 160px;
	}

	.garden-ground {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 50px;
		background: linear-gradient(180deg, 
			transparent 0%,
			rgba(90, 140, 60, 0.2) 30%,
			rgba(74, 124, 63, 0.4) 60%,
			rgba(60, 100, 50, 0.5) 100%
		);
		border-radius: 100% 100% 0 0 / 30px 30px 0 0;
		z-index: 0;
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
		transition: transform 0.3s ease;
		animation: gentleBreeze 4s ease-in-out infinite;
		animation-delay: var(--animation-delay, 0s);
	}

	.garden-flower:hover {
		transform: translateX(var(--flower-x, 0)) scale(1.1) translateY(-5px);
	}

	.garden-flower:hover .flower-svg {
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
	}

	.flower-svg {
		width: 100%;
		height: 100%;
		transition: filter 0.3s ease;
	}

	/* Gentle swaying animation */
	@keyframes gentleBreeze {
		0%, 100% {
			transform: translateX(var(--flower-x, 0)) rotate(-3deg) translateX(-2px);
		}
		25% {
			transform: translateX(var(--flower-x, 0)) rotate(-1deg) translateX(-1px);
		}
		50% {
			transform: translateX(var(--flower-x, 0)) rotate(3deg) translateX(2px);
		}
		75% {
			transform: translateX(var(--flower-x, 0)) rotate(1deg) translateX(1px);
		}
	}

	.garden-flower .stem {
		transition: stroke 0.3s ease;
	}

	.garden-flower .leaf {
		transition: fill 0.3s ease;
	}

	.garden-flower .petal {
		transition: fill 0.3s ease;
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

