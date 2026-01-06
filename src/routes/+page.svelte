<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill } from '$lib/components';
	import { tagColors, sketchPaths } from '$lib/design-system';

	let { data }: { data: PageData } = $props();

	// Track selected story index
	let selectedIndex = $state(0);

	// Get the selected post
	const selectedPost = $derived(data.posts[selectedIndex]);

	// Get author name for selected post
	const authorName = $derived(
		selectedPost?.primary_author?.name || 
		selectedPost?.authors?.[0]?.name || 
		'siber'
	);

	// Get published year for selected post
	const publishedYear = $derived(
		selectedPost ? new Date(selectedPost.published_at).getFullYear() : ''
	);

	// Navigate up in the list
	function navigateUp() {
		if (selectedIndex > 0) {
			selectedIndex--;
		}
	}

	// Navigate down in the list
	function navigateDown() {
		if (selectedIndex < data.posts.length - 1) {
			selectedIndex++;
		}
	}

	// Open the selected article
	function openArticle() {
		if (selectedPost) {
			window.location.href = `/${selectedPost.slug}`;
		}
	}

	// Select a story by clicking on it
	function selectStory(index: number) {
		selectedIndex = index;
	}
</script>

<main class="landing-page">
	<!-- Left: Featured Image -->
	<section class="featured-image-section">
		{#if selectedPost?.feature_image}
			<img 
				src={selectedPost.feature_image} 
				alt="" 
				class="featured-image"
			/>
		{:else}
			<div class="featured-image-placeholder"></div>
		{/if}
	</section>

	<!-- Right: Story Selection Panel -->
	<section class="story-panel">
		<!-- Story List -->
		<div class="story-list">
			{#each data.posts as post, index}
				{#if index === selectedIndex}
					<!-- Expanded Selected Story -->
					<button 
						class="story-card story-card--selected"
						onclick={() => selectStory(index)}
						type="button"
					>
						<h2 class="story-card__title">{post.title}</h2>
						<div class="story-card__tags">
							<TagPill label="by {authorName}" color={tagColors[3]} pathIndex={0} size="sm" />
							{#if post.tags && post.tags.length > 0}
								{#each post.tags.slice(0, 2) as tag, i}
									<TagPill 
										label={tag.name} 
										color={tagColors[i % tagColors.length]} 
										pathIndex={(i + 1) % sketchPaths.length}
										size="sm"
									/>
								{/each}
							{/if}
							<TagPill label={String(publishedYear)} color={tagColors[2]} pathIndex={2} size="sm" />
						</div>
					</button>
				{:else}
					<!-- Collapsed Story Title -->
					<button 
						class="story-card story-card--collapsed"
						onclick={() => selectStory(index)}
						type="button"
					>
						<h2 class="story-card__title">{post.title}</h2>
					</button>
				{/if}
			{/each}
		</div>

		<!-- Navigation Buttons -->
		<div class="nav-buttons">
			<button 
				class="nav-btn nav-btn--arrow" 
				onclick={navigateUp}
				disabled={selectedIndex === 0}
				type="button"
				aria-label="Previous story"
			>
				<svg viewBox="0 0 24 24" fill="currentColor" class="arrow-icon arrow-icon--up">
					<polygon points="12,8 6,16 18,16" />
				</svg>
			</button>
			<button 
				class="nav-btn nav-btn--arrow" 
				onclick={navigateDown}
				disabled={selectedIndex === data.posts.length - 1}
				type="button"
				aria-label="Next story"
			>
				<svg viewBox="0 0 24 24" fill="currentColor" class="arrow-icon">
					<polygon points="12,16 6,8 18,8" />
				</svg>
			</button>
			<a href="/{selectedPost?.slug}" class="nav-btn nav-btn--open">
				open
			</a>
		</div>
	</section>
</main>

<style>
	/* Landing Page Layout */
	.landing-page {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
		min-height: 100vh;
		box-sizing: border-box;
	}

	/* Featured Image Section */
	.featured-image-section {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		background-color: #c3c3c3;
	}

	.featured-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.featured-image-placeholder {
		width: 100%;
		height: 100%;
		background-color: #c3c3c3;
	}

	/* Story Panel */
	.story-panel {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	/* Story List */
	.story-list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		flex: 1;
		overflow-y: auto;
	}

	/* Story Cards */
	.story-card {
		width: 100%;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		text-align: center;
		transition: opacity 0.2s ease;
	}

	.story-card__title {
		font-family: var(--font-display);
		margin: 0;
		line-height: 1.2;
	}

	/* Selected Story Card */
	.story-card--selected {
		background-color: #2f2724;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		min-height: 200px;
	}

	.story-card--selected .story-card__title {
		color: white;
		font-size: clamp(1.5rem, 3vw, 3rem);
	}

	.story-card__tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	/* Collapsed Story Card */
	.story-card--collapsed {
		background-color: #c3c3c3;
		padding: 1.5rem 1rem;
		opacity: 0.7;
	}

	.story-card--collapsed:hover {
		opacity: 0.9;
	}

	.story-card--collapsed .story-card__title {
		color: #6a6160;
		font-size: clamp(1.25rem, 2.5vw, 2.5rem);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Navigation Buttons */
	.nav-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.625rem;
	}

	.nav-btn {
		border-radius: 6px;
		padding: 1.5rem;
		font-family: var(--font-sans);
		font-size: 2rem;
		cursor: pointer;
		transition: opacity 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn--arrow {
		background-color: transparent;
		border: 1px solid black;
		color: black;
	}

	.nav-btn--arrow:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-btn--arrow:not(:disabled):hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.arrow-icon {
		width: 30px;
		height: 30px;
	}

	.nav-btn--open {
		background-color: #2f2724;
		border: 1px solid #5b654e;
		color: #f5f5f5;
		text-decoration: none;
	}

	.nav-btn--open:hover {
		opacity: 0.9;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.landing-page {
			grid-template-columns: 1fr;
			grid-template-rows: 50vh auto;
		}

		.story-card--selected {
			min-height: 150px;
		}

		.nav-btn {
			padding: 1rem;
			font-size: 1.5rem;
		}
	}
</style>
