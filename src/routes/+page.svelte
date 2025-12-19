<script lang="ts">
	import type { PageData } from './$types';
	import { TagPill } from '$lib/components';
	import { tagColors, sketchPaths } from '$lib/design-system';

	let { data }: { data: PageData } = $props();
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
						<TagPill label={String(publishedYear)} color={tagColors[1]} pathIndex={1} size="sm" />
						
						{#if post.tags && post.tags.length > 0}
							{#each post.tags.slice(0, 3) as tag, i}
								<TagPill 
									label={tag.name} 
									color={tagColors[i % tagColors.length]} 
									pathIndex={(i + 2) % sketchPaths.length}
									size="sm"
								/>
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
