<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill, BackLink } from '$lib/components';
	import { sketchPaths } from '$lib/design-system';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// Format date to year
	const publishedYear = $derived(new Date(data.post.published_at).getFullYear());
	
	// Get author name
	const authorName = $derived(data.post.primary_author?.name || data.post.authors?.[0]?.name || 'siber');

	// Dynamic colors - start with defaults, update after extraction
	let colors = $state<ColorPalette>(defaultColors);
	let isLoading = $state(true);
	
	// Scroll position for shimmer effect
	let scrollY = $state(0);
	
	// All images for color wash (feature + inline)
	let allImages = $state<string[]>([]);
	
	function handleScroll() {
		scrollY = window.scrollY;
	}

	// Extract inline images from HTML
	function extractImagesFromHtml(html: string): string[] {
		const imgRegex = /<img[^>]+src="([^"]+)"/g;
		const images: string[] = [];
		let match;
		while ((match = imgRegex.exec(html)) !== null) {
			images.push(match[1]);
		}
		return images;
	}

	onMount(async () => {
		// Collect all images: feature image + inline images
		const images: string[] = [];
		if (data.post.feature_image) {
			images.push(data.post.feature_image);
		}
		if (data.post.html) {
			images.push(...extractImagesFromHtml(data.post.html));
		}
		allImages = images;
		
		// Extract colors from feature image
		if (data.post.feature_image) {
			const extracted = await extractColors(data.post.feature_image);
			colors = extracted;
		}
		isLoading = false;
	});
</script>

<svelte:window onscroll={handleScroll} />

<svelte:head>
	<title>{data.post.title} | siberspace</title>
</svelte:head>

<main 
	class="article-page"
	style="
		--dynamic-bg: {colors.bgColor};
		--dynamic-text: {colors.textColor};
		--dynamic-headline: {colors.headlineColor};
		--dynamic-headline-shadow: {colors.headlineShadow};
		--dynamic-headline-accent: {colors.headlineAccent};
		--dynamic-tag-bg: {colors.tagColor};
		--dynamic-tag-text: {colors.tagTextColor};
		--dynamic-border: {colors.borderColor};
		--dynamic-link: {colors.linkColor};
	"
	class:light-theme={colors.isLight}
	class:loading={isLoading}
>
	<!-- Background layers (same as landing page) -->
	<div class="bg-base"></div>
	
	<!-- Color wash layers from all images -->
	{#each allImages as image, i}
		<div 
			class="bg-color-wash"
			style="
				background-image: url('{image}');
				opacity: {0.35 / (i + 1)};
				animation-delay: {i * 0.2}s;
			"
		></div>
	{/each}
	
	<div class="bg-paper"></div>
	<div class="bg-gradient"></div>
	<div class="bg-shimmer" style="--scroll-y: {scrollY}px"></div>

	<!-- Hero Image Section -->
	{#if data.post.feature_image}
		<section class="hero-image-section">
			<div class="hero-image-container">
				<img 
					src={data.post.feature_image} 
					alt="" 
					class="hero-image"
				/>
			</div>
		</section>
	{/if}

	<!-- Content Section -->
	<section class="content-section">
		<!-- Centered Title -->
		<h1 class="post-title">
			{data.post.title}
		</h1>

		<!-- Centered Tags -->
		<div class="tags-container">
			<!-- Author tag -->
			<TagPill label="by {authorName}" color={colors.tagColor} pathIndex={0} />
			
			<!-- Year tag -->
			<TagPill label={String(publishedYear)} color={colors.tagColor} pathIndex={1} />

			<!-- Post tags from Ghost -->
			{#if data.post.tags && data.post.tags.length > 0}
				{#each data.post.tags as tag, i}
					<TagPill 
						label={tag.name} 
						color={colors.tagColor} 
						pathIndex={(i + 2) % sketchPaths.length}
					/>
				{/each}
			{/if}
		</div>

		<!-- Divider Line -->
		<hr class="divider-line" />

		<!-- Article Body -->
		<article class="article-body">
			{@html data.post.html}
		</article>
	</section>

	<!-- Back link -->
	<BackLink />
</main>

<style>
	/* ===== ARTICLE PAGE ===== */
	.article-page {
		position: relative;
		min-height: 100vh;
		background-color: #f5f5f5;
		--bg: var(--dynamic-bg);
		--text: var(--dynamic-text);
		--headline: var(--dynamic-headline);
		--headline-shadow: var(--dynamic-headline-shadow);
		--headline-accent: var(--dynamic-headline-accent);
		--tag-bg: var(--dynamic-tag-bg);
		--tag-text: var(--dynamic-tag-text);
		--border: var(--dynamic-border);
		--link: var(--dynamic-link);
	}

	.article-page.loading {
		opacity: 0.9;
	}

	/* Layer 1: Base - terrazzo/confetti pattern */
	.bg-base {
		position: fixed;
		inset: 0;
		background-color: #a8a8a8;
		background-image: url('/bg-texture.png');
		background-size: cover;
		background-position: center;
		pointer-events: none;
		z-index: 0;
	}

	/* Layer 1.5: Color wash from images */
	.bg-color-wash {
		position: fixed;
		inset: -50px;
		background-size: cover;
		background-position: center;
		filter: blur(80px) saturate(1.5);
		opacity: 0.35;
		pointer-events: none;
		z-index: 0;
		transition: opacity 0.8s ease-out;
		animation: fadeInWash 1s ease-out forwards;
	}

	@keyframes fadeInWash {
		from { opacity: 0; }
		to { opacity: var(--target-opacity, 0.35); }
	}

	/* Layer 2: Paper pulpy texture overlay */
	.bg-paper {
		position: fixed;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
		opacity: 0.4;
		mix-blend-mode: multiply;
		pointer-events: none;
		z-index: 1;
	}

	/* Layer 3: Gray gradient overlay */
	.bg-gradient {
		position: fixed;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(180, 180, 180, 0.3) 0%,
			rgba(170, 170, 170, 0.4) 40%,
			rgba(160, 158, 158, 0.6) 70%,
			rgba(150, 148, 148, 0.8) 100%
		);
		pointer-events: none;
		z-index: 2;
	}

	/* Layer 4: Scroll-based shimmer */
	.bg-shimmer {
		position: fixed;
		inset: 0;
		background: 
			linear-gradient(
				120deg,
				transparent 0%,
				transparent 20%,
				rgba(255, 255, 255, 0.35) 35%,
				rgba(255, 255, 255, 0.5) 50%,
				rgba(255, 255, 255, 0.35) 65%,
				transparent 80%,
				transparent 100%
			);
		background-size: 300% 100%;
		background-position: calc(var(--scroll-y) * 0.15px) 0;
		pointer-events: none;
		z-index: 2;
	}

	/* Hero Image Section */
	.hero-image-section {
		position: relative;
		z-index: 3;
		margin-top: 0.625rem;
		margin-bottom: 0.625rem;
		margin-left: 1rem;
		margin-right: 1rem;
	}

	.hero-image-container {
		width: 100%;
		max-height: 600px;
		overflow: hidden;
		border-radius: 12px;
		border: 5px solid var(--border);
		transition: border-color 0.5s ease;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Content Section */
	.content-section {
		position: relative;
		z-index: 3;
		padding: 4rem 5rem 3rem;
		margin: 0 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	/* Post Title */
	.post-title {
		font-family: var(--font-handwritten);
		font-size: clamp(2.5rem, 6vw, 6.75rem);
		font-weight: 700;
		color: var(--headline);
		text-align: center;
		line-height: 1.1;
		margin: 0;
		margin-bottom: 1rem;
		text-shadow: 
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			4px 4px 0 var(--headline-shadow),
			5px 5px 0 var(--headline-shadow),
			6px 6px 0 var(--headline-shadow),
			-1px -1px 0 var(--headline-accent),
			-2px -2px 0 var(--headline-accent);
		transition: color 0.5s ease, text-shadow 0.5s ease;
	}

	/* Tags Container */
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
	}

	/* Divider Line */
	.divider-line {
		width: 100%;
		max-width: 65ch;
		border: none;
		border-top: 2px solid var(--text);
		opacity: 0.3;
		margin: 0;
		transition: border-color 0.5s ease;
	}

	/* Article Body */
	.article-body {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--text);
		max-width: 65ch;
		width: 100%;
		text-align: justify;
		opacity: 0.95;
		transition: color 0.5s ease;
	}

	.article-body :global(p) {
		margin-bottom: 1.5em;
	}

	/* Drop cap for first paragraph */
	.article-body :global(p:first-of-type::first-letter) {
		float: left;
		font-family: var(--font-display);
		font-size: 3.75em;
		line-height: 0.8;
		padding-right: 0.08em;
		padding-top: 0.05em;
		color: var(--headline);
	}

	.article-body :global(a) {
		color: var(--link);
		text-decoration: underline;
	}

	.article-body :global(a:hover) {
		opacity: 0.8;
	}

	.article-body :global(h2) {
		font-family: var(--font-handwritten);
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--headline);
		margin-top: 2em;
		margin-bottom: 1em;
		text-align: center;
		text-shadow: 
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			4px 4px 0 var(--headline-shadow),
			5px 5px 0 var(--headline-shadow),
			6px 6px 0 var(--headline-shadow),
			-1px -1px 0 var(--headline-accent),
			-2px -2px 0 var(--headline-accent);
	}

	.article-body :global(h3) {
		font-family: var(--font-serif);
		font-size: 1.375rem;
		color: var(--headline);
		margin-top: 2em;
		margin-bottom: 1em;
	}

	.article-body :global(blockquote) {
		font-family: var(--font-handwritten);
		font-size: 1.25rem;
		border-left: none;
		padding-left: 0;
		font-style: normal;
		color: var(--headline);
	}

	.article-body :global(strong) {
		color: var(--headline);
	}

	/* Inline images with card background */
	.article-body :global(figure:not(.kg-embed-card)),
	.article-body :global(.kg-image-card) {
		background-color: rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(8px);
		border-radius: 12px;
		padding: 0.5rem;
		margin: 2rem 0;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
	}

	.article-body :global(figure:not(.kg-embed-card) img),
	.article-body :global(.kg-image-card img) {
		border-radius: 8px;
		width: 100%;
		height: auto;
		display: block;
	}

	.article-body :global(figcaption) {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--text);
		text-align: center;
		margin-top: 1rem;
		padding-bottom: 0.5rem;
	}

	/* Standalone images (not in figure) */
	.article-body :global(p > img) {
		background-color: rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(8px);
		border-radius: 12px;
		padding: 0.5rem;
		width: calc(100% - 1rem);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
	}

	/* YouTube/Video embeds - full width, no background */
	.article-body :global(.kg-embed-card) {
		margin: 2rem 0;
		width: 100%;
	}

	.article-body :global(.kg-embed-card iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		height: auto;
		border-radius: 8px;
	}

	/* Light theme adjustments */
	.article-page.light-theme .post-title {
		text-shadow: 
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			-1px -1px 0 var(--headline-accent),
			-2px -2px 0 var(--headline-accent);
	}

	.article-page.light-theme .article-body :global(h2) {
		text-shadow: 
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			-1px -1px 0 var(--headline-accent),
			-2px -2px 0 var(--headline-accent);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-image-section {
			margin-left: 0.5rem;
			margin-right: 0.5rem;
		}

		.content-section {
			padding: 2rem 1.5rem;
			margin: 0 0.5rem;
		}

		.post-title {
			font-size: clamp(2rem, 8vw, 3rem);
		}

		.article-body {
			text-align: left;
		}
	}
</style>
