<script lang="ts">
	import type { PageData } from './$types';
	import { Header, FlowerGarden } from '$lib/components';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';
	import { getVisibleStars, getUserLocation, generateStarfieldCSS, type StarPosition } from '$lib/utils/starfield';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	
	// Flower colors for each post
	let flowerColors = $state<Map<string, ColorPalette>>(new Map());
	
	// Dynamic starfield based on user location
	// Static fallback stars for instant display
	const staticStars = `
		radial-gradient(2px 2px at 15% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 100%),
		radial-gradient(1.5px 1.5px at 85% 15%, rgba(255, 255, 255, 0.7) 0%, transparent 100%),
		radial-gradient(2.5px 2.5px at 45% 75%, rgba(255, 255, 255, 0.95) 0%, transparent 100%),
		radial-gradient(1px 1px at 70% 40%, rgba(255, 255, 255, 0.5) 0%, transparent 100%),
		radial-gradient(1.5px 1.5px at 25% 60%, rgba(255, 255, 255, 0.6) 0%, transparent 100%),
		radial-gradient(2px 2px at 90% 70%, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
		radial-gradient(1px 1px at 10% 85%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
		radial-gradient(1.5px 1.5px at 55% 25%, rgba(255, 255, 255, 0.65) 0%, transparent 100%),
		radial-gradient(2px 2px at 35% 90%, rgba(255, 255, 255, 0.75) 0%, transparent 100%),
		radial-gradient(1px 1px at 80% 55%, rgba(255, 255, 255, 0.55) 0%, transparent 100%),
		radial-gradient(1.5px 1.5px at 5% 45%, rgba(255, 255, 255, 0.6) 0%, transparent 100%),
		radial-gradient(2px 2px at 60% 10%, rgba(255, 255, 255, 0.85) 0%, transparent 100%),
		radial-gradient(1px 1px at 95% 35%, rgba(255, 255, 255, 0.45) 0%, transparent 100%),
		radial-gradient(1.5px 1.5px at 40% 50%, rgba(255, 255, 255, 0.7) 0%, transparent 100%),
		radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
		radial-gradient(1px 1px at 75% 80%, rgba(255, 255, 255, 0.5) 0%, transparent 100%),
		radial-gradient(1.5px 1.5px at 50% 5%, rgba(255, 255, 255, 0.65) 0%, transparent 100%),
		radial-gradient(2px 2px at 30% 65%, rgba(255, 255, 255, 0.9) 0%, transparent 100%)
	`;
	let starfieldCSS = $state(staticStars);
	let userLocationName = $state('Lebanon');
	
	// Extract colors for all posts on mount and initialize starfield
	onMount(async () => {
		// Initialize starfield based on user's location (or Lebanon default)
		try {
			const location = await getUserLocation();
			const stars = getVisibleStars(location, new Date());
			starfieldCSS = generateStarfieldCSS(stars);
			
			// Update location name if we got user's location
			if (location.latitude !== 33.8938) {
				userLocationName = 'your location';
			}
			
			// Update starfield every 5 minutes to reflect sky movement
			const interval = setInterval(() => {
				const newStars = getVisibleStars(location, new Date());
				starfieldCSS = generateStarfieldCSS(newStars);
			}, 5 * 60 * 1000);
			
			return () => clearInterval(interval);
		} catch (e) {
			// Use static fallback
			const stars = getVisibleStars();
			starfieldCSS = generateStarfieldCSS(stars);
		}
	});
	
	onMount(async () => {
		// Skip color extraction on mobile for performance
		if (window.innerWidth <= 768) {
			return;
		}
		
		// Extract colors in small batches to avoid overwhelming the browser
		const batchSize = 3;
		const newColors = new Map<string, ColorPalette>();
		
		for (let i = 0; i < data.posts.length; i += batchSize) {
			const batch = data.posts.slice(i, i + batchSize);
			const batchPromises = batch.map(async (post) => {
				if (post.feature_image) {
					try {
						const colors = await extractColors(post.feature_image);
						return { slug: post.slug, colors };
					} catch {
						return { slug: post.slug, colors: defaultColors };
					}
				}
				return { slug: post.slug, colors: defaultColors };
			});
			
			const results = await Promise.all(batchPromises);
			results.forEach(({ slug, colors }) => {
				newColors.set(slug, colors);
			});
			
			// Update state incrementally
			flowerColors = new Map(newColors);
			
			// Small delay between batches
			if (i + batchSize < data.posts.length) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
	});

	// Current featured post index
	let featuredIndex = $state(0);
	let previousIndex = $state(0);
	let isTransitioning = $state(false);
	let rotationSide = $state(0); // Alternates between 0 and 1
	
	// Track which posts have been seen in this session (for shuffle without repeats)
	let seenIndices = $state<Set<number>>(new Set([0])); // Start with first post as seen
	
	// Rotation angles for alternating effect
	const rotations = [3, -3];
	
	// Scroll-based shimmer
	let scrollY = $state(0);
	
	function handleScroll() {
		scrollY = window.scrollY;
	}

	// Get the current featured post
	const featuredPost = $derived(data.posts[featuredIndex]);

	// Get 4 posts for the stack visualization (including current)
	const stackPosts = $derived.by(() => {
		const posts = [];
		for (let i = 0; i < Math.min(4, data.posts.length); i++) {
			const idx = (featuredIndex + i) % data.posts.length;
			posts.push(data.posts[idx]);
		}
		return posts;
	});

	// Dig - smooth crossfade to new record (cycles through all before repeating)
	function dig() {
		if (isTransitioning || data.posts.length <= 1) return;
		
		// Get indices that haven't been seen yet
		const unseenIndices = [];
		for (let i = 0; i < data.posts.length; i++) {
			if (!seenIndices.has(i)) {
				unseenIndices.push(i);
			}
		}
		
		// If all posts have been seen, reset (except current) and start fresh
		if (unseenIndices.length === 0) {
			seenIndices = new Set([featuredIndex]);
			for (let i = 0; i < data.posts.length; i++) {
				if (i !== featuredIndex) {
					unseenIndices.push(i);
				}
			}
		}
		
		// Pick a random unseen post
		const randomIdx = Math.floor(Math.random() * unseenIndices.length);
		const newIndex = unseenIndices[randomIdx];
		
		// Mark as seen
		seenIndices = new Set([...seenIndices, newIndex]);
		
		// Store previous for crossfade
		previousIndex = featuredIndex;
		featuredIndex = newIndex;
		isTransitioning = true;
		
		// Alternate rotation side
		rotationSide = rotationSide === 0 ? 1 : 0;
		
		// End transition after crossfade completes
		setTimeout(() => {
			isTransitioning = false;
		}, 250);
	}

	// Open the featured post in the same tab
	function openStory() {
		if (featuredPost) {
			window.location.href = `/${featuredPost.slug}`;
		}
	}

	// Touch/swipe handling for mobile
	let touchStartX = 0;
	let touchStartY = 0;
	let touchEndX = 0;
	let touchEndY = 0;
	const minSwipeDistance = 50;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].clientX;
		touchEndY = e.changedTouches[0].clientY;
		handleSwipe();
	}

	function handleSwipe() {
		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;
		
		// Only trigger if horizontal swipe is dominant
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
			if (deltaX < 0) {
				// Swipe left - next story (sequential)
				goToNext();
			} else {
				// Swipe right - previous story (sequential)
				goToPrevious();
			}
		}
	}

	// Sequential navigation for swiping
	function goToNext() {
		if (isTransitioning) return;
		
		previousIndex = featuredIndex;
		featuredIndex = (featuredIndex + 1) % data.posts.length;
		isTransitioning = true;
		rotationSide = rotationSide === 0 ? 1 : 0;
		
		setTimeout(() => {
			isTransitioning = false;
		}, 250);
	}

	function goToPrevious() {
		if (isTransitioning) return;
		
		previousIndex = featuredIndex;
		featuredIndex = (featuredIndex - 1 + data.posts.length) % data.posts.length;
		isTransitioning = true;
		rotationSide = rotationSide === 0 ? 1 : 0;
		
		setTimeout(() => {
			isTransitioning = false;
		}, 250);
	}

	// Get story type from tags
	function getStoryType(post: typeof data.posts[0]): string {
		const typeTags = ['interview', 'essays', 'essay', 'review', 'profile', 'mini-interview'];
		const tag = post.tags?.find(t => typeTags.includes(t.slug.toLowerCase()));
		return tag?.name || 'story';
	}

	// Get genre from tags (non-type tags)
	function getGenre(post: typeof data.posts[0]): string {
		const typeTags = ['mini-interview', 'essay', 'review', 'profile'];
		const genreTag = post.tags?.find(t => !typeTags.includes(t.slug.toLowerCase()));
		return genreTag?.name || '—';
	}

	// Estimate word count from HTML
	function getWordCount(post: typeof data.posts[0]): number {
		if (!post.html) return 0;
		const text = post.html.replace(/<[^>]*>/g, ' ');
		const words = text.split(/\s+/).filter(w => w.length > 0);
		return Math.round(words.length / 100) * 100; // Round to nearest 100
	}

	// Get year from published date
	function getYear(post: typeof data.posts[0]): string {
		return new Date(post.published_at).getFullYear().toString().slice(-2);
	}

	// Featured post title for hero
	const heroTitle = $derived(featuredPost?.title || '');
</script>

<svelte:window onscroll={handleScroll} />

<svelte:head>
	<title>siberspace</title>
	<meta property="og:title" content="siberspace" />
	<meta property="og:description" content="music blog (most of the time). writings about lifesources in wasteland." />
	<meta property="og:image" content="https://siberrr.space/site.png" />
	<meta property="og:url" content="https://siberrr.space" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="siberspace" />
	<meta name="twitter:description" content="music blog (most of the time). writings about lifesources in wasteland." />
	<meta name="twitter:image" content="https://siberrr.space/site.png" />
</svelte:head>

<main class="landing">
	<!-- Background layers (bottom to top) -->
	<div class="bg-base"></div>
	<div class="bg-stars" style="background-image: {starfieldCSS}"></div>
	<div class="bg-color-wash" style="background-image: url('{featuredPost?.feature_image || ''}')"></div>
	<div class="bg-paper"></div>
	<div class="bg-gradient"></div>

	<!-- Header -->
	<Header variant="landing" />

	<!-- Hero Section -->
	<section class="hero">

		<!-- Stacked Feature Images with Crossfade -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="hero__stack"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
			onclick={openStory}
		>
			<!-- Background cards (static stack effect) -->
			{#each [2, 3] as i}
				{@const rotation = [-5, 7][i - 2]}
				{@const offset = i * 8}
				{@const bgPost = data.posts[(featuredIndex + i) % data.posts.length]}
				{@const bgColors = flowerColors.get(bgPost?.slug || '') || defaultColors}
				<div 
					class="hero__card hero__card--bg"
					style="
						--rotation: {rotation}deg;
						--offset-x: {offset}px;
						--offset-y: {offset}px;
						--card-border: {bgColors.headlineColor};
					"
				>
					{#if bgPost?.feature_image}
						<img 
							src={bgPost.feature_image} 
							alt=""
							class="hero__card-image"
						/>
					{:else}
						<div class="hero__card-placeholder"></div>
					{/if}
				</div>
			{/each}
			
			<!-- Outgoing card (fades out) - uses previous rotation -->
			{#if isTransitioning}
				{@const prevColors = flowerColors.get(data.posts[previousIndex]?.slug || '') || defaultColors}
				<div 
					class="hero__card hero__card--outgoing"
					style="--rotation: {rotations[rotationSide === 0 ? 1 : 0]}deg; --offset-x: 0px; --offset-y: 0px; --card-border: {prevColors.headlineColor};"
				>
					{#if data.posts[previousIndex]?.feature_image}
						<img 
							src={data.posts[previousIndex].feature_image} 
							alt=""
							class="hero__card-image"
						/>
					{:else}
						<div class="hero__card-placeholder"></div>
					{/if}
				</div>
			{/if}
			
			<!-- Current card (fades in) - uses current rotation -->
			<div 
				class="hero__card hero__card--current"
				class:hero__card--entering={isTransitioning}
				style="--rotation: {rotations[rotationSide]}deg; --offset-x: 0px; --offset-y: 0px; --card-border: {(flowerColors.get(featuredPost?.slug || '') || defaultColors).headlineColor};"
			>
				{#if featuredPost?.feature_image}
					<img 
						src={featuredPost.feature_image} 
						alt={featuredPost.title}
						class="hero__card-image"
					/>
				{:else}
					<div class="hero__card-placeholder"></div>
				{/if}
			</div>
		</div>

		<!-- Hero Title -->
		<div class="hero__title-container" style="
			--title-color: {(flowerColors.get(featuredPost?.slug || '') || defaultColors).headlineColor};
			--title-shadow: {(flowerColors.get(featuredPost?.slug || '') || defaultColors).headlineShadow};
			--title-accent: {(flowerColors.get(featuredPost?.slug || '') || defaultColors).headlineAccent};
		">
			<h1 class="hero__title">{heroTitle}</h1>
		</div>

		<!-- Action Buttons -->
		<div class="hero__actions">
			<button 
				class="hero__btn hero__btn--dig"
				onclick={dig}
				disabled={isTransitioning}
				type="button"
			>
				dig
			</button>
			<button 
				class="hero__btn hero__btn--open"
				onclick={openStory}
				type="button"
			>
				read
			</button>
		</div>
	</section>

	<!-- Bottom section wrapper with unified overlay -->
	<div class="bottom-section-wrapper">
		<!-- Stories Index Section -->
		<section class="index">
		<!-- Mobile title (hidden on desktop) -->
		<h2 class="index__title index__title--mobile">in the crates...</h2>

		<!-- Column Headers (visible on desktop as teaser) -->
		<div class="index__headers">
			<span class="index__header index__header--thumb"></span>
			<span class="index__header index__header--headline">headline</span>
			<span class="index__header index__header--type">type</span>
			<span class="index__header index__header--year">year</span>
			<span class="index__header index__header--words">words</span>
			<span class="index__header index__header--genre">genre</span>
		</div>

		<!-- Story Rows -->
		<div class="index__list">
			{#each data.posts as post, i}
				<a href="/{post.slug}" class="index__row">
					<!-- Thumbnail -->
					<div class="index__thumb">
						{#if post.feature_image}
							<img 
								src={post.feature_image} 
								alt="" 
								class="index__thumb-img"
							/>
						{:else}
							<div class="index__thumb-placeholder"></div>
						{/if}
					</div>

					<!-- Headline -->
					<span class="index__cell index__cell--headline">{post.title}</span>

					<!-- Excerpt (mobile only) -->
					<span class="index__cell index__cell--excerpt">{post.excerpt || ''}</span>

					<!-- Type -->
					<span class="index__cell index__cell--type">{getStoryType(post)}</span>

					<!-- Year -->
					<span class="index__cell index__cell--year">{getYear(post)}</span>

					<!-- Words -->
					<span class="index__cell index__cell--words">{getWordCount(post)}</span>

					<!-- Genre -->
					<span class="index__cell index__cell--genre">{getGenre(post)}</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- Tagline -->
	<p class="tagline">
		music blog (most of the time). writings about lifesources in wasteland. published from iris falls, constella.
	</p>

	<!-- Flower Garden Footer -->
	<FlowerGarden posts={data.posts} />
	</div>
</main>

<style>
	/* ===== LANDING PAGE ===== */
	.landing {
		position: relative;
		min-height: 100vh;
		background-color: #050510;
	}

	/* Layer 1: Base - night sky */
	.bg-base {
		position: fixed;
		inset: 0;
		background: radial-gradient(ellipse at 20% 20%, #0a0a15 0%, #050510 50%, #020208 100%);
		pointer-events: none;
		z-index: 0;
	}

	/* Layer 1.25: Dynamic stars based on user location */
	.bg-stars {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 2;
		contain: strict;
	}

	/* Layer 1.5: Nebula color wash from featured image */
	.bg-color-wash {
		position: fixed;
		inset: -50px;
		background-size: cover;
		background-position: center;
		filter: blur(60px) saturate(2) brightness(0.5);
		opacity: 0.4;
		pointer-events: none;
		z-index: 1;
		mix-blend-mode: screen;
		/* GPU acceleration */
		transform: translateZ(0) scale(1.05);
		backface-visibility: hidden;
		contain: strict;
	}

	/* Layer 2: Cosmic dust texture overlay - hidden on mobile for performance */
	.bg-paper {
		position: fixed;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='3' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='1.5'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
		opacity: 0.03;
		mix-blend-mode: soft-light;
		pointer-events: none;
		z-index: 1;
		contain: strict;
	}

	/* Layer 3: Subtle vignette */
	.bg-gradient {
		position: fixed;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 0%,
			transparent 60%,
			rgba(0, 0, 0, 0.25) 100%
		);
		pointer-events: none;
		z-index: 1;
	}


	/* ===== HERO SECTION ===== */
	.hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 5rem 2rem 3rem;
		overflow: hidden;
		z-index: 3;
		gap: 0;
	}

	/* Stacked Cards */
	.hero__stack {
		position: relative;
		width: min(70vw, 500px);
		height: min(45vw, 320px);
		margin-bottom: 5rem;
		cursor: pointer;
		touch-action: pan-y pinch-zoom; /* Allow vertical scroll but capture horizontal swipes */
	}

	.hero__card {
		position: absolute;
		inset: 0;
		border-radius: 2px;
		overflow: hidden;
		transform: rotate(var(--rotation)) translate(var(--offset-x), var(--offset-y));
		/* Simplified shadows for better performance */
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.15),
			0 12px 24px rgba(0, 0, 0, 0.1),
			inset 0 0 0 1px rgba(255, 255, 255, 0.5);
		/* Polaroid frame - simplified gradient */
		background: linear-gradient(175deg, #fcfcfa 0%, #f5f5f0 40%, #eeeee8 100%);
		padding: 12px 12px 40px 12px;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-top-color: rgba(255, 255, 255, 0.3);
		border-left-color: rgba(255, 255, 255, 0.2);
		contain: layout style;
	}

	/* Background stack cards */
	.hero__card--bg {
		z-index: 1;
		opacity: 0.7;
	}

	/* Current top card */
	.hero__card--current {
		z-index: 3;
		opacity: 1;
	}

	/* Entering animation */
	.hero__card--entering {
		animation: fadeIn 0.25s ease-out forwards;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Outgoing card */
	.hero__card--outgoing {
		z-index: 2;
		animation: fadeOut 0.25s ease-out forwards;
	}

	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	.hero__card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Vintage print/risograph effect */
		filter: contrast(1.15) saturate(1.3) brightness(1.02);
		border-radius: 1px;
		/* Subtle inset shadow for photo depth */
		box-shadow: 
			inset 0 0 3px rgba(0, 0, 0, 0.2),
			inset 0 0 10px rgba(0, 0, 0, 0.05);
	}

	/* Grain overlay - disabled on mobile, simplified on desktop */
	.hero__card::after {
		content: '';
		position: absolute;
		top: 12px;
		left: 12px;
		right: 12px;
		bottom: 40px;
		background: linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%);
		background-size: 4px 4px;
		opacity: 0.5;
		pointer-events: none;
		border-radius: 1px;
	}

	.hero__card-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #d4d4d4 0%, #a3a3a3 100%);
	}

	/* Hero Title */
	.hero__title-container {
		min-height: 3rem;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4rem;
		padding: 1rem 2rem;
		overflow: visible;
	}

	.hero__title {
		font-family: 'Caveat', cursive;
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		font-weight: 600;
		color: #c8c8d0;
		text-align: center;
		white-space: nowrap;
		line-height: 1.3;
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
			/* Outer glow */
			0 0 15px rgba(192, 192, 210, 0.4),
			0 0 30px rgba(160, 160, 180, 0.2);
	}

	/* Action Buttons */
	.hero__actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.hero__btn {
		font-family: 'VT323', monospace;
		font-size: 1.1rem;
		letter-spacing: 0.1em;
		text-transform: lowercase;
		padding: 0.7rem 1.8rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.hero__btn:active {
		transform: translateY(1px);
	}

	.hero__btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	/* Dig button - cosmic dark */
	.hero__btn--dig {
		background: rgba(0, 0, 0, 0.6);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 
			0 0 15px rgba(255, 255, 255, 0.1),
			inset 0 0 20px rgba(255, 255, 255, 0.05);
		text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
	}

	.hero__btn--dig:hover {
		background: rgba(0, 0, 0, 0.7);
		border-color: rgba(255, 255, 255, 0.5);
		box-shadow: 
			0 0 20px rgba(255, 255, 255, 0.2),
			inset 0 0 25px rgba(255, 255, 255, 0.08);
	}

	.hero__btn--dig:active {
		box-shadow: 
			0 0 10px rgba(255, 255, 255, 0.1),
			inset 0 0 15px rgba(255, 255, 255, 0.03);
	}

	/* Open button - starlight */
	.hero__btn--open {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.25);
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.08);
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
	}

	.hero__btn--open:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
	}

	.hero__btn--open:active {
		transform: translateY(1px);
		box-shadow: 0 0 8px rgba(255, 255, 255, 0.05);
	}

	/* ===== INDEX SECTION ===== */
	.index {
		position: relative;
		z-index: 3;
		padding: 0 2rem 4rem;
		margin: 0 auto;
		margin-top: -3rem; /* Pull up to peek above fold */
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Wrapper for bottom sections with unified overlay */
	.bottom-section-wrapper {
		position: relative;
	}

	/* Horizon glow - subtle lighter area near bottom */
	.bottom-section-wrapper::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			transparent 60%,
			rgba(20, 30, 50, 0.3) 80%,
			rgba(30, 40, 60, 0.5) 100%
		);
		z-index: 0;
		pointer-events: none;
	}

	.index__title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		color: #e8e8e8;
		text-align: center;
		margin-bottom: 2rem;
		text-transform: lowercase;
		text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
		animation: star-twinkle 3s ease-in-out infinite;
	}

	@keyframes star-twinkle {
		0%, 100% {
			opacity: 1;
			text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
		}
		33% {
			opacity: 0.7;
			text-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
		}
		66% {
			opacity: 0.95;
			text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
		}
	}

	/* Hide mobile title on desktop */
	.index__title--mobile {
		display: none;
	}

	/* Headers Row - reordered: thumb, headline, type, year, words, genre */
	.index__headers {
		display: grid;
		grid-template-columns: 100px minmax(200px, 450px) 100px 60px 70px 100px;
		gap: 1.5rem;
		padding: 0.75rem 1rem;
		font-family: var(--font-serif);
		letter-spacing: 0.02em;
		font-size: 1rem;
		font-weight: 500;
		color: #d0d0d0;
		text-transform: lowercase;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		margin-bottom: 0.5rem;
		width: fit-content;
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
	}

	.index__header--thumb {
		/* Empty space for thumbnail column */
		display: block;
	}

	.index__list {
		width: fit-content;
	}

	/* Story Row */
	.index__row {
		display: grid;
		grid-template-columns: 100px minmax(200px, 450px) 100px 60px 70px 100px;
		gap: 1.5rem;
		padding: 0.75rem 1rem;
		align-items: center;
		text-decoration: none;
		color: black;
		border-radius: 8px;
		transition: background-color 0.2s ease;
	}

	.index__row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.index__row:hover .index__cell {
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
	}

	/* Thumbnail */
	.index__thumb {
		width: 100px;
		height: 65px;
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.index__thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.index__thumb-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #d4d4d4 0%, #b0b0b0 100%);
	}

	/* Cell Styles */
	.index__cell {
		font-family: var(--font-serif);
		font-size: 1rem;
		color: #e0e0e0;
		letter-spacing: 0.01em;
		font-weight: 500;
		text-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
	}

	.index__cell--headline {
		font-size: 1.1rem;
		line-height: 1.3;
		color: #ffffff;
		font-weight: 500;
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
		text-transform: lowercase;
	}

	.index__cell--type,
	.index__cell--genre {
		text-transform: lowercase;
	}

	.index__cell--type {
		text-align: left;
	}

	.index__header--type {
		text-align: left;
	}

	/* Excerpt - hidden on desktop */
	.index__cell--excerpt {
		display: none;
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 1024px) {
		.index__headers {
			grid-template-columns: 80px minmax(150px, 350px) 90px 50px 60px 90px;
			gap: 1rem;
		}

		.index__row {
			grid-template-columns: 80px minmax(150px, 350px) 90px 50px 60px 90px;
			gap: 1rem;
		}

		.index__thumb {
			width: 80px;
			height: 52px;
		}
	}

	@media (max-width: 768px) {
		/* Mobile performance optimizations */
		.bg-color-wash {
			filter: blur(30px) saturate(1.5) brightness(0.4);
			opacity: 0.3;
		}

		.bg-paper {
			display: none; /* Hide texture on mobile */
		}

		.hero__card::after {
			display: none; /* Hide grain overlay on mobile */
		}

		.hero {
			min-height: auto;
			padding: 6.5rem 1rem 3rem;
			justify-content: flex-start;
			gap: 0;
			overflow: visible;
		}

		.hero__stack {
			width: 70vw;
			height: 45vw;
			margin-bottom: 4rem;
		}

		/* Reduce rotation on mobile to prevent overlap */
		.hero__card {
			transform: rotate(calc(var(--rotation) * 0.4)) translate(calc(var(--offset-x) * 0.5), calc(var(--offset-y) * 0.5));
			padding: 8px 8px 28px 8px;
			box-shadow: 
				0 1px 2px rgba(0, 0, 0, 0.1),
				0 4px 8px rgba(0, 0, 0, 0.12),
				0 8px 16px rgba(0, 0, 0, 0.1),
				inset 0 0 0 1px rgba(255, 255, 255, 0.5);
		}

		.hero__card::after {
			top: 8px;
			left: 8px;
			right: 8px;
			bottom: 28px;
		}

		.hero__title-container {
			height: 6rem; /* Fixed height to prevent layout shift */
			min-height: unset;
			margin-bottom: 3rem;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			padding: 0.5rem 1.5rem;
			position: relative;
			z-index: 5;
		}

		.hero__title {
			font-size: 2rem;
			line-height: 1.3;
			color: #c8c8d0;
			text-wrap: balance;
			white-space: normal;
			padding: 0;
			text-transform: lowercase;
			letter-spacing: 0.02em;
			/* Silver embossed - mobile */
			text-shadow: 
				-1px -1px 0 rgba(255, 255, 255, 0.9),
				1px 1px 0 rgba(0, 0, 0, 0.5),
				2px 2px 2px rgba(0, 0, 0, 0.2),
				0 0 10px rgba(192, 192, 210, 0.4);
		}

		.hero__actions {
			margin-bottom: 3rem;
			position: relative;
			z-index: 100;
			pointer-events: auto;
		}

		.hero__btn {
			font-size: 1rem;
			padding: 0.7rem 1.8rem;
			position: relative;
			z-index: 100;
			touch-action: manipulation;
			pointer-events: auto !important;
			-webkit-tap-highlight-color: transparent;
		}

		.index {
			padding: 0 1rem 2rem;
			margin-top: 0;
		}

		.index__headers {
			display: none;
		}

		/* Show mobile title */
		.index__title--mobile {
			display: block;
			margin-top: 0;
			margin-bottom: 1rem;
			font-size: 1.1rem;
			letter-spacing: 0.03em;
		}

		.index__row {
			grid-template-columns: 70px 1fr;
			grid-template-rows: auto auto;
			gap: 0.25rem 1rem;
			padding: 1rem;
		}

		.index__thumb {
			width: 70px;
			height: 46px;
			grid-row: span 2;
		}

		.index__cell--headline {
			grid-column: 2;
			font-size: 1rem;
		}

		.index__cell--type,
		.index__cell--year,
		.index__cell--words,
		.index__cell--genre {
			display: none;
		}

		/* Show excerpt on mobile */
		.index__cell--excerpt {
			display: block;
			grid-column: 2;
			font-family: var(--font-serif);
			font-size: 0.85rem;
			color: #a0a0a0;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: 1.4;
			text-shadow: 0 0 3px rgba(255, 255, 255, 0.15);
		}
	}

	@media (max-width: 480px) {
		.hero {
			padding: 5.5rem 1rem 2.5rem;
		}

		.hero__stack {
			width: 78vw;
			height: 50vw;
			margin-bottom: 3.5rem;
		}

		.hero__title-container {
			height: 5.5rem; /* Fixed height to prevent layout shift */
			min-height: unset;
			margin-bottom: 2.5rem;
			padding: 0.5rem 1rem;
			overflow: hidden;
			position: relative;
			z-index: 5;
		}

		.hero__title {
			font-size: 1.8rem;
			padding: 0;
			text-transform: lowercase;
			letter-spacing: 0.01em;
			/* Silver embossed - small mobile */
			text-shadow: 
				-1px -1px 0 rgba(255, 255, 255, 0.8),
				1px 1px 0 rgba(0, 0, 0, 0.4),
				0 0 8px rgba(192, 192, 210, 0.3);
		}

		.index__title--mobile {
			font-size: 1rem;
		}

		.hero__actions {
			margin-bottom: 2.5rem;
		}

		.hero__btn {
			font-size: 0.95rem;
			padding: 0.6rem 1.5rem;
		}
	}

	/* ===== TAGLINE ===== */
	.tagline {
		position: relative;
		z-index: 3;
		text-align: center;
		font-family: 'VT323', monospace;
		font-size: 1rem;
		color: #b0b0b0;
		line-height: 1.7;
		padding: 0.5rem 1rem 0;
		margin: 0 auto;
		white-space: nowrap;
		letter-spacing: 0.05em;
		text-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
	}

	@media (max-width: 768px) {
		.tagline {
			white-space: normal;
			max-width: 90%;
			padding: 0.5rem 1.5rem 0;
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.bg-color-wash,
		.bg-stars,
		.hero__title,
		.hero__card {
			animation: none !important;
			transition: none !important;
		}
	}

</style>
