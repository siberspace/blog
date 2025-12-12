<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="max-w-3xl mx-auto px-6 py-12">
	<h1 class="text-4xl font-bold mb-8">Posts</h1>

	<ul class="space-y-4">
		{#each data.posts as post}
			<li class="border-b border-neutral-800 pb-4">
				<a href="/{post.slug}" class="text-xl hover:underline">{post.title}</a>
			</li>
		{/each}
	</ul>
</main>
