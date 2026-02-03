<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components';

	let { children } = $props();
</script>

<div class="min-h-screen bg-[var(--color-bg-primary)]">
	<Header />

	{@render children()}
</div>
