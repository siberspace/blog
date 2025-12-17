<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill, BackLink } from '$lib/components';
	import { tagColors, sketchPaths } from '$lib/design-system';

	let { data }: { data: PageData } = $props();

	// Format date to year
	const publishedYear = $derived(new Date(data.post.published_at).getFullYear());
	
	// Get author name
	const authorName = $derived(data.post.primary_author?.name || data.post.authors?.[0]?.name || 'siber');
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
			<TagPill label="by {authorName}" color={tagColors[3]} pathIndex={0} />
			
			<!-- Year tag -->
			<TagPill label={String(publishedYear)} color={tagColors[1]} pathIndex={1} />

			<!-- Post tags from Ghost -->
			{#if data.post.tags && data.post.tags.length > 0}
				{#each data.post.tags as tag, i}
					<TagPill 
						label={tag.name} 
						color={tagColors[i % tagColors.length]} 
						pathIndex={(i + 2) % sketchPaths.length}
					/>
				{/each}
			{/if}
		</div>

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
		padding: 0 1rem;
	}

	.hero-image-container {
		width: 100%;
		max-height: 600px;
		overflow: hidden;
		border-radius: 24px 24px 0 0;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Content Section */
	.content-section {
		background-color: var(--color-bg-content);
		padding: 3rem 5rem;
		border-radius: 0 0 24px 24px;
		margin: 0 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	/* Post Title */
	.post-title {
		font-family: var(--font-serif);
		font-size: clamp(2.5rem, 6vw, 6.75rem);
		color: var(--color-text-on-dark);
		text-align: center;
		line-height: 1.1;
		margin: 0;
	}

	/* Tags Container */
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
	}

	/* Article Body - Dark Theme */
	.article-body-dark {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-text-body-dark);
		max-width: 65ch;
		width: 100%;
		text-align: justify;
	}

	.article-body-dark :global(p) {
		margin-bottom: 1.5em;
	}

	.article-body-dark :global(a) {
		color: var(--color-text-on-dark);
		text-decoration: underline;
	}

	.article-body-dark :global(a:hover) {
		opacity: 0.8;
	}

	.article-body-dark :global(h2),
	.article-body-dark :global(h3) {
		font-family: var(--font-serif);
		color: var(--color-text-on-dark);
		margin-top: 2em;
		margin-bottom: 1em;
	}

	.article-body-dark :global(blockquote) {
		font-family: var(--font-handwritten);
		font-size: 1.25rem;
		border-left: none;
		padding-left: 0;
		font-style: normal;
		color: var(--color-text-on-dark);
	}

	.article-body-dark :global(strong) {
		color: var(--color-text-on-dark);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-image-section {
			padding: 0 0.5rem;
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
