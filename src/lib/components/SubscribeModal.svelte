<script lang="ts">
	import { onMount } from 'svelte';

	let isOpen = $state(false);
	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let errorMessage = $state('');

	function open() {
		isOpen = true;
		status = 'idle';
		email = '';
		errorMessage = '';
	}

	function close() {
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email || !email.includes('@')) {
			errorMessage = 'Please enter a valid email';
			status = 'error';
			return;
		}

		status = 'loading';
		errorMessage = '';

		try {
			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (response.ok) {
				status = 'success';
			} else {
				errorMessage = data.error || 'Something went wrong';
				status = 'error';
			}
		} catch {
			errorMessage = 'Could not connect. Please try again.';
			status = 'error';
		}
	}

	onMount(() => {
		(window as any).openSubscribeModal = open;
		return () => {
			delete (window as any).openSubscribeModal;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="modal-backdrop"
		onclick={close}
		role="button"
		tabindex="-1"
		onkeydown={(e) => e.key === 'Enter' && close()}
	></div>

	<!-- Modal -->
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="subscribe-title">
		<button class="modal-close" onclick={close} aria-label="Close">&times;</button>

		<h2 id="subscribe-title">subscribe</h2>
		<p class="modal-subtitle">get new posts delivered to your inbox</p>

		{#if status === 'success'}
			<p class="success-message">you're in! check your inbox.</p>
		{:else}
			<form onsubmit={handleSubmit}>
				<input
					type="email"
					bind:value={email}
					placeholder="your@email.com"
					required
					disabled={status === 'loading'}
				/>
				<button type="submit" disabled={status === 'loading'}>
					{status === 'loading' ? 'sending...' : 'subscribe'}
				</button>
			</form>

			{#if status === 'error'}
				<p class="error-message">{errorMessage}</p>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(3px);
		z-index: 1000;
		cursor: pointer;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--color-bg-primary);
		border-radius: 8px;
		padding: 2.5rem 2rem;
		max-width: 380px;
		width: calc(100% - 2rem);
		z-index: 1001;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
		text-align: center;
	}

	.modal-close {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		line-height: 1;
		transition: color var(--transition-base);
	}

	.modal-close:hover {
		color: var(--color-text-primary);
	}

	h2 {
		font-family: var(--font-serif);
		font-size: var(--text-2xl);
		color: var(--color-text-primary);
		margin: 0 0 0.25rem;
		font-weight: 400;
	}

	.modal-subtitle {
		font-family: var(--font-serif);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0 0 1.5rem;
		font-style: italic;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	input {
		padding: 0.75rem 1rem;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 4px;
		background: #fff;
		color: var(--color-text-primary);
		font-size: var(--text-base);
		font-family: var(--font-sans);
		outline: none;
		transition: border-color var(--transition-base), box-shadow var(--transition-base);
	}

	input::placeholder {
		color: var(--color-text-secondary);
		opacity: 0.6;
	}

	input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgba(14, 139, 62, 0.1);
	}

	input:disabled {
		opacity: 0.6;
	}

	button[type='submit'] {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		background: var(--color-accent);
		color: #fff;
		font-family: var(--font-serif);
		font-size: var(--text-base);
		cursor: pointer;
		transition: background var(--transition-base);
	}

	button[type='submit']:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	button[type='submit']:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.success-message {
		font-family: var(--font-serif);
		color: var(--color-accent);
		font-size: var(--text-base);
		padding: 1rem 0;
		margin: 0;
	}

	.error-message {
		color: #c53030;
		font-size: var(--text-sm);
		margin: 0.75rem 0 0;
	}

	@media (max-width: 480px) {
		.modal {
			padding: 2rem 1.5rem;
		}
	}
</style>
