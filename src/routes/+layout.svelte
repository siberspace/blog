<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-screen bg-[#e1e1e1]">
	<!-- Header -->
	<header class="flex items-center justify-between px-6 py-5 bg-[#e1e1e1]">
		<a href="/" class="text-2xl font-bold text-black font-sans tracking-tight">
			saberspace
		</a>
		<a href="/" class="text-2xl font-light text-black font-sans">
			Quick Index
		</a>
	</header>

	{@render children()}
</div>
