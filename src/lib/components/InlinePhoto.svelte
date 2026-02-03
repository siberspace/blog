<script lang="ts">
	interface Props {
		src: string;
		alt?: string;
		caption?: string;
		credit?: string;
	}

	let { src, alt = '', caption, credit }: Props = $props();
</script>

<figure class="inline-photo" class:has-caption={caption || credit}>
	<div class="photo-wrapper">
		<img {src} {alt} />
	</div>
	{#if caption || credit}
		<figcaption>
			{#if caption}
				<p class="caption">{caption}</p>
			{/if}
			{#if credit}
				<hr class="divider" />
				<p class="credit">{credit}</p>
			{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.inline-photo {
		background-color: var(--color-bg-photo);
		border-radius: 8px;
		padding: 0.375rem;
	}

	.inline-photo.has-caption {
		padding-bottom: 1.5rem;
		margin: 2rem 0;
		opacity: 0.9;
	}

	.photo-wrapper {
		border-radius: 8px;
		overflow: hidden;
	}

	.photo-wrapper img {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
	}

	figcaption {
		text-align: center;
		margin-top: 1.5rem;
	}

	.caption {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--color-tag-green);
		margin: 0;
		line-height: 1.5;
	}

	.divider {
		width: 60%;
		max-width: 400px;
		margin: 0.75rem auto;
		border: none;
		border-top: 1px solid var(--color-tag-green);
		opacity: 0.5;
	}

	.credit {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--color-tag-green);
		opacity: 0.5;
		margin: 0;
	}
</style>





