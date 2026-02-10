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

		<!-- Waterfall illustration -->
		<div class="modal-illustration">
			<svg viewBox="0 -2 50 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<!-- Crescent moon — upright, points facing left -->
				<path d="M22.8-1a3.8 3.8 0 1 1 0 7.2 3.0 3.0 0 1 0 0-7.2z" fill="currentColor" opacity="0.9"/>
				<!-- Stars -->
				<circle cx="14" cy="3.5" r="0.5" fill="currentColor" opacity="0.5"/>
				<circle cx="36" cy="3" r="0.4" fill="currentColor" opacity="0.4"/>
				<circle cx="10" cy="8" r="0.35" fill="currentColor" opacity="0.3"/>
				<circle cx="40" cy="7" r="0.4" fill="currentColor" opacity="0.35"/>
				<circle cx="18" cy="9" r="0.3" fill="currentColor" opacity="0.25"/>
				<circle cx="33" cy="8.5" r="0.35" fill="currentColor" opacity="0.3"/>
				<!-- Left rock -->
				<path d="M10 28 L16 11 L21 10 L24 14 L25 28 Z" fill="currentColor" opacity="0.55"/>
				<path d="M12 28 L17 13 L20.5 12 L23 15 L24 28 Z" fill="currentColor" opacity="0.4"/>
				<!-- Right rock -->
				<path d="M25 28 L26 14 L29 10 L34 11 L40 28 Z" fill="currentColor" opacity="0.55"/>
				<path d="M26 28 L27 15 L29.5 12 L33 13 L38 28 Z" fill="currentColor" opacity="0.4"/>
				<!-- Waterfall stream — organic flowing shape -->
				<!-- Outer glow/mist of the fall -->
				<path d="M23 10.5 C23 10, 27 10, 27 10.5 C27.3 14, 27.5 18, 27.2 22 C27 24, 26.8 26, 26.5 28 L23.5 28 C23.2 26, 23 24, 22.8 22 C22.5 18, 22.7 14, 23 10.5Z" fill="currentColor" opacity="0.35"/>
				<!-- Main water body -->
				<path d="M23.8 10.8 C23.8 10.3, 26.2 10.3, 26.2 10.8 C26.4 13, 26.6 16, 26.3 19 C26.1 21.5, 26.3 24, 26 27.5 L24 27.5 C23.7 24, 23.9 21.5, 23.7 19 C23.4 16, 23.6 13, 23.8 10.8Z" fill="currentColor" opacity="0.55"/>
				<!-- Bright center stream -->
				<path d="M24.4 11.2 C24.4 10.8, 25.6 10.8, 25.6 11.2 C25.7 14, 25.8 17, 25.6 20 C25.5 22.5, 25.6 25, 25.4 27.2 L24.6 27.2 C24.4 25, 24.5 22.5, 24.4 20 C24.2 17, 24.3 14, 24.4 11.2Z" fill="currentColor" opacity="0.85"/>
				<!-- Bright highlight streak -->
				<path d="M24.8 12 C24.8 11.6, 25.2 11.6, 25.2 12 Q25.3 18, 25.1 24 Q25.0 26, 25.0 27 L25.0 27 Q25.0 26, 24.9 24 Q24.7 18, 24.8 12Z" fill="currentColor" opacity="0.95"/>
				<!-- Cascade splash at top -->
				<ellipse cx="25" cy="10.3" rx="2.5" ry="0.6" fill="currentColor" opacity="0.3"/>
				<!-- Mist at base -->
				<ellipse cx="25" cy="27.8" rx="3.5" ry="1.2" fill="currentColor" opacity="0.2"/>
				<ellipse cx="25" cy="28.2" rx="5" ry="1" fill="currentColor" opacity="0.12"/>
				<!-- Pool -->
				<ellipse cx="25" cy="29" rx="10" ry="2.2" fill="currentColor" opacity="0.25"/>
				<ellipse cx="25" cy="28.8" rx="6.5" ry="1.5" fill="currentColor" opacity="0.2"/>
			</svg>
		</div>

		<h2 id="subscribe-title">magic email deposit</h2>
		<p class="modal-subtitle">receive new dispatches from iris falls</p>

		{#if status === 'success'}
			<p class="success-message">welcome to iris falls</p>
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
					{status === 'loading' ? 'sending...' : 'tag along'}
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
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 1000;
		cursor: pointer;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(58, 56, 52, 0.92);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-radius: 10px;
		padding: 1.5rem 2rem 2.5rem;
		max-width: 380px;
		width: calc(100% - 2rem);
		z-index: 1001;
		box-shadow:
			0 16px 48px rgba(0, 0, 0, 0.4),
			0 0 30px rgba(200, 195, 180, 0.08),
			0 0 60px rgba(200, 195, 180, 0.04),
			inset 0 0 40px rgba(200, 195, 180, 0.05);
		text-align: center;
		border: 1px solid rgba(210, 205, 195, 0.2);
	}

	.modal-illustration {
		width: 120px;
		margin: 0 auto 0.5rem;
		color: #d0ccc4;
	}

	.modal-illustration svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.modal-close {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		background: none;
		border: none;
		color: rgba(200, 195, 185, 0.5);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		line-height: 1;
		transition: color 0.2s ease;
	}

	.modal-close:hover {
		color: rgba(230, 225, 215, 0.85);
	}

	h2 {
		font-family: var(--font-serif);
		font-size: var(--text-2xl);
		color: #d8d4ca;
		margin: 0 0 0.25rem;
		font-weight: 400;
		text-shadow: 0 0 12px rgba(210, 205, 195, 0.2);
	}

	.modal-subtitle {
		font-family: var(--font-serif);
		font-size: var(--text-sm);
		color: rgba(200, 195, 185, 0.7);
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
		border: 1px solid rgba(180, 175, 165, 0.25);
		border-radius: 4px;
		background: rgba(235, 230, 222, 0.93);
		color: #2e2b28;
		font-size: var(--text-base);
		font-family: var(--font-sans);
		outline: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	input::placeholder {
		color: #8a8478;
		opacity: 0.7;
	}

	input:focus {
		border-color: rgba(200, 195, 185, 0.5);
		box-shadow: 0 0 0 3px rgba(210, 205, 195, 0.12);
	}

	input:disabled {
		opacity: 0.6;
	}

	button[type='submit'] {
		padding: 0.75rem 1.5rem;
		border: 1px solid rgba(200, 195, 185, 0.22);
		border-radius: 4px;
		background: rgba(200, 195, 185, 0.1);
		color: rgba(220, 215, 205, 0.88);
		font-family: var(--font-serif);
		font-size: var(--text-base);
		cursor: pointer;
		transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}

	button[type='submit']:hover:not(:disabled) {
		background: rgba(200, 195, 185, 0.18);
		border-color: rgba(210, 205, 195, 0.4);
		box-shadow: 0 0 12px rgba(210, 205, 195, 0.08);
	}

	button[type='submit']:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.success-message {
		font-family: var(--font-serif);
		color: rgba(200, 215, 205, 0.9);
		font-size: var(--text-base);
		padding: 1rem 0;
		margin: 0;
	}

	.error-message {
		color: rgba(230, 150, 150, 0.9);
		font-size: var(--text-sm);
		margin: 0.75rem 0 0;
	}

	@media (max-width: 480px) {
		.modal {
			padding: 1.5rem 1.5rem 2rem;
		}

		.modal-illustration {
			width: 100px;
		}
	}
</style>
