<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h1>{data.post.title}</h1>

	<div>
		{@html data.post.html}
	</div>

	<a href="/">← Back</a>
</article>
