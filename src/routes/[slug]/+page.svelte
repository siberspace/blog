<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill, Header, FlowerGarden, CosmicBackground } from '$lib/components';
	import { sketchPaths } from '$lib/design-system';
	import { onMount } from 'svelte';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';
	import { getVisibleStars, getUserLocation, type StarPosition } from '$lib/utils/starfield';

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
	
	// Current wash image for WebGL background (changes based on visible image in article)
	let currentWashImage = $state(data.post.feature_image || '');
	
	// Dynamic colors extracted from the feature image
	let colors = $state<ColorPalette>(defaultColors);
	let colorsLoaded = $state(false);
	
	// Dynamic starfield based on user location
	let starPositions = $state<StarPosition[]>([]);
	let washColor = $state({ r: 0.3, g: 0.25, b: 0.4 });
	
	// Track if mobile for limiting tags
	let isMobile = $state(false);
	const maxMobileTags = 4; // Max total tags (including author, year) on mobile
	
	// Throttle scroll handler using requestAnimationFrame
	let scrollTicking = false;
	
	function handleScroll() {
		if (scrollTicking) return;
		scrollTicking = true;
		
		requestAnimationFrame(() => {
			scrollY = window.scrollY;
			
			// Determine scroll direction for header show/hide
			const scrollDelta = scrollY - lastScrollY;
			const scrollThreshold = 10;
			
			if (scrollY < 100) {
				headerHidden = false;
			} else if (scrollDelta > scrollThreshold) {
				headerHidden = true;
			} else if (scrollDelta < -scrollThreshold) {
				headerHidden = false;
			}
			
			lastScrollY = scrollY;
			
			// Calculate reading progress (skip on mobile for performance)
			if (articleElement && !isMobile) {
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
			
			scrollTicking = false;
		});
	}
	
	// Update wash image for WebGL background
	function setWashImage(newImage: string) {
		if (newImage && newImage !== currentWashImage) {
			currentWashImage = newImage;
		}
	}
	
	onMount(async () => {
		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth <= 768;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		// Initialize starfield based on user's location (or Lebanon default)
		try {
			const location = await getUserLocation();
			starPositions = getVisibleStars(location, new Date());
		} catch (e) {
			starPositions = getVisibleStars();
		}
		
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
	<title>{data.post.title} | iris falls</title>
	<meta property="og:title" content={data.post.title} />
	<meta property="og:description" content={data.post.excerpt || "an iris falls story"} />
	<meta property="og:image" content={data.post.feature_image || "https://siberrr.space/site.png"} />
	<meta property="og:url" content={`https://siberrr.space/${data.post.slug}`} />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.post.title} />
	<meta name="twitter:description" content={data.post.excerpt || "an iris falls story"} />
	<meta name="twitter:image" content={data.post.feature_image || "https://siberrr.space/site.png"} />
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

	<!-- WebGL Background with stars, nebula, noise, vignette -->
	<CosmicBackground 
		stars={starPositions} 
		washColor={washColor}
		washImageUrl={currentWashImage}
		fixed={true}
	/>

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

			<!-- Post tags from Ghost - limit on mobile -->
			{#if data.post.tags && data.post.tags.length > 0}
				{@const visibleTags = isMobile ? data.post.tags.slice(0, maxMobileTags - 2) : data.post.tags}
				{#each visibleTags as tag, i}
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

		<!-- More stories button -->
		<a href="/" class="home-button">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
			</svg>
			<span>more stories</span>
		</a>
	</section>

	<!-- Flower Garden Footer -->
	<div class="flower-footer">
		<FlowerGarden posts={data.posts} />
	</div>

	<!-- Reading Progress Bar -->
	<div class="progress-bar" style="--progress: {readingProgress}%"></div>
</main>

<style>
	/* ===== ARTICLE PAGE ===== */
	.article-page {
		position: relative;
		min-height: 100vh;
		background-color: #050510;
		display: flex;
		flex-direction: column;
		
		/* Static fallback colors - light text for dark mode */
		--text: #e0e0e0;
		--text-muted: #a0a0a0;
		--headline: #ffffff;
		--headline-shadow: rgba(0, 0, 0, 0.8);
		--headline-accent: rgba(255, 255, 255, 0.3);
		--headline-glow: rgba(255, 255, 255, 0.2);
		--border: #3a3a3a;
		--link: #88ccff;
		--tag-color: #c8c8d0;
		--highlight: rgba(255, 255, 255, 0.2);
		--image-card-bg: rgba(255, 255, 255, 0.08);
	}
	
	/* Apply dynamic colors once loaded (for in-line images only) */
	.article-page.colors-loaded {
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

	/* Hero Image Section */
	.hero-image-section {
		position: relative;
		z-index: 3;
		margin-top: 5rem;
		margin-bottom: 0.625rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 700px;
		padding: 0 1rem;
	}

	/* Polaroid frame styling */
	.hero-image-container {
		position: relative;
		width: 100%;
		overflow: visible;
		border-radius: 2px;
		/* Matte lunar shadows */
		box-shadow: 
			0 1px 2px rgba(0, 0, 0, 0.12),
			0 4px 8px rgba(0, 0, 0, 0.12),
			0 8px 16px rgba(0, 0, 0, 0.18),
			0 16px 32px rgba(0, 0, 0, 0.12),
			inset 0 0 0 1px rgba(255, 255, 255, 0.15);
		/* Moon-textured frame — cratered, rough surface */
		background:
			url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='moon'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.06' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='3'%3E%3CfeDistantLight azimuth='45' elevation='55'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23moon)'/%3E%3C/svg%3E"),
			linear-gradient(175deg, #d0ccc6 0%, #c8c4be 40%, #bfbab4 100%);
		background-blend-mode: multiply, normal;
		padding: 16px 16px 50px 16px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-top-color: rgba(255, 255, 255, 0.1);
		border-left-color: rgba(255, 255, 255, 0.08);
	}

	/* Crater highlight overlay — adds subtle depth variation to the frame */
	.hero-image-container::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='craters'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.03' numOctaves='3' seed='5' stitchTiles='stitch' result='t'/%3E%3CfeDiffuseLighting in='t' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='220' elevation='35'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23craters)'/%3E%3C/svg%3E");
		opacity: 0.12;
		mix-blend-mode: overlay;
		pointer-events: none;
		border-radius: 2px;
	}

	.hero-image {
		width: 100%;
		height: auto;
		max-height: 500px;
		object-fit: cover;
		display: block;
		/* Vintage print/risograph effect */
		filter: contrast(1.15) saturate(1.3) brightness(1.02);
		border-radius: 1px;
		/* Subtle inset shadow for photo depth */
		box-shadow: 
			inset 0 0 3px rgba(0, 0, 0, 0.2),
			inset 0 0 10px rgba(0, 0, 0, 0.05);
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

	/* Post Title - Silver embossed effect (matching homepage) */
	.post-title {
		font-family: 'Caveat', cursive;
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 600;
		color: #c8c8d0;
		text-align: center;
		line-height: 1.3;
		margin: 0;
		margin-bottom: 1rem;
		max-width: 900px;
		text-wrap: balance;
		text-transform: lowercase;
		letter-spacing: 0.02em;
		/* Speckled silver embossed effect */
		text-shadow: 
			/* Emboss highlight - top-left edge */
			-1px -1px 0 rgba(255, 255, 255, 0.9),
			-2px -2px 1px rgba(255, 255, 255, 0.4),
			/* Emboss shadow - bottom-right edge */
			1px 1px 0 rgba(0, 0, 0, 0.5),
			2px 2px 1px rgba(0, 0, 0, 0.3),
			3px 3px 3px rgba(0, 0, 0, 0.2),
			/* Silver specular highlights */
			0 0 2px rgba(255, 255, 255, 0.8),
			0 0 15px rgba(192, 192, 210, 0.5);
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
		font-family: "Libre Caslon Text", "Georgia", serif;
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--text);
		max-width: 65ch;
		width: 100%;
		text-align: left;
		word-break: normal;
		overflow-wrap: break-word;
		white-space: normal;
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

	.article-body :global(a) {
		color: var(--link);
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
		font-weight: 500;
		display: inline;
	}

	.article-body :global(a:hover) {
		text-decoration-thickness: 3px;
	}

	.article-body :global(h2) {
		font-family: 'VT323', monospace;
		font-size: 1.4rem;
		font-weight: 400;
		color: var(--headline);
		margin-top: 2em;
		margin-bottom: 0.75em;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		/* Starlight glow */
		text-shadow: 
			0 0 8px var(--headline-glow),
			0 0 16px var(--headline-glow);
		transition: color 0.8s ease-out, text-shadow 0.8s ease-out;
	}

	.article-body :global(h3) {
		font-family: 'VT323', monospace;
		font-size: 1.2rem;
		font-weight: 400;
		color: var(--headline);
		margin-top: 1.75em;
		margin-bottom: 0.5em;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		text-shadow: 0 0 6px var(--headline-glow);
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

	.article-body :global(strong),
	.article-body :global(b) {
		color: var(--text);
		font-weight: 700 !important;
	}

	.article-body :global(em),
	.article-body :global(i) {
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

	/* Images with captions: flatten bottom corners so they flow into caption */
	.article-body :global(figure:not(.kg-embed-card):has(figcaption) img),
	.article-body :global(.kg-image-card:has(figcaption) img) {
		border-radius: 8px 8px 0 0 !important;
	}

	.article-body :global(figcaption) {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--headline, var(--text));
		text-align: center;
		padding: 1rem 0.5rem;
		margin: 0;
		transition: color 0.8s ease-out;
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

	/* YouTube/Video embeds - with color-matched background frame */
	.article-body :global(.kg-embed-card) {
		position: relative;
		background-color: var(--image-card-bg, rgba(0, 0, 0, 0.12));
		backdrop-filter: blur(8px);
		border-radius: 12px;
		padding: 0.5rem;
		margin: 2rem 0;
		width: 100%;
		box-shadow: 0 4px 24px var(--image-card-bg, rgba(0, 0, 0, 0.12));
		transition: background-color 0.8s ease-out, box-shadow 0.8s ease-out;
	}

	/* Paper texture overlay on video embeds */
	.article-body :global(.kg-embed-card)::before {
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

	.article-body :global(.kg-embed-card iframe) {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		height: auto;
		border-radius: 8px;
		z-index: 0;
	}

	/* Home Button */
	.home-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 3rem auto 0;
		padding: 0.6rem 1.2rem;
		font-family: var(--font-handwritten);
		font-size: 1rem;
		color: var(--headline);
		text-decoration: none;
		border: 2px solid var(--headline);
		border-radius: 25px;
		background: transparent;
		transition: all 0.3s ease;
	}

	.home-button:hover {
		background: var(--headline);
		color: #0a0a15;
	}

	.home-button svg {
		width: 18px;
		height: 18px;
	}

	@media (max-width: 768px) {
		.home-button {
			font-size: 0.9rem;
			padding: 0.5rem 1rem;
		}

		.home-button svg {
			width: 16px;
			height: 16px;
		}
	}

	/* Flower Garden Footer Wrapper */
	.flower-footer {
		position: relative;
		z-index: 3;
		margin-top: auto;
	}

	/* Reading Progress Bar */
	.progress-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
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
		background: #c8c8d0;
		box-shadow: 0 0 10px rgba(192, 192, 210, 0.5), 0 0 5px #c8c8d0;
		transition: width 0.1s ease-out;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-image-container::after {
			display: none; /* Hide crater overlay on mobile for performance */
		}

		.hero-image-section {
			margin-top: 4rem;
			margin-bottom: 2rem;
			padding: 0 0.5rem;
		}

		.hero-image-container {
			padding: 10px 10px 35px 10px;
			box-shadow: 
				0 4px 12px rgba(0, 0, 0, 0.2),
				inset 0 0 0 1px rgba(255, 255, 255, 0.15);
		}

		.content-section {
			padding: 0 1.5rem 2rem;
			margin: 0 0.5rem;
			gap: 1.5rem;
		}

		.post-title {
			font-size: clamp(1.5rem, 6vw, 2.5rem);
			margin-bottom: 0.5rem;
			text-shadow: 
				-1px -1px 0 rgba(255, 255, 255, 0.9),
				1px 1px 0 rgba(0, 0, 0, 0.5),
				0 0 8px rgba(192, 192, 210, 0.3);
		}

		.progress-bar {
			height: 3px;
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.progress-bar::after {
			transition: none;
		}
	}
</style>
