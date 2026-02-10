<script lang="ts">
	import type { PageData } from './$types';
	import { Header, FlowerGarden, CosmicBackground } from '$lib/components';
	import { extractColors, defaultColors, type ColorPalette } from '$lib/utils/colorExtractor';
	import { getVisibleStars, getUserLocation, type StarPosition } from '$lib/utils/starfield';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	
	// Flower colors for each post
	let flowerColors = $state<Map<string, ColorPalette>>(new Map());
	
	// Dynamic starfield based on user location
	let starPositions = $state<StarPosition[]>([]);
	let washColor = $state({ r: 0.3, g: 0.25, b: 0.4 }); // Default purple-ish nebula
	
	// Initialize starfield on mount
	onMount(async () => {
		try {
			const location = await getUserLocation();
			starPositions = getVisibleStars(location, new Date());
			
			// Update starfield every 5 minutes to reflect sky movement
			const interval = setInterval(() => {
				starPositions = getVisibleStars(location, new Date());
			}, 5 * 60 * 1000);
			
			return () => clearInterval(interval);
		} catch (e) {
			starPositions = getVisibleStars();
		}
	});
	
	onMount(async () => {
		const isMobile = window.innerWidth <= 768;
		
		// On mobile, delay color extraction to not block initial render
		if (isMobile) {
			await new Promise(resolve => setTimeout(resolve, 500));
		}
		
		// Extract all colors in parallel
		const colorPromises = data.posts.map(async (post) => {
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
		
		const results = await Promise.all(colorPromises);
		const newColors = new Map<string, ColorPalette>();
		results.forEach(({ slug, colors }) => {
			newColors.set(slug, colors);
		});
		flowerColors = newColors;
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
			goto(`/${featuredPost.slug}`);
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


<svelte:head>
	<title>iris falls</title>
	<meta property="og:title" content="iris falls" />
	<meta property="og:description" content="music blog (most of the time). writings about lifesources in wasteland." />
	<meta property="og:image" content="https://siberrr.space/site.png" />
	<meta property="og:url" content="https://siberrr.space" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="iris falls" />
	<meta name="twitter:description" content="music blog (most of the time). writings about lifesources in wasteland." />
	<meta name="twitter:image" content="https://siberrr.space/site.png" />
</svelte:head>

<main class="landing">
	<!-- Header -->
	<Header variant="landing" />

	<!-- First viewport: hero + flowers -->
	<div class="landing__viewport">

	<!-- WebGL Background — scoped to landing viewport only -->
	<CosmicBackground 
		stars={starPositions} 
		washColor={washColor}
		washImageUrl={featuredPost?.feature_image || ''}
	/>

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

	<!-- Flower Garden at bottom of viewport -->
	<FlowerGarden posts={data.posts} colors={flowerColors} />

	</div><!-- end .landing__viewport -->

	<!-- Bottom section wrapper — underground -->
	<div class="bottom-section-wrapper">
		<!-- Roots hanging from top of underground -->
		<svg class="underground-roots" viewBox="0 0 1200 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Root cluster 1 -->
			<path d="M75 0 C73 10, 68 22, 62 38 C59 46, 56 55, 53 65" stroke="#5a7a42" stroke-width="2.2" fill="none" opacity="0.45" stroke-linecap="round"/>
			<path d="M68 25 C62 32, 54 36, 46 42" stroke="#5a7a42" stroke-width="0.9" fill="none" opacity="0.3" stroke-linecap="round"/>
			<path d="M64 35 C70 44, 76 48, 82 55" stroke="#4a6a35" stroke-width="0.7" fill="none" opacity="0.25" stroke-linecap="round"/>

			<!-- Root cluster 2 -->
			<path d="M190 0 C188 12, 182 28, 174 42 C168 52, 162 60, 158 68" stroke="#4a6a35" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
			<path d="M195 0 C200 14, 210 30, 220 45" stroke="#5a7a42" stroke-width="1.2" fill="none" opacity="0.3" stroke-linecap="round"/>
			<path d="M180 32 C172 40, 164 44, 155 50" stroke="#4a6a35" stroke-width="0.7" fill="none" opacity="0.25" stroke-linecap="round"/>

			<!-- Root cluster 3 -->
			<path d="M340 0 C338 14, 332 32, 325 50 C322 58, 318 64, 315 70" stroke="#5a7a42" stroke-width="2.4" fill="none" opacity="0.45" stroke-linecap="round"/>
			<path d="M335 22 C326 32, 316 36, 306 42" stroke="#5a7a42" stroke-width="0.9" fill="none" opacity="0.28" stroke-linecap="round"/>
			<path d="M330 38 C338 48, 346 52, 354 58" stroke="#4a6a35" stroke-width="0.7" fill="none" opacity="0.22" stroke-linecap="round"/>

			<!-- Root cluster 4 -->
			<path d="M480 0 C476 14, 468 32, 460 48 C456 56, 452 62, 448 68" stroke="#4a6a35" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
			<path d="M484 0 C490 14, 498 30, 508 45" stroke="#5a7a42" stroke-width="1.1" fill="none" opacity="0.3" stroke-linecap="round"/>
			<path d="M470 35 C462 42, 454 46, 444 52" stroke="#5a7a42" stroke-width="0.6" fill="none" opacity="0.22" stroke-linecap="round"/>

			<!-- Root cluster 5 -->
			<path d="M600 0 C597 16, 590 35, 582 52 C578 60, 574 66, 570 70" stroke="#5a7a42" stroke-width="2.3" fill="none" opacity="0.45" stroke-linecap="round"/>
			<path d="M605 0 C610 14, 618 32, 628 48" stroke="#4a6a35" stroke-width="1.4" fill="none" opacity="0.35" stroke-linecap="round"/>
			<path d="M588 38 C580 46, 572 50, 562 56" stroke="#5a7a42" stroke-width="0.7" fill="none" opacity="0.25" stroke-linecap="round"/>
			<path d="M622 36 C630 44, 638 48, 648 54" stroke="#4a6a35" stroke-width="0.6" fill="none" opacity="0.22" stroke-linecap="round"/>

			<!-- Root cluster 6 -->
			<path d="M740 0 C736 14, 728 32, 720 50 C716 58, 712 64, 708 70" stroke="#4a6a35" stroke-width="2.1" fill="none" opacity="0.4" stroke-linecap="round"/>
			<path d="M745 0 C750 14, 758 32, 766 48" stroke="#5a7a42" stroke-width="1.1" fill="none" opacity="0.3" stroke-linecap="round"/>
			<path d="M726 36 C718 44, 710 48, 700 54" stroke="#5a7a42" stroke-width="0.7" fill="none" opacity="0.25" stroke-linecap="round"/>

			<!-- Root cluster 7 -->
			<path d="M880 0 C877 14, 870 32, 862 50 C858 58, 854 64, 850 70" stroke="#5a7a42" stroke-width="2.2" fill="none" opacity="0.42" stroke-linecap="round"/>
			<path d="M885 0 C890 14, 898 30, 906 48" stroke="#4a6a35" stroke-width="1.2" fill="none" opacity="0.3" stroke-linecap="round"/>
			<path d="M868 34 C860 42, 852 46, 842 52" stroke="#5a7a42" stroke-width="0.7" fill="none" opacity="0.25" stroke-linecap="round"/>
			<path d="M900 38 C908 46, 914 50, 922 56" stroke="#4a6a35" stroke-width="0.5" fill="none" opacity="0.2" stroke-linecap="round"/>

			<!-- Root cluster 8 -->
			<path d="M1020 0 C1016 14, 1008 34, 1000 52 C996 60, 992 66, 988 70" stroke="#4a6a35" stroke-width="2" fill="none" opacity="0.4" stroke-linecap="round"/>
			<path d="M1024 0 C1030 12, 1038 28, 1048 44" stroke="#5a7a42" stroke-width="1" fill="none" opacity="0.28" stroke-linecap="round"/>
			<path d="M1006 38 C998 46, 990 50, 980 56" stroke="#4a6a35" stroke-width="0.6" fill="none" opacity="0.22" stroke-linecap="round"/>

			<!-- Root cluster 9 -->
			<path d="M1140 0 C1137 16, 1130 35, 1122 52 C1118 60, 1114 66, 1110 70" stroke="#5a7a42" stroke-width="2.1" fill="none" opacity="0.42" stroke-linecap="round"/>
			<path d="M1145 0 C1150 12, 1156 28, 1164 42" stroke="#4a6a35" stroke-width="1" fill="none" opacity="0.28" stroke-linecap="round"/>
			<path d="M1128 40 C1120 48, 1112 52, 1102 58" stroke="#5a7a42" stroke-width="0.6" fill="none" opacity="0.22" stroke-linecap="round"/>
		</svg>

		<!-- Glowing underground gems -->
		<div class="underground-gems">
			<div class="gem" style="--gem-x: 8%; --gem-y: 15%; --gem-size: 6px; --gem-color: #7dd3fc; --gem-delay: 0s;"></div>
			<div class="gem" style="--gem-x: 22%; --gem-y: 40%; --gem-size: 4px; --gem-color: #a78bfa; --gem-delay: 1.2s;"></div>
			<div class="gem" style="--gem-x: 35%; --gem-y: 22%; --gem-size: 5px; --gem-color: #fbbf24; --gem-delay: 0.6s;"></div>
			<div class="gem" style="--gem-x: 48%; --gem-y: 55%; --gem-size: 7px; --gem-color: #34d399; --gem-delay: 2.1s;"></div>
			<div class="gem" style="--gem-x: 55%; --gem-y: 12%; --gem-size: 4px; --gem-color: #f472b6; --gem-delay: 0.3s;"></div>
			<div class="gem" style="--gem-x: 65%; --gem-y: 68%; --gem-size: 5px; --gem-color: #7dd3fc; --gem-delay: 1.8s;"></div>
			<div class="gem" style="--gem-x: 72%; --gem-y: 35%; --gem-size: 6px; --gem-color: #fbbf24; --gem-delay: 0.9s;"></div>
			<div class="gem" style="--gem-x: 85%; --gem-y: 50%; --gem-size: 4px; --gem-color: #a78bfa; --gem-delay: 2.5s;"></div>
			<div class="gem" style="--gem-x: 92%; --gem-y: 20%; --gem-size: 5px; --gem-color: #34d399; --gem-delay: 1.5s;"></div>
			<div class="gem" style="--gem-x: 15%; --gem-y: 72%; --gem-size: 5px; --gem-color: #f472b6; --gem-delay: 3.0s;"></div>
			<div class="gem" style="--gem-x: 42%; --gem-y: 82%; --gem-size: 6px; --gem-color: #7dd3fc; --gem-delay: 0.4s;"></div>
			<div class="gem" style="--gem-x: 78%; --gem-y: 78%; --gem-size: 4px; --gem-color: #fbbf24; --gem-delay: 2.0s;"></div>
		</div>

		<!-- Stories Index Section -->
		<section class="index">
		<!-- Column Headers (visible on desktop as teaser) -->
		<div class="index__headers">
			<span class="index__header index__header--thumb"></span>
			<span class="index__header index__header--headline">headline</span>
			<span class="index__header index__header--genre">genre</span>
			<span class="index__header index__header--year">year</span>
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

					<!-- Genre -->
					<span class="index__cell index__cell--genre">{getGenre(post)}</span>

					<!-- Year -->
					<span class="index__cell index__cell--year">{getYear(post)}</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- Tagline -->
	<p class="tagline">
		music blog (most of the time). writings about lifesources in wasteland. published from iris falls, constella.
	</p>
	</div>
</main>

<style>
	/* ===== LANDING PAGE ===== */
	.landing {
		position: relative;
		min-height: 100vh;
		background-color: #050510;
	}

	/* ===== LANDING VIEWPORT (hero + flowers in one screen) ===== */
	.landing__viewport {
		position: relative;
		min-height: 100vh;      /* fallback */
		min-height: 100dvh;     /* dynamic viewport height — respects mobile browser chrome */
		display: flex;
		flex-direction: column;
		z-index: 3;
		/* Note: overflow left visible intentionally — hero and flower-garden
		   clip their own content. Keeping it visible prevents mobile browsers
		   from creating a scroll-boundary "catch" at the flower bed. */
	}

	/* ===== HERO SECTION ===== */
	.hero {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 7rem 2rem 1rem;
		overflow: hidden;
		z-index: 3;
		gap: 0;
	}

	/* Stacked Cards */
	.hero__stack {
		position: relative;
		width: min(70vw, 500px);
		height: min(45vw, 320px);
		margin-bottom: 4rem;
		cursor: pointer;
		touch-action: pan-y pinch-zoom; /* Allow vertical scroll but capture horizontal swipes */
	}

	.hero__card {
		position: absolute;
		inset: 0;
		border-radius: 2px;
		overflow: hidden;
		transform: rotate(var(--rotation)) translate(var(--offset-x), var(--offset-y));
		/* Matte lunar shadows */
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.2),
			0 12px 24px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(255, 255, 255, 0.15);
		/* Moon-textured frame — cratered, rough surface */
		background:
			url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='moon'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.06' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='3'%3E%3CfeDistantLight azimuth='45' elevation='55'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23moon)'/%3E%3C/svg%3E"),
			linear-gradient(175deg, #d0ccc6 0%, #c8c4be 40%, #bfbab4 100%);
		background-blend-mode: multiply, normal;
		padding: 12px 12px 40px 12px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-top-color: rgba(255, 255, 255, 0.1);
		border-left-color: rgba(255, 255, 255, 0.08);
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
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='craters'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.03' numOctaves='3' seed='5' stitchTiles='stitch' result='t'/%3E%3CfeDiffuseLighting in='t' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='220' elevation='35'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23craters)'/%3E%3C/svg%3E");
		opacity: 0.12;
		mix-blend-mode: overlay;
		pointer-events: none;
		border-radius: 2px;
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
		margin-bottom: 2.5rem;
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
		padding: 2rem 2rem 4rem;
		margin: 0 auto;
		max-width: 750px;
		display: flex;
		flex-direction: column;
	}

	/* Wrapper for bottom sections — underground */
	.bottom-section-wrapper {
		position: relative;
		background: linear-gradient(180deg,
			#3D4D2F 0%,
			#3b4a2d 2%,
			#39442a 4%,
			#383e27 6%,
			#373824 9%,
			#363323 12%,
			#342e21 16%,
			#33291f 20%,
			#2c2118 30%,
			#261c14 45%,
			#201710 65%,
			#1a120c 85%,
			#140e08 100%
		);
	}

	/* Primary stone / earth crust texture — coarse rocky grain */
	.bottom-section-wrapper::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='rock'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='6' seed='2' stitchTiles='stitch' result='coarse'/%3E%3CfeDiffuseLighting in='coarse' lighting-color='%23a08060' surfaceScale='4'%3E%3CfeDistantLight azimuth='200' elevation='40'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23rock)'/%3E%3C/svg%3E"),
			url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fine'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.08' numOctaves='4' seed='8' stitchTiles='stitch' result='grain'/%3E%3CfeDiffuseLighting in='grain' lighting-color='%23806040' surfaceScale='2'%3E%3CfeDistantLight azimuth='120' elevation='50'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fine)'/%3E%3C/svg%3E");
		background-blend-mode: overlay, soft-light;
		opacity: 0.22;
		z-index: 0;
		pointer-events: none;
	}

	/* Horizontal strata lines + darker depth patches */
	.bottom-section-wrapper::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			/* Sediment strata — faint horizontal bands */
			repeating-linear-gradient(
				178deg,
				transparent,
				transparent 50px,
				rgba(100, 75, 50, 0.07) 50px,
				rgba(100, 75, 50, 0.07) 52px,
				transparent 52px,
				transparent 85px,
				rgba(70, 50, 30, 0.05) 85px,
				rgba(70, 50, 30, 0.05) 86px
			),
			/* Darker depth pockets */
			radial-gradient(ellipse 200px 120px at 20% 30%, rgba(30, 20, 12, 0.18) 0%, transparent 70%),
			radial-gradient(ellipse 180px 100px at 70% 50%, rgba(25, 18, 10, 0.14) 0%, transparent 70%),
			radial-gradient(ellipse 250px 140px at 45% 75%, rgba(35, 25, 15, 0.12) 0%, transparent 70%),
			radial-gradient(ellipse 160px 90px at 85% 20%, rgba(28, 20, 12, 0.12) 0%, transparent 70%);
		z-index: 0;
		pointer-events: none;
	}

	/* Roots SVG at top of underground */
	.underground-roots {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 70px;
		z-index: 1;
		pointer-events: none;
	}

	/* Glowing gems container */
	.underground-gems {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
	}

	.gem {
		position: absolute;
		left: var(--gem-x);
		top: var(--gem-y);
		width: var(--gem-size);
		height: var(--gem-size);
		background: var(--gem-color);
		transform: rotate(45deg);
		border-radius: 1px;
		box-shadow: 0 0 6px var(--gem-color);
		animation: gem-glow 4s ease-in-out infinite;
		animation-delay: var(--gem-delay);
		opacity: 0.6;
		will-change: opacity;
	}

	@keyframes gem-glow {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 0.85; }
	}

	/* Headers Row */
	.index__headers {
		display: grid;
		grid-template-columns: 100px 1fr 130px 60px;
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
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
	}

	.index__header--thumb {
		/* Empty space for thumbnail column */
		display: block;
	}

	.index__list {
		width: 100%;
	}

	/* Story Row */
	.index__row {
		display: grid;
		grid-template-columns: 100px 1fr 130px 60px;
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
		font-size: 1rem;
		line-height: 1.3;
		color: #ffffff;
		font-weight: 500;
		text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
		text-transform: lowercase;
	}

	.index__cell--genre {
		text-transform: lowercase;
	}

	/* Excerpt - hidden on desktop */
	.index__cell--excerpt {
		display: none;
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 1024px) {
		.index__headers {
			grid-template-columns: 80px 1fr 110px 50px;
			gap: 1rem;
		}

		.index__row {
			grid-template-columns: 80px 1fr 110px 50px;
			gap: 1rem;
		}

		.index__thumb {
			width: 80px;
			height: 52px;
		}
	}

	@media (max-width: 768px) {
		.hero__card::after {
			display: none; /* Hide crater overlay on mobile for performance */
		}

		.hero {
			padding: 6.5rem 1rem 1rem;
			justify-content: center;
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
				0 1px 2px rgba(0, 0, 0, 0.12),
				0 4px 8px rgba(0, 0, 0, 0.15),
				0 8px 16px rgba(0, 0, 0, 0.12),
				inset 0 0 0 1px rgba(255, 255, 255, 0.15);
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
			padding: 5rem 1rem 2rem;
			margin-top: 0;
		}

		.index__headers {
			display: none;
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
			font-size: 0.8rem;
			letter-spacing: -0.015em;
		}

		.index__cell--year,
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
			padding: 8rem 1rem 1rem;
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
		padding: 0.5rem 1rem 4rem;
		margin: 0 auto;
		white-space: nowrap;
		letter-spacing: 0.05em;
		text-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
	}

	@media (max-width: 768px) {
		.tagline {
			white-space: normal;
			max-width: 90%;
			padding: 0.5rem 1.5rem 2.5rem;
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.hero__title,
		.hero__card {
			animation: none !important;
			transition: none !important;
		}
	}

</style>
