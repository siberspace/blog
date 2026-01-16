<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	onMount(() => {
		// Add Ghost Portal script for subscriptions
		if (data.ghostUrl && !document.querySelector('script[data-ghost]')) {
			const script = document.createElement('script');
			script.src = `${data.ghostUrl}/public/member.js`;
			script.setAttribute('data-ghost', data.ghostUrl);
			script.async = true;
			document.head.appendChild(script);
		}
	});
</script>

<div class="min-h-screen">
	{@render children()}
</div>
