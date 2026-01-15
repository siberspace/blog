<script lang="ts">
	import type { PageData } from './$types';
	import { Header } from '$lib/components';

	let { data }: { data: PageData } = $props();

	// Current featured post index
	let featuredIndex = $state(0);
	let previousIndex = $state(0);
	let isTransitioning = $state(false);
	let rotationSide = $state(0); // Alternates between 0 and 1
	
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

	// Dig - smooth crossfade to new record
	function dig() {
		if (isTransitioning || data.posts.length <= 1) return;
		
		// Pick a random index different from current
		let newIndex;
		do {
			newIndex = Math.floor(Math.random() * data.posts.length);
		} while (newIndex === featuredIndex && data.posts.length > 1);
		
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

	// Open the featured post in a new tab
	function openStory() {
		if (featuredPost) {
			window.open(`/${featuredPost.slug}`, '_blank');
		}
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
</svelte:head>

<main class="landing">
	<!-- Background layers (bottom to top) -->
	<div class="bg-base"></div>
	<div class="bg-color-wash" style="background-image: url('{featuredPost?.feature_image || ''}')"></div>
	<div class="bg-paper"></div>
	<div class="bg-gradient"></div>
	<div class="bg-shimmer" style="--scroll-y: {scrollY}px"></div>

	<!-- Header -->
	<Header variant="landing" />

	<!-- Hero Section -->
	<section class="hero">

		<!-- Stacked Feature Images with Crossfade -->
		<div class="hero__stack">
			<!-- Background cards (static stack effect) -->
			{#each [2, 3] as i}
				{@const rotation = [-5, 7][i - 2]}
				{@const offset = i * 8}
				<div 
					class="hero__card hero__card--bg"
					style="
						--rotation: {rotation}deg;
						--offset-x: {offset}px;
						--offset-y: {offset}px;
					"
				>
					{#if data.posts[(featuredIndex + i) % data.posts.length]?.feature_image}
						<img 
							src={data.posts[(featuredIndex + i) % data.posts.length].feature_image} 
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
				<div 
					class="hero__card hero__card--outgoing"
					style="--rotation: {rotations[rotationSide === 0 ? 1 : 0]}deg; --offset-x: 0px; --offset-y: 0px;"
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
				style="--rotation: {rotations[rotationSide]}deg; --offset-x: 0px; --offset-y: 0px;"
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
		<div class="hero__title-container">
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
				open
			</button>
		</div>
	</section>

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
</main>

<style>
	/* ===== LANDING PAGE ===== */
	.landing {
		position: relative;
		min-height: 100vh;
		background-color: #f5f5f5;
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

	/* Layer 1.5: Color wash from featured image */
	.bg-color-wash {
		position: fixed;
		inset: -50px;
		background-size: cover;
		background-position: center;
		filter: blur(80px) saturate(1.5);
		opacity: 0.45;
		pointer-events: none;
		z-index: 0;
		transition: background-image 0.5s ease-out;
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
		width: min(85vw, 650px);
		height: min(55vw, 400px);
		margin-bottom: 3rem;
	}

	.hero__card {
		position: absolute;
		inset: 0;
		border-radius: 24px;
		overflow: hidden;
		transform: rotate(var(--rotation)) translate(var(--offset-x), var(--offset-y));
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
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
	}

	.hero__card-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #d4d4d4 0%, #a3a3a3 100%);
	}

	/* Hero Title */
	.hero__title-container {
		min-height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.25rem;
		padding: 0 1rem;
	}

	.hero__title {
		font-family: var(--font-typewriter);
		font-size: clamp(0.9rem, 2vw, 1.25rem);
		font-weight: 700;
		color: white;
		text-align: center;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		max-width: 450px;
		line-height: 1.4;
	}

	/* Action Buttons */
	.hero__actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.hero__btn {
		font-family: var(--font-typewriter);
		font-size: 1.1rem;
		padding: 0.7rem 1.8rem;
		border-radius: 22px;
		cursor: pointer;
		transition: all 0.1s ease;
		position: relative;
	}

	.hero__btn:active {
		transform: translateY(2px);
	}

	.hero__btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	/* Dig button - dark tactile */
	.hero__btn--dig {
		background: linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 50%, #0f0f0f 100%);
		color: white;
		border: none;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow: 
			0 4px 0 #000,
			0 6px 8px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.hero__btn--dig:hover {
		background: linear-gradient(180deg, #454545 0%, #252525 50%, #1a1a1a 100%);
	}

	.hero__btn--dig:active {
		box-shadow: 
			0 1px 0 #000,
			0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Open button - subtle tactile */
	.hero__btn--open {
		background: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);
		color: #1a1a1a;
		border: 1px solid #d0d0d0;
		box-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	.hero__btn--open:hover {
		background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
		box-shadow: 
			0 3px 6px rgba(0, 0, 0, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}

	.hero__btn--open:active {
		transform: translateY(1px);
		box-shadow: 
			0 1px 2px rgba(0, 0, 0, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
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

	.index__title {
		font-family: var(--font-typewriter);
		font-size: 1.5rem;
		font-weight: 700;
		color: black;
		text-align: center;
		margin-bottom: 2rem;
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
		font-family: var(--font-typewriter);
		font-size: 1rem;
		font-weight: 700;
		color: black;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin-bottom: 0.5rem;
		width: fit-content;
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
		background-color: rgba(0, 0, 0, 0.05);
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
		font-family: var(--font-typewriter);
		font-size: 1rem;
		color: black;
	}

	.index__cell--headline {
		font-size: 1.125rem;
		line-height: 1.3;
	}

	.index__cell--type,
	.index__cell--genre {
		text-transform: lowercase;
	}

	.index__cell--type {
		text-align: center;
	}

	.index__header--type {
		text-align: center;
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
		.hero {
			padding: 5rem 1rem 3rem;
		}

		.hero__stack {
			width: 90vw;
			height: 60vw;
		}

		.hero__btn {
			font-size: 1rem;
			padding: 0.6rem 1.5rem;
		}

		.index {
			padding: 2rem 1rem 3rem;
		}

		.index__headers {
			display: none;
		}

		/* Show mobile title */
		.index__title--mobile {
			display: block;
			margin-top: 2rem;
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
			font-family: var(--font-sans);
			font-size: 0.8rem;
			color: #666;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: 1.4;
		}
	}

	@media (max-width: 480px) {
		.hero__title {
			font-size: 1.25rem;
		}

		.hero__btn {
			font-size: 1rem;
			padding: 0.75rem 1.5rem;
		}
	}
</style>
