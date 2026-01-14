<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill, BackLink } from '$lib/components';
	import { sketchPaths } from '$lib/design-system';

	let { data }: { data: PageData } = $props();

	// Format date to year
	const publishedYear = $derived(new Date(data.post.published_at).getFullYear());
	
	// Get author name
	const authorName = $derived(data.post.primary_author?.name || data.post.authors?.[0]?.name || 'siber');

	// Use extracted colors
	const colors = $derived(data.colors);
</script>

<main 
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
>
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
	main {
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
		border: 5px solid var(--border);
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Content Section */
	.content-section {
		background-color: var(--bg);
		padding: 4rem 5rem 3rem;
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
		opacity: 0.9;
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
		background-color: var(--tag-bg);
		border-radius: 8px;
		padding: 0.375rem;
		margin: 2rem 0;
		opacity: 0.9;
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
		padding-bottom: 1rem;
	}

	/* Standalone images (not in figure) */
	.article-body :global(p > img) {
		background-color: var(--tag-bg);
		border-radius: 8px;
		padding: 0.375rem;
		width: calc(100% - 0.75rem);
		opacity: 0.9;
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
	main.light-theme .post-title {
		text-shadow: 
			1px 1px 0 var(--headline-shadow),
			2px 2px 0 var(--headline-shadow),
			3px 3px 0 var(--headline-shadow),
			-1px -1px 0 var(--headline-accent),
			-2px -2px 0 var(--headline-accent);
	}

	main.light-theme .article-body :global(h2) {
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
