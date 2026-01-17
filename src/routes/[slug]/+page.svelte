<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill, BackLink, Header } from '$lib/components';
	import { sketchPaths } from '$lib/design-system';
	import { onMount } from 'svelte';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';

	let { data }: { data: PageData } = $props();

	// Format date to year
	const publishedYear = $derived(new Date(data.post.published_at).getFullYear());
	
	// Get author name
	const authorName = $derived(data.post.primary_author?.name || data.post.authors?.[0]?.name || 'siber');
	
	// Scroll position for shimmer effect
	let scrollY = $state(0);
	let lastScrollY = $state(0);
	let headerHidden = $state(false);
	
	// Reading progress
	let readingProgress = $state(0);
	let articleElement: HTMLElement | null = $state(null);
	
	// Color wash images with crossfade - track both current and previous for smooth blending
	let currentWashImage = $state(data.post.feature_image || '');
	let previousWashImage = $state('');
	let washTransitionKey = $state(0); // Increments on each change to trigger animations
	
	// Dynamic colors extracted from the feature image
	let colors = $state<ColorPalette>(defaultColors);
	let colorsLoaded = $state(false);
	
	function handleScroll() {
		scrollY = window.scrollY;
		
		// Determine scroll direction for header show/hide
		const scrollDelta = scrollY - lastScrollY;
		const scrollThreshold = 10; // Minimum scroll to trigger hide/show
		
		if (scrollY < 100) {
			// Always show header near top of page
			headerHidden = false;
		} else if (scrollDelta > scrollThreshold) {
			// Scrolling down - hide header
			headerHidden = true;
		} else if (scrollDelta < -scrollThreshold) {
			// Scrolling up - show header
			headerHidden = false;
		}
		
		lastScrollY = scrollY;
		
		// Calculate reading progress
		if (articleElement) {
			const articleTop = articleElement.offsetTop;
			const articleHeight = articleElement.offsetHeight;
			const windowHeight = window.innerHeight;
			const scrollableDistance = articleTop + articleHeight - windowHeight;
			
			if (scrollY <= articleTop) {
				readingProgress = 0;
			} else if (scrollY >= scrollableDistance) {
				readingProgress = 100;
			} else {
				readingProgress = ((scrollY - articleTop) / (scrollableDistance - articleTop)) * 100;
			}
		}
	}
	
	// Update wash image with crossfade
	function setWashImage(newImage: string) {
		if (newImage && newImage !== currentWashImage) {
			previousWashImage = currentWashImage;
			currentWashImage = newImage;
			washTransitionKey++;
		}
	}
	
	onMount(async () => {
		// Extract colors from feature image
		if (data.post.feature_image) {
			const extracted = await extractColors(data.post.feature_image);
			colors = extracted;
			colorsLoaded = true;
		}
		// Collect all images in the article
		const articleBody = document.querySelector('.article-body');
		if (!articleBody) return;
		
		// Make all links open in new tabs
		const links = articleBody.querySelectorAll('a');
		links.forEach((link) => {
			link.setAttribute('target', '_blank');
			link.setAttribute('rel', 'noopener noreferrer');
		});
		
		const images = articleBody.querySelectorAll('img');
		if (images.length === 0) return;
		
		// Create intersection observer to track which image is in view
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the most visible image
				let mostVisible: { element: Element; ratio: number } | null = null;
				
				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio > 0) {
						if (!mostVisible || entry.intersectionRatio > mostVisible.ratio) {
							mostVisible = { element: entry.target, ratio: entry.intersectionRatio };
						}
					}
				});
				
				if (mostVisible) {
					const img = mostVisible.element as HTMLImageElement;
					if (img.src) {
						setWashImage(img.src);
					}
				}
			},
			{
				threshold: [0, 0.25, 0.5, 0.75, 1],
				rootMargin: '-20% 0px -20% 0px' // Trigger when image is in middle 60% of viewport
			}
		);
		
		// Also observe the hero image if it exists
		const heroImage = document.querySelector('.hero-image') as HTMLImageElement;
		if (heroImage) {
			observer.observe(heroImage);
		}
		
		// Observe all article images
		images.forEach((img) => observer.observe(img));
		
		return () => observer.disconnect();
	});
</script>

<svelte:window onscroll={handleScroll} />

<svelte:head>
	<title>{data.post.title} | siberspace</title>
</svelte:head>

<main 
	class="article-page"
	class:colors-loaded={colorsLoaded}
	style="
		--dynamic-headline: {colors.headlineColor};
		--dynamic-headline-shadow: {colors.headlineShadow};
		--dynamic-headline-accent: {colors.headlineAccent};
		--dynamic-headline-glow: {colors.headlineColor}40;
		--dynamic-tag: {colors.tagColor};
		--dynamic-highlight: {colors.headlineAccent}90;
		--dynamic-image-card-bg: {colors.imageCardBg};
	"
>
	<!-- Header - hides on scroll down, shows on scroll up -->
	<Header variant="article" hidden={headerHidden} />

	<!-- Background layers (same as landing page) -->
	<div class="bg-base"></div>
	
	<!-- Color wash layers - two overlapping for smooth crossfade -->
	<div class="bg-color-wash-container">
		<!-- Previous image (fades out) -->
		{#if previousWashImage}
			{#key `prev-${washTransitionKey}`}
				<div 
					class="bg-color-wash bg-color-wash--outgoing"
					style="background-image: url('{previousWashImage}');"
				></div>
			{/key}
		{/if}
		
		<!-- Current image (fades in) -->
		{#if currentWashImage}
			{#key `curr-${washTransitionKey}`}
				<div 
					class="bg-color-wash bg-color-wash--incoming"
					style="background-image: url('{currentWashImage}');"
				></div>
			{/key}
		{/if}
	</div>
	
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
			<TagPill label="by {authorName}" pathIndex={0} />
			
			<!-- Year tag -->
			<TagPill label={String(publishedYear)} pathIndex={1} />

			<!-- Post tags from Ghost -->
			{#if data.post.tags && data.post.tags.length > 0}
				{#each data.post.tags as tag, i}
					<TagPill 
						label={tag.name} 
						pathIndex={(i + 2) % sketchPaths.length}
					/>
				{/each}
			{/if}
		</div>

		<!-- Divider Line -->
		<hr class="divider-line" />

		<!-- Article Body -->
		<article class="article-body" bind:this={articleElement}>
			{@html data.post.html}
		</article>

		<!-- End flower - blooms when you finish reading -->
		<div class="end-flower" class:end-flower--bloomed={readingProgress > 85}>
			<svg class="bloom-flower" viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<filter id="roughEdge" x="-10%" y="-10%" width="120%" height="120%">
						<feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" result="noise" seed="3"/>
						<feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
					</filter>
				</defs>
				
				<g filter="url(#roughEdge)">
					<!-- Stem -->
					<path class="stem" d="M50 160 Q48 130 50 100" stroke="#4a7c3f" stroke-width="3" fill="none" stroke-linecap="round"/>
					
					<!-- Leaves -->
					<path class="leaf leaf--left" d="M42 125 Q30 118 28 110 Q38 108 46 118 Q44 124 42 125" fill="#5a9c4a"/>
					<path class="leaf leaf--right" d="M58 135 Q70 130 72 122 Q62 120 54 128 Q56 134 58 135" fill="#4a8c3a"/>
					
					<!-- Petals - bloom outward from center -->
					<path class="petal petal--1" d="M50 45 Q42 35 50 20 Q58 35 50 45" fill="var(--headline, #e07)"/>
					<path class="petal petal--2" d="M60 55 Q72 48 80 58 Q70 68 60 55" fill="var(--headline, #e07)" opacity="0.95"/>
					<path class="petal petal--3" d="M40 55 Q28 48 20 58 Q30 68 40 55" fill="var(--headline, #e07)" opacity="0.95"/>
					<path class="petal petal--4" d="M58 70 Q70 78 65 90 Q52 82 58 70" fill="var(--headline, #e07)" opacity="0.9"/>
					<path class="petal petal--5" d="M42 70 Q30 78 35 90 Q48 82 42 70" fill="var(--headline, #e07)" opacity="0.9"/>
					
					<!-- Center -->
					<circle class="center" cx="50" cy="60" r="12" fill="#ffd93d"/>
					<circle cx="46" cy="57" r="2" fill="#e8a800" opacity="0.6"/>
					<circle cx="54" cy="62" r="1.5" fill="#e8a800" opacity="0.6"/>
					<circle cx="50" cy="65" r="1.5" fill="#e8a800" opacity="0.6"/>
				</g>
			</svg>
		</div>
	</section>

	<!-- Back link -->
	<BackLink />

	<!-- Reading Progress Bar -->
	<div class="progress-bar" style="--progress: {readingProgress}%"></div>
</main>

<style>
	/* ===== ARTICLE PAGE ===== */
	.article-page {
		position: relative;
		min-height: 100vh;
		background-color: #f5f5f5;
		
		/* Static fallback colors */
		--text: #1a1a1a;
		--headline: #4a4a4a;
		--headline-shadow: #1a1a1a;
		--headline-accent: #7a7a7a;
		--headline-glow: rgba(74, 74, 74, 0.2);
		--border: #3a3a3a;
		--link: #1a1a1a;
		--tag-color: #3a3a3a;
		--highlight: rgba(120, 120, 120, 0.3);
		--image-card-bg: rgba(0, 0, 0, 0.12);
	}
	
	/* Apply dynamic colors once loaded */
	.article-page.colors-loaded {
		--headline: var(--dynamic-headline);
		--headline-shadow: var(--dynamic-headline-shadow);
		--headline-accent: var(--dynamic-headline-accent);
		--headline-glow: var(--dynamic-headline-glow);
		--tag-color: var(--dynamic-tag);
		--highlight: var(--dynamic-highlight);
		--image-card-bg: var(--dynamic-image-card-bg);
	}

	/* Custom text selection color */
	.article-page ::selection {
		background-color: var(--highlight);
		color: var(--text);
	}

	.article-page ::-moz-selection {
		background-color: var(--highlight);
		color: var(--text);
	}

	/* Layer 1: Base - terrazzo/confetti pattern */
	.bg-base {
		position: fixed;
		inset: 0;
		background-color: #b8b8b8;
		pointer-events: none;
		z-index: 0;
		transform: translateZ(0);
		contain: strict;
	}

	/* Texture overlay - reduced opacity for better text contrast */
	.bg-base::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url('/bg-texture.png');
		background-size: cover;
		background-position: center;
		opacity: 0.4;
	}

	/* Layer 1.5: Color wash container */
	.bg-color-wash-container {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}

	/* Color wash from currently visible image */
	.bg-color-wash {
		position: absolute;
		inset: -50px; /* Extend beyond viewport to avoid edge artifacts */
		background-size: cover;
		background-position: center;
		filter: blur(80px) saturate(1.8);
		pointer-events: none;
		/* GPU acceleration hints to prevent tiling artifacts on resize */
		will-change: opacity;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	/* Incoming wash - slow fade in */
	.bg-color-wash--incoming {
		animation: washFadeIn 2.5s ease-out forwards;
	}

	/* Outgoing wash - slow fade out, slightly faster than incoming for smooth overlap */
	.bg-color-wash--outgoing {
		animation: washFadeOut 2s ease-in forwards;
	}

	@keyframes washFadeIn {
		0% { opacity: 0; }
		100% { opacity: 0.4; }
	}

	@keyframes washFadeOut {
		0% { opacity: 0.4; }
		100% { opacity: 0; }
	}

	/* Layer 2: Paper pulpy texture overlay */
	.bg-paper {
		position: fixed;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
		opacity: 0.25;
		mix-blend-mode: multiply;
		pointer-events: none;
		z-index: 1;
		transform: translateZ(0);
		contain: strict;
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
		transform: translateZ(0);
		contain: strict;
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
		transform: translateZ(0);
		will-change: background-position;
	}

	/* Hero Image Section */
	.hero-image-section {
		position: relative;
		z-index: 3;
		margin-top: 5rem;
		margin-bottom: 0.625rem;
		margin-left: 1rem;
		margin-right: 1rem;
	}

	.hero-image-container {
		position: relative;
		width: 100%;
		max-height: 600px;
		overflow: hidden;
		border-radius: 12px;
		border: 5px solid var(--tag-color);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		transition: border-color 0.8s ease-out;
	}

	/* Paper texture overlay on hero image */
	.hero-image-container::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
		opacity: 0.15;
		mix-blend-mode: multiply;
		pointer-events: none;
		border-radius: 7px;
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

	/* Post Title - Embossed 3D effect */
	.post-title {
		font-family: var(--font-handwritten);
		font-size: clamp(2.5rem, 5vw, 5.5rem);
		font-weight: 700;
		color: var(--headline);
		text-align: center;
		line-height: 1.1;
		margin: 0;
		margin-bottom: 1rem;
		max-width: 900px;
		text-wrap: balance;
		/* Embossed 3D effect with highlight, extrusion, and glow */
		text-shadow: 
			/* Inner highlight - top left edge */
			-1px -1px 0 var(--headline-accent),
			-2px -2px 0 var(--headline-accent),
			/* 3D extrusion - builds depth */
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			4px 4px 0 var(--headline-shadow),
			5px 5px 0 var(--headline-shadow),
			6px 6px 0 var(--headline-shadow),
			7px 7px 0 var(--headline-shadow),
			8px 8px 0 var(--headline-shadow),
			/* Soft shadow for depth */
			10px 10px 8px rgba(0, 0, 0, 0.3),
			/* Outer glow */
			0 0 30px var(--headline-glow),
			0 0 60px var(--headline-glow);
		transition: color 0.8s ease-out, text-shadow 0.8s ease-out;
	}

	/* Tags Container */
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
		color: var(--tag-color);
		transition: color 0.8s ease-out;
	}

	/* Smaller tag pills on mobile */
	@media (max-width: 768px) {
		.tags-container {
			gap: 0.4rem;
		}

		.tags-container :global(.tag-pill) {
			font-size: 0.85rem;
			padding: 0.25rem 0.6rem;
		}

		.tags-container :global(.tag-pill svg) {
			inset: -2px;
			width: calc(100% + 4px);
			height: calc(100% + 4px);
		}
	}

	@media (max-width: 480px) {
		.tags-container :global(.tag-pill) {
			font-size: 0.75rem;
			padding: 0.2rem 0.5rem;
		}
	}

	/* Divider Line */
	.divider-line {
		width: 100%;
		max-width: 65ch;
		border: none;
		border-top: 2px solid var(--text);
		opacity: 0.3;
		margin: 0;
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
		/* Allow browser to synthesize bold-italic if font lacks that variant */
		font-synthesis: weight style;
	}

	.article-body :global(p) {
		margin-bottom: 1.5em;
	}

	/* Lists */
	.article-body :global(ul),
	.article-body :global(ol) {
		margin-bottom: 1.5em;
		padding-left: 1.5em;
	}

	.article-body :global(ul) {
		list-style-type: disc;
	}

	.article-body :global(ol) {
		list-style-type: decimal;
	}

	.article-body :global(li) {
		margin-bottom: 0.5em;
		padding-left: 0.25em;
	}

	.article-body :global(li::marker) {
		color: var(--headline);
	}

	/* Nested lists */
	.article-body :global(ul ul),
	.article-body :global(ol ol),
	.article-body :global(ul ol),
	.article-body :global(ol ul) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	.article-body :global(ul ul) {
		list-style-type: circle;
	}

	.article-body :global(ul ul ul) {
		list-style-type: square;
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
		transition: color 0.8s ease-out;
	}

	.article-body :global(a) {
		color: var(--link);
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
		font-weight: 500;
	}

	.article-body :global(a:hover) {
		text-decoration-thickness: 3px;
	}

	.article-body :global(h2) {
		font-family: var(--font-handwritten);
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--headline);
		margin-top: 2em;
		margin-bottom: 1em;
		text-align: center;
		/* Embossed 3D effect - slightly smaller than title */
		text-shadow: 
			-1px -1px 0 var(--headline-accent),
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			4px 4px 0 var(--headline-shadow),
			5px 5px 0 var(--headline-shadow),
			6px 6px 5px rgba(0, 0, 0, 0.25),
			0 0 20px var(--headline-glow);
		transition: color 0.8s ease-out, text-shadow 0.8s ease-out;
	}

	.article-body :global(h3) {
		font-family: var(--font-serif);
		font-size: 1.375rem;
		color: var(--headline);
		margin-top: 2em;
		margin-bottom: 1em;
		transition: color 0.8s ease-out;
	}

	.article-body :global(blockquote) {
		font-family: var(--font-handwritten);
		font-size: 1.25rem;
		border-left: none;
		padding-left: 0;
		font-style: normal;
		color: var(--text);
		font-weight: 700;
	}

	.article-body :global(strong) {
		color: var(--text);
		font-weight: 700;
	}

	.article-body :global(em) {
		font-style: italic;
	}

	/* Combined bold + italic */
	.article-body :global(strong em),
	.article-body :global(em strong),
	.article-body :global(b i),
	.article-body :global(i b) {
		font-weight: 700;
		font-style: italic;
	}

	/* Inline images with card background */
	.article-body :global(figure:not(.kg-embed-card)),
	.article-body :global(.kg-image-card) {
		position: relative;
		background-color: var(--image-card-bg, rgba(0, 0, 0, 0.12));
		backdrop-filter: blur(8px);
		border-radius: 12px;
		padding: 0.5rem;
		margin: 2rem 0;
		box-shadow: 0 4px 24px var(--image-card-bg, rgba(0, 0, 0, 0.12));
		transition: background-color 0.8s ease-out, box-shadow 0.8s ease-out;
	}

	/* Paper texture overlay on inline images */
	.article-body :global(figure:not(.kg-embed-card))::before,
	.article-body :global(.kg-image-card)::before {
		content: '';
		position: absolute;
		inset: 0.5rem;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
		opacity: 0.12;
		mix-blend-mode: multiply;
		pointer-events: none;
		border-radius: 8px;
		z-index: 1;
	}

	.article-body :global(figure:not(.kg-embed-card) img),
	.article-body :global(.kg-image-card img) {
		position: relative;
		border-radius: 8px;
		width: 100%;
		height: auto;
		display: block;
		z-index: 0;
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
		background-color: var(--image-card-bg, rgba(0, 0, 0, 0.12));
		backdrop-filter: blur(8px);
		border-radius: 12px;
		padding: 0.5rem;
		width: calc(100% - 1rem);
		box-shadow: 0 4px 24px var(--image-card-bg, rgba(0, 0, 0, 0.12));
		transition: background-color 0.8s ease-out, box-shadow 0.8s ease-out;
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

	/* End Flower - Single blooming flower */
	.end-flower {
		display: flex;
		justify-content: center;
		padding: 3rem 1rem 1rem;
		margin-top: 2rem;
	}

	.bloom-flower {
		height: 120px;
		width: auto;
		transform-origin: bottom center;
	}

	/* Stem grows up first */
	.bloom-flower .stem {
		stroke-dasharray: 100;
		stroke-dashoffset: 100;
		transition: stroke-dashoffset 0.8s ease-out;
	}

	.end-flower--bloomed .bloom-flower .stem {
		stroke-dashoffset: 0;
	}

	/* Leaves unfurl */
	.bloom-flower .leaf {
		opacity: 0;
		transform: scale(0);
		transform-origin: center right;
		transition: opacity 0.4s ease-out, transform 0.5s ease-out;
	}

	.bloom-flower .leaf--right {
		transform-origin: center left;
	}

	.end-flower--bloomed .bloom-flower .leaf {
		opacity: 1;
		transform: scale(1);
	}

	.end-flower--bloomed .bloom-flower .leaf--left {
		transition-delay: 0.6s;
	}

	.end-flower--bloomed .bloom-flower .leaf--right {
		transition-delay: 0.8s;
	}

	/* Petals bloom outward from center */
	.bloom-flower .petal {
		opacity: 0;
		transform-origin: 50px 60px;
		transform: scale(0) rotate(0deg);
		transition: opacity 0.5s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.end-flower--bloomed .bloom-flower .petal {
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}

	.end-flower--bloomed .bloom-flower .petal--1 { transition-delay: 1s; }
	.end-flower--bloomed .bloom-flower .petal--2 { transition-delay: 1.15s; }
	.end-flower--bloomed .bloom-flower .petal--3 { transition-delay: 1.15s; }
	.end-flower--bloomed .bloom-flower .petal--4 { transition-delay: 1.3s; }
	.end-flower--bloomed .bloom-flower .petal--5 { transition-delay: 1.3s; }

	/* Center appears last */
	.bloom-flower .center {
		opacity: 0;
		transform: scale(0);
		transform-origin: center;
		transition: opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.end-flower--bloomed .bloom-flower .center {
		opacity: 1;
		transform: scale(1);
		transition-delay: 1.5s;
	}

	/* Gentle sway after blooming */
	.end-flower--bloomed .bloom-flower {
		animation: gentleSway 4s ease-in-out infinite;
		animation-delay: 2s;
	}

	@keyframes gentleSway {
		0%, 100% { transform: rotate(-1.5deg); }
		50% { transform: rotate(1.5deg); }
	}

	/* Leaves wiggle */
	.end-flower--bloomed .bloom-flower .leaf {
		animation: leafWiggle 3s ease-in-out infinite;
	}

	.end-flower--bloomed .bloom-flower .leaf--left {
		animation-delay: 2.2s;
	}

	.end-flower--bloomed .bloom-flower .leaf--right {
		animation-delay: 2.5s;
	}

	@keyframes leafWiggle {
		0%, 100% { transform: scale(1) rotate(0deg); }
		50% { transform: scale(1.03) rotate(2deg); }
	}

	@media (max-width: 768px) {
		.bloom-flower {
			height: 100px;
		}
	}

	/* Reading Progress Bar */
	.progress-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		z-index: 100;
		overflow: hidden;
	}

	.progress-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: var(--progress);
		background: var(--headline);
		box-shadow: 0 0 10px var(--headline-glow), 0 0 5px var(--headline);
		transition: width 0.1s ease-out;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-image-section {
			margin-top: 4rem;
			margin-bottom: 2rem;
			margin-left: 0.5rem;
			margin-right: 0.5rem;
		}

		.content-section {
			padding: 0 1.5rem 2rem;
			margin: 0 0.5rem;
			gap: 1.5rem;
		}

		.post-title {
			font-size: clamp(2rem, 8vw, 3rem);
			margin-bottom: 0.5rem;
		}

		.article-body {
			text-align: left;
		}

		.progress-bar {
			height: 3px;
		}
	}
</style>
