<script lang="ts">
	interface Props {
		href?: string;
		label?: string;
	}

	let { 
		href = '/',
		label = '← Back to index'
	}: Props = $props();
</script>

<div class="back-link-container">
	<a href={href} class="back-link">
		{label}
	</a>
</div>

<style>
	.back-link-container {
		padding: 0 1.5rem 3rem;
		background-color: var(--color-bg-primary);
	}

	.back-link {
		display: inline-block;
		font-size: 1.125rem;
		font-family: var(--font-serif);
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color var(--transition-base);
	}

	.back-link:hover {
		color: var(--color-text-primary);
	}
</style>
