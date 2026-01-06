<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill, BackLink } from '$lib/components';
	import { sketchPaths } from '$lib/design-system';

	let { data }: { data: PageData } = $props();

	// Format date to year
	const publishedYear = $derived(new Date(data.post.published_at).getFullYear());
	
	// Get author name
	const authorName = $derived(data.post.primary_author?.name || data.post.authors?.[0]?.name || 'siber');

	// Tag color for green theme
	const tagColor = '#385c35';
</script>

<main>
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
			<TagPill label="by {authorName}" color={tagColor} pathIndex={0} />
			
			<!-- Year tag -->
			<TagPill label={String(publishedYear)} color={tagColor} pathIndex={1} />

			<!-- Post tags from Ghost -->
			{#if data.post.tags && data.post.tags.length > 0}
				{#each data.post.tags as tag, i}
					<TagPill 
						label={tag.name} 
						color={tagColor} 
						pathIndex={(i + 2) % sketchPaths.length}
					/>
				{/each}
			{/if}
		</div>

		<!-- Divider Line -->
		<hr class="divider-line" />

		<!-- Article Body -->
		<article class="article-body-dark">
			{@html data.post.html}
		</article>
	</section>

	<!-- Back link -->
	<BackLink />
</main>

<style>
	/* Hero Image Section */
	.hero-image-section {
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
		border: 5px solid var(--color-bg-content-green);
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Content Section */
	.content-section {
		background-color: var(--color-bg-content-green);
		padding: 3rem 5rem;
		border-radius: 12px;
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
		color: #7bc043;
		text-align: center;
		line-height: 1.1;
		margin: 0;
		text-shadow: 
			1px 1px 0 #2d5a27,
			2px 2px 0 #2d5a27,
			3px 3px 0 #1e3d1a,
			4px 4px 0 #1e3d1a,
			5px 5px 0 #152b12,
			6px 6px 0 #152b12,
			-1px -1px 0 #5bbcd4,
			-2px -2px 0 #4aa8bf;
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
		border-top: 2px solid var(--color-text-on-green);
		opacity: 0.3;
		margin: 0;
	}

	/* Article Body - Green Theme */
	.article-body-dark {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-text-body-green);
		max-width: 65ch;
		width: 100%;
		text-align: justify;
		opacity: 0.9;
	}

	.article-body-dark :global(p) {
		margin-bottom: 1.5em;
	}

	/* Drop cap for first paragraph */
	.article-body-dark :global(p:first-of-type::first-letter) {
		float: left;
		font-family: var(--font-display);
		font-size: 3.75em;
		line-height: 0.8;
		padding-right: 0.08em;
		padding-top: 0.05em;
		color: var(--color-text-on-green);
	}

	.article-body-dark :global(a) {
		color: var(--color-text-body-green);
		text-decoration: underline;
	}

	.article-body-dark :global(a:hover) {
		opacity: 0.8;
	}

	.article-body-dark :global(h2) {
		font-family: var(--font-handwritten);
		font-size: 2.5rem;
		font-weight: 700;
		color: #7bc043;
		margin-top: 2em;
		margin-bottom: 1em;
		text-align: center;
		text-shadow: 
			1px 1px 0 #2d5a27,
			2px 2px 0 #2d5a27,
			3px 3px 0 #1e3d1a,
			4px 4px 0 #1e3d1a,
			5px 5px 0 #152b12,
			6px 6px 0 #152b12,
			-1px -1px 0 #5bbcd4,
			-2px -2px 0 #4aa8bf;
	}

	.article-body-dark :global(h3) {
		font-family: var(--font-serif);
		font-size: 1.375rem;
		color: var(--color-text-on-green);
		margin-top: 2em;
		margin-bottom: 1em;
	}

	.article-body-dark :global(blockquote) {
		font-family: var(--font-handwritten);
		font-size: 1.25rem;
		border-left: none;
		padding-left: 0;
		font-style: normal;
		color: var(--color-text-on-green);
	}

	.article-body-dark :global(strong) {
		color: var(--color-text-on-green);
	}

	/* Inline images with card background */
	.article-body-dark :global(figure:not(.kg-embed-card)),
	.article-body-dark :global(.kg-image-card) {
		background-color: var(--color-bg-photo);
		border-radius: 8px;
		padding: 0.375rem;
		margin: 2rem 0;
		opacity: 0.9;
	}

	.article-body-dark :global(figure:not(.kg-embed-card) img),
	.article-body-dark :global(.kg-image-card img) {
		border-radius: 8px;
		width: 100%;
		height: auto;
		display: block;
	}

	.article-body-dark :global(figcaption) {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--color-tag-green);
		text-align: center;
		margin-top: 1rem;
		padding-bottom: 1rem;
	}

	/* Standalone images (not in figure) */
	.article-body-dark :global(p > img) {
		background-color: var(--color-bg-photo);
		border-radius: 8px;
		padding: 0.375rem;
		width: calc(100% - 0.75rem);
		opacity: 0.9;
	}

	/* YouTube/Video embeds - full width, no background */
	.article-body-dark :global(.kg-embed-card) {
		margin: 2rem 0;
		width: 100%;
	}

	.article-body-dark :global(.kg-embed-card iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		height: auto;
		border-radius: 8px;
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

		.article-body-dark {
			text-align: left;
		}
	}
</style>
