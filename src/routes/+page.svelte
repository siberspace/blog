<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.settings.title}</title>
	<meta name="description" content={data.settings.description} />
</svelte:head>

<div class="space-y-12">
	<!-- Hero Section -->
	<section class="text-center">
		<h1 class="font-serif text-5xl font-normal tracking-tight text-stone-900 sm:text-6xl">
			{data.settings.title}
		</h1>
		{#if data.settings.description}
			<p class="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
				{data.settings.description}
			</p>
		{/if}
	</section>

	<!-- Posts Grid -->
	<section class="space-y-8">
		<h2 class="font-serif text-2xl text-stone-900">Latest Posts</h2>

		{#if data.posts.length === 0}
			<p class="text-stone-600">No posts yet. Check back soon!</p>
		{:else}
			<div class="grid gap-8 sm:grid-cols-2">
				{#each data.posts as post}
					<article
						class="group overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-lg"
					>
						<a href="/{post.slug}" class="block">
							{#if post.feature_image}
								<div class="aspect-[16/10] overflow-hidden">
									<img
										src={post.feature_image}
										alt={post.feature_image_alt || post.title}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
							{:else}
								<div
									class="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200"
								>
									<span class="font-serif text-4xl text-stone-400">✦</span>
								</div>
							{/if}

							<div class="p-5">
								<!-- Tags -->
								{#if post.primary_tag}
									<span
										class="inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
									>
										{post.primary_tag.name}
									</span>
								{/if}

								<h3
									class="mt-3 font-serif text-xl font-normal text-stone-900 transition-colors group-hover:text-amber-700"
								>
									{post.title}
								</h3>

								{#if post.excerpt || post.custom_excerpt}
									<p class="mt-2 line-clamp-2 text-sm text-stone-600">
										{post.custom_excerpt || post.excerpt}
									</p>
								{/if}

								<div class="mt-4 flex items-center gap-3 text-xs text-stone-500">
									<time datetime={post.published_at}>
										{new Date(post.published_at).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</time>
									{#if post.reading_time}
										<span>·</span>
										<span>{post.reading_time} min read</span>
									{/if}
								</div>
							</div>
						</a>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.font-serif {
		font-family: 'Instrument Serif', Georgia, serif;
	}
</style>
