<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="max-w-3xl mx-auto px-6 py-12">
	<article class="prose prose-lg max-w-none">
		<h1 class="text-4xl font-bold mb-8">{data.post.title}</h1>

		<div>
			{@html data.post.html}
		</div>
	</article>

	<a href="/" class="inline-block mt-12 text-lg">← Back</a>
</main>
