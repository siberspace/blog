<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const post = data.post;
</script>

<svelte:head>
	<title>{post.title}</title>
	<meta name="description" content={post.custom_excerpt || post.excerpt} />
	{#if post.feature_image}
		<meta property="og:image" content={post.feature_image} />
	{/if}
</svelte:head>

<article class="mx-auto max-w-2xl">
	<!-- Header -->
	<header class="mb-10 text-center">
		{#if post.primary_tag}
			<a
				href="/tag/{post.primary_tag.slug}"
				class="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200"
			>
				{post.primary_tag.name}
			</a>
		{/if}

		<h1 class="mt-4 font-serif text-4xl font-normal leading-tight text-stone-900 sm:text-5xl">
			{post.title}
		</h1>

		<div class="mt-6 flex items-center justify-center gap-4 text-sm text-stone-500">
			{#if post.primary_author}
				<div class="flex items-center gap-2">
					{#if post.primary_author.profile_image}
						<img
							src={post.primary_author.profile_image}
							alt={post.primary_author.name}
							class="h-8 w-8 rounded-full object-cover"
						/>
					{/if}
					<span class="font-medium text-stone-700">{post.primary_author.name}</span>
				</div>
				<span class="text-stone-300">·</span>
			{/if}

			<time datetime={post.published_at}>
				{new Date(post.published_at).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</time>

			{#if post.reading_time}
				<span class="text-stone-300">·</span>
				<span>{post.reading_time} min read</span>
			{/if}
		</div>
	</header>

	<!-- Feature Image -->
	{#if post.feature_image}
		<figure class="mb-10 overflow-hidden rounded-xl">
			<img
				src={post.feature_image}
				alt={post.feature_image_alt || post.title}
				class="w-full object-cover"
			/>
			{#if post.feature_image_caption}
				<figcaption class="mt-3 text-center text-sm text-stone-500">
					{@html post.feature_image_caption}
				</figcaption>
			{/if}
		</figure>
	{/if}

	<!-- Content -->
	<div class="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
		{@html post.html}
	</div>

	<!-- Tags -->
	{#if post.tags && post.tags.length > 0}
		<footer class="mt-12 border-t border-stone-200 pt-8">
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag}
					<a
						href="/tag/{tag.slug}"
						class="rounded-full bg-stone-100 px-4 py-1.5 text-sm text-stone-600 transition-colors hover:bg-stone-200"
					>
						#{tag.name}
					</a>
				{/each}
			</div>
		</footer>
	{/if}

	<!-- Back Link -->
	<div class="mt-12">
		<a
			href="/"
			class="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
			Back to all posts
		</a>
	</div>
</article>

<style>
	.font-serif {
		font-family: 'Instrument Serif', Georgia, serif;
	}
</style>

