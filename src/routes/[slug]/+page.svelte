<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Format date to year
	const publishedYear = new Date(data.post.published_at).getFullYear();

	// Tag colors rotation
	const tagColors = ['#e59d50', '#9ecf5a', '#4590b3', '#9d7bdd'];
	
	// Get author name
	const authorName = data.post.primary_author?.name || data.post.authors?.[0]?.name || 'siber';

	// Sketch path variations for organic look
	const sketchPaths = [
		// Rounded blob - organic shape
		"M 15 50 Q 5 40 8 25 Q 12 8 30 5 Q 50 2 70 5 Q 88 8 92 25 Q 95 40 85 50 Q 75 60 70 62 Q 50 65 30 62 Q 15 60 15 50 Z",
		// Slightly tilted ellipse
		"M 12 45 Q 3 30 10 18 Q 20 5 50 4 Q 80 5 90 18 Q 97 30 88 45 Q 80 58 50 60 Q 20 58 12 45 Z",
		// Wavy blob
		"M 10 40 Q 5 25 15 12 Q 30 2 50 5 Q 75 2 88 15 Q 95 30 90 45 Q 82 58 60 62 Q 35 65 18 55 Q 8 48 10 40 Z",
		// Squished organic
		"M 8 48 Q 2 35 12 20 Q 25 5 50 3 Q 78 5 90 20 Q 98 38 92 50 Q 82 62 55 63 Q 25 62 12 52 Q 5 48 8 48 Z",
	];
</script>

<main>
	<!-- Hero Section -->
	<section class="relative bg-black min-h-[450px] flex flex-col justify-between px-6 md:px-16 py-10">
		<!-- Title with mix-blend-mode -->
		<h1 
			class="font-serif text-white text-5xl md:text-7xl lg:text-[96px] leading-[1.1] max-w-4xl opacity-90 mix-blend-difference z-10"
		>
			{data.post.title}
		</h1>

		<!-- Feature Image (if available) -->
		{#if data.post.feature_image}
			<div class="absolute right-8 md:right-16 top-8 w-48 h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 overflow-hidden">
				<img 
					src={data.post.feature_image} 
					alt="" 
					class="w-full h-full object-cover mix-blend-screen opacity-80"
				/>
			</div>
		{:else}
			<!-- Placeholder decorative element -->
			<div class="absolute right-8 md:right-16 top-8 w-48 h-48 md:w-72 md:h-72 lg:w-80 lg:h-80 overflow-hidden opacity-60">
				<svg viewBox="0 0 200 200" class="w-full h-full">
					<defs>
						<radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
							<stop offset="0%" stop-color="#ffd700" />
							<stop offset="100%" stop-color="#ff8c00" />
						</radialGradient>
					</defs>
					<circle cx="100" cy="100" r="80" fill="url(#sparkle)" opacity="0.8" />
					{#each Array(12) as _, i}
						<line 
							x1="100" 
							y1="100" 
							x2={100 + 90 * Math.cos((i * 30 * Math.PI) / 180)} 
							y2={100 + 90 * Math.sin((i * 30 * Math.PI) / 180)} 
							stroke="#ffd700" 
							stroke-width="2"
							opacity="0.6"
						/>
					{/each}
				</svg>
			</div>
		{/if}

		<!-- Tags -->
		<div class="flex flex-wrap items-center gap-4 mt-8 z-10">
			<!-- Year tag -->
			<span class="tag-pill" style="color: #9ecf5a;">
				<svg viewBox="0 0 100 65" preserveAspectRatio="none">
					<path class="sketch-outline" d={sketchPaths[1]} />
				</svg>
				{publishedYear}
			</span>

			<!-- Post tags from Ghost -->
			{#if data.post.tags && data.post.tags.length > 0}
				{#each data.post.tags as tag, i}
					<span class="tag-pill" style="color: {tagColors[i % tagColors.length]};">
						<svg viewBox="0 0 100 65" preserveAspectRatio="none">
							<path class="sketch-outline" d={sketchPaths[(i + 2) % sketchPaths.length]} />
						</svg>
						{tag.name}
					</span>
				{/each}
			{/if}

			<!-- Author tag -->
			<span class="tag-pill" style="color: #9d7bdd;">
				<svg viewBox="0 0 100 65" preserveAspectRatio="none">
					<path class="sketch-outline" d={sketchPaths[0]} />
				</svg>
				by {authorName}
			</span>
		</div>
	</section>

	<!-- Body Section -->
	<section class="px-6 md:px-16 py-12 bg-[#e1e1e1]">
		<div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 max-w-7xl">
			<!-- Article Content -->
			<article class="article-body prose prose-lg max-w-none">
				{@html data.post.html}
			</article>

			<!-- Sidebar Images -->
			<aside class="hidden lg:flex flex-col gap-6">
				{#if data.post.feature_image}
					<div class="w-full aspect-square overflow-hidden">
						<img 
							src={data.post.feature_image} 
							alt="" 
							class="w-full h-full object-cover grayscale"
						/>
					</div>
					<div class="w-full aspect-square overflow-hidden">
						<img 
							src={data.post.feature_image} 
							alt="" 
							class="w-full h-full object-cover grayscale"
						/>
					</div>
				{:else}
					<!-- Placeholder images -->
					<div class="w-full aspect-square bg-neutral-300 flex items-center justify-center">
						<span class="text-neutral-500 text-sm">Image</span>
					</div>
					<div class="w-full aspect-square bg-neutral-300 flex items-center justify-center">
						<span class="text-neutral-500 text-sm">Image</span>
					</div>
				{/if}
			</aside>
		</div>
	</section>

	<!-- Back link -->
	<div class="px-6 md:px-16 pb-12 bg-[#e1e1e1]">
		<a href="/" class="inline-block text-lg font-serif text-neutral-600 hover:text-black transition-colors">
			← Back to index
		</a>
	</div>
</main>

<style>
	.tag-pill {
		position: relative;
		padding: 0.5rem 1.25rem;
		font-family: 'Delicious Handrawn', cursive;
		font-size: 1.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.tag-pill svg {
		position: absolute;
		inset: -4px;
		width: calc(100% + 8px);
		height: calc(100% + 8px);
		overflow: visible;
	}

	.tag-pill .sketch-outline {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Override prose styles for better integration */
	:global(.article-body p:first-of-type::first-letter) {
		float: left;
		font-size: 4em;
		line-height: 0.8;
		padding-right: 0.1em;
		padding-top: 0.1em;
		font-family: 'Libre Caslon Text', 'Georgia', serif;
		font-weight: 400;
	}

	:global(.article-body) {
		font-family: 'Libre Caslon Text', 'Georgia', serif;
	}

	:global(.article-body p) {
		margin-bottom: 1.5em;
		font-size: 1.125rem;
		line-height: 1.8;
	}

	:global(.article-body a) {
		color: #0e8b3e;
		text-decoration: underline;
	}

	:global(.article-body a:hover) {
		color: #0a6b2e;
	}

	:global(.article-body h2),
	:global(.article-body h3) {
		font-family: 'Libre Caslon Text', 'Georgia', serif;
		margin-top: 2em;
		margin-bottom: 1em;
	}

	:global(.article-body blockquote) {
		font-family: 'Delicious Handrawn', cursive;
		font-size: 1.25rem;
		border-left: none;
		padding-left: 0;
		font-style: normal;
	}
</style>
