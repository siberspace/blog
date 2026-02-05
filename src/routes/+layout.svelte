<script lang="ts">
	import '../app.css';
	import { SubscribeModal } from '$lib/components';

	let { children } = $props();
</script>

<div class="min-h-screen bg-[var(--color-bg-primary)]">
	{@render children()}
</div>

<SubscribeModal />
