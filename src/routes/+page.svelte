<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Tag colors rotation
	const tagColors = ['#e59d50', '#9ecf5a', '#4590b3', '#9d7bdd'];

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

<main class="px-6 md:px-16 py-12">
	<h1 class="font-serif text-4xl md:text-5xl font-bold mb-12 text-black">Posts</h1>

	<div class="grid gap-8 max-w-4xl">
		{#each data.posts as post, index}
			{@const publishedYear = new Date(post.published_at).getFullYear()}
			<article class="group">
				<a href="/{post.slug}" class="block">
					<h2 class="font-serif text-2xl md:text-3xl text-black group-hover:opacity-70 transition-opacity mb-3">
						{post.title}
					</h2>
					
					<div class="flex flex-wrap items-center gap-3">
						<span 
							class="tag-pill"
							style="color: #9ecf5a;"
						>
							<svg viewBox="0 0 100 65" preserveAspectRatio="none">
								<path class="sketch-outline" d={sketchPaths[1]} />
							</svg>
							{publishedYear}
						</span>
						
						{#if post.tags && post.tags.length > 0}
							{#each post.tags.slice(0, 3) as tag, i}
								<span 
									class="tag-pill"
									style="color: {tagColors[i % tagColors.length]};"
								>
									<svg viewBox="0 0 100 65" preserveAspectRatio="none">
										<path class="sketch-outline" d={sketchPaths[(i + 2) % sketchPaths.length]} />
									</svg>
									{tag.name}
								</span>
							{/each}
						{/if}
					</div>

					{#if post.excerpt}
						<p class="mt-3 text-neutral-600 line-clamp-2 font-serif">
							{post.excerpt}
						</p>
					{/if}
				</a>
			</article>
			
			{#if index < data.posts.length - 1}
				<hr class="border-neutral-400" />
			{/if}
		{/each}
	</div>
</main>

<style>
	.tag-pill {
		position: relative;
		padding: 0.35rem 1rem;
		font-family: 'Delicious Handrawn', cursive;
		font-size: 1.25rem;
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
</style>
