<script lang="ts">
	interface Props {
		siteName?: string;
	}

	let { 
		siteName = 'siberspace'
	}: Props = $props();

	let email = $state('');

	function handleSubscribe(e: Event) {
		e.preventDefault();
		if (email) {
			// TODO: Connect to newsletter service
			console.log('Subscribe:', email);
			email = '';
		}
	}
</script>

<header class="header">
	<a href="/" class="header__logo">
		<span class="header__logo-name">{siteName}</span>
	</a>
	<img src="/site.png" alt="" class="header__avatar" />
	<form class="header__subscribe" onsubmit={handleSubscribe}>
		<input 
			type="email" 
			placeholder="email" 
			bind:value={email}
			class="header__input"
		/>
	</form>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background-color: var(--color-bg-content-green);
		border-bottom-left-radius: 12px;
		border-bottom-right-radius: 12px;
		margin-left: 1rem;
		margin-right: 1rem;
		gap: 1rem;
	}

	.header__avatar {
		width: clamp(32px, 5vw, 48px);
		height: clamp(32px, 5vw, 48px);
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.header__logo {
		font-size: clamp(0.875rem, 2vw, 1.25rem);
		color: var(--color-text-on-green);
		font-family: var(--font-sans);
		text-decoration: none;
		transition: opacity var(--transition-base);
		font-style: italic;
		flex-shrink: 0;
	}

	.header__logo:hover {
		opacity: 0.8;
	}

	.header__logo-name {
		font-weight: 700;
	}

	.header__subscribe {
		flex-shrink: 1;
		min-width: 0;
	}

	.header__input {
		width: 100%;
		max-width: clamp(100px, 15vw, 160px);
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-text-on-green);
		border-radius: 6px;
		background-color: transparent;
		color: var(--color-text-on-green);
		font-family: var(--font-sans);
		font-size: clamp(0.75rem, 1.5vw, 0.875rem);
		font-style: italic;
	}

	.header__input::placeholder {
		color: var(--color-text-on-green);
		opacity: 0.6;
	}

	.header__input:focus {
		outline: none;
		border-color: var(--color-text-body-green);
	}

	@media (max-width: 768px) {
		.header {
			margin-left: 0.5rem;
			margin-right: 0.5rem;
			padding: 0.75rem 1rem;
		}
	}
</style>

