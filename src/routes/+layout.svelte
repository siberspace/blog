<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-stone-50 font-sans text-stone-900">
	<!-- Header -->
	<header class="border-b border-stone-200 bg-white">
		<nav class="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
			<a href="/" class="font-serif text-2xl font-normal tracking-tight text-stone-900">
				Siberspace
			</a>
			<div class="flex items-center gap-6">
				<a href="/" class="text-sm text-stone-600 transition-colors hover:text-stone-900">
					Home
				</a>
			</div>
		</nav>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl px-6 py-12">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-stone-200 bg-white">
		<div class="mx-auto max-w-4xl px-6 py-8">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<p class="font-serif text-lg text-stone-900">Siberspace</p>
				<p class="text-sm text-stone-500">
					© {new Date().getFullYear()} All rights reserved.
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		font-family: 'DM Sans', system-ui, sans-serif;
	}
	.font-serif {
		font-family: 'Instrument Serif', Georgia, serif;
	}
</style>
