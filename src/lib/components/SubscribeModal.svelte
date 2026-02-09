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
			<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<!-- Moon -->
				<circle cx="100" cy="18" r="6" fill="#d8dce6" opacity="0.9"/>
				<circle cx="97" cy="17" r="5.5" fill="#1e2026"/>
				<!-- Stars — scattered across the sky -->
				<circle cx="70" cy="12" r="1" fill="#d4d6dc" opacity="0.6"/>
				<circle cx="130" cy="10" r="0.8" fill="#d4d6dc" opacity="0.5"/>
				<circle cx="85" cy="25" r="0.7" fill="#d4d6dc" opacity="0.4"/>
				<circle cx="118" cy="22" r="0.9" fill="#d4d6dc" opacity="0.5"/>
				<circle cx="55" cy="28" r="0.6" fill="#d4d6dc" opacity="0.3"/>
				<circle cx="148" cy="18" r="0.7" fill="#d4d6dc" opacity="0.4"/>
				<circle cx="40" cy="15" r="0.8" fill="#d4d6dc" opacity="0.45"/>
				<circle cx="160" cy="8" r="0.9" fill="#d4d6dc" opacity="0.35"/>
				<circle cx="48" cy="38" r="0.6" fill="#d4d6dc" opacity="0.3"/>
				<circle cx="155" cy="30" r="0.7" fill="#d4d6dc" opacity="0.4"/>
				<circle cx="30" cy="22" r="0.5" fill="#d4d6dc" opacity="0.25"/>
				<circle cx="170" cy="24" r="0.6" fill="#d4d6dc" opacity="0.3"/>
				<circle cx="62" cy="6" r="0.7" fill="#d4d6dc" opacity="0.35"/>
				<circle cx="140" cy="32" r="0.5" fill="#d4d6dc" opacity="0.25"/>
				<circle cx="110" cy="8" r="0.6" fill="#d4d6dc" opacity="0.4"/>
				<circle cx="78" cy="35" r="0.5" fill="#d4d6dc" opacity="0.2"/>
				<circle cx="25" cy="34" r="0.7" fill="#d4d6dc" opacity="0.3"/>
				<circle cx="175" cy="14" r="0.5" fill="#d4d6dc" opacity="0.25"/>
				<circle cx="90" cy="10" r="0.4" fill="#d4d6dc" opacity="0.35"/>
				<circle cx="52" cy="18" r="0.5" fill="#d4d6dc" opacity="0.3"/>
				<!-- Left rock -->
				<path d="M60 95 L70 42 L82 38 L90 50 L92 95 Z" fill="#3a3c44" opacity="0.9"/>
				<path d="M65 95 L72 48 L80 44 L86 52 L88 95 Z" fill="#4a4c54" opacity="0.7"/>
				<!-- Right rock -->
				<path d="M108 95 L110 50 L118 38 L130 42 L140 95 Z" fill="#3a3c44" opacity="0.9"/>
				<path d="M112 95 L114 52 L120 44 L128 48 L135 95 Z" fill="#4a4c54" opacity="0.7"/>
				<!-- Waterfall stream -->
				<rect x="95" y="38" width="10" height="57" rx="5" fill="#8a8e9a" opacity="0.25"/>
				<rect x="97" y="40" width="6" height="55" rx="3" fill="#a0a4b0" opacity="0.3"/>
				<rect x="98.5" y="42" width="3" height="53" rx="1.5" fill="#b8bcc8" opacity="0.35"/>
				<!-- Pool at base -->
				<ellipse cx="100" cy="98" rx="28" ry="6" fill="#8a8e9a" opacity="0.2"/>
				<ellipse cx="100" cy="97" rx="18" ry="4" fill="#a0a4b0" opacity="0.15"/>
				<!-- Mist -->
				<ellipse cx="100" cy="92" rx="14" ry="5" fill="#b8bcc8" opacity="0.08"/>
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
		background: rgba(30, 32, 38, 0.88);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-radius: 10px;
		padding: 1.5rem 2rem 2.5rem;
		max-width: 380px;
		width: calc(100% - 2rem);
		z-index: 1001;
		box-shadow:
			0 16px 48px rgba(0, 0, 0, 0.35),
			0 0 30px rgba(200, 210, 225, 0.06),
			0 0 60px rgba(200, 210, 225, 0.03),
			inset 0 0 30px rgba(200, 210, 225, 0.04);
		text-align: center;
		border: 1px solid rgba(200, 210, 225, 0.18);
	}

	.modal-illustration {
		width: 120px;
		margin: 0 auto 0.5rem;
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
		color: rgba(190, 195, 210, 0.45);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		line-height: 1;
		transition: color 0.2s ease;
	}

	.modal-close:hover {
		color: rgba(220, 225, 235, 0.8);
	}

	h2 {
		font-family: var(--font-serif);
		font-size: var(--text-2xl);
		color: #d8dce6;
		margin: 0 0 0.25rem;
		font-weight: 400;
		text-shadow: 0 0 12px rgba(200, 210, 225, 0.15);
	}

	.modal-subtitle {
		font-family: var(--font-serif);
		font-size: var(--text-sm);
		color: rgba(190, 200, 215, 0.65);
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
		border: 1px solid rgba(190, 200, 215, 0.2);
		border-radius: 4px;
		background: rgba(230, 233, 240, 0.93);
		color: #2a2c32;
		font-size: var(--text-base);
		font-family: var(--font-sans);
		outline: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	input::placeholder {
		color: #7a7e88;
		opacity: 0.7;
	}

	input:focus {
		border-color: rgba(190, 200, 215, 0.45);
		box-shadow: 0 0 0 3px rgba(200, 210, 225, 0.1);
	}

	input:disabled {
		opacity: 0.6;
	}

	button[type='submit'] {
		padding: 0.75rem 1.5rem;
		border: 1px solid rgba(190, 200, 215, 0.2);
		border-radius: 4px;
		background: rgba(200, 210, 225, 0.08);
		color: rgba(210, 215, 228, 0.85);
		font-family: var(--font-serif);
		font-size: var(--text-base);
		cursor: pointer;
		transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}

	button[type='submit']:hover:not(:disabled) {
		background: rgba(200, 210, 225, 0.14);
		border-color: rgba(200, 210, 225, 0.35);
		box-shadow: 0 0 12px rgba(200, 210, 225, 0.06);
	}

	button[type='submit']:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.success-message {
		font-family: var(--font-serif);
		color: rgba(190, 210, 200, 0.9);
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
