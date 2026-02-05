<script lang="ts">
	import { onMount } from 'svelte';

	let isOpen = $state(false);
	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let hiddenForm: HTMLFormElement;

	function open() {
		isOpen = true;
		status = 'idle';
		email = '';
	}

	function close() {
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!email || !email.includes('@')) return;
		
		status = 'loading';
		
		// Submit via hidden form to Ghost
		if (hiddenForm) {
			const emailInput = hiddenForm.querySelector('input[name="email"]') as HTMLInputElement;
			if (emailInput) {
				emailInput.value = email;
			}
			hiddenForm.submit();
		}
		
		// Show success after a delay (form submits to iframe)
		setTimeout(() => {
			status = 'success';
		}, 1500);
	}

	// Expose open function globally for header buttons
	onMount(() => {
		(window as any).openSubscribeModal = open;
		
		// Listen for hash changes
		const checkHash = () => {
			if (window.location.hash === '#/portal/signup' || window.location.hash === '#subscribe') {
				open();
				history.replaceState(null, '', window.location.pathname);
			}
		};
		
		checkHash();
		window.addEventListener('hashchange', checkHash);
		
		return () => {
			window.removeEventListener('hashchange', checkHash);
			delete (window as any).openSubscribeModal;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Always render so Ghost can find the form, use CSS to show/hide -->
<div class="modal-wrapper" class:modal-wrapper--open={isOpen}>
	<!-- Backdrop -->
	<div class="modal-backdrop" onclick={close} role="button" tabindex="-1" onkeydown={(e) => e.key === 'Enter' && close()}></div>
	
	<!-- Modal -->
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
		<button class="modal-close" onclick={close} aria-label="Close">×</button>
		
		<!-- Waterfall doodle - top center -->
		<svg class="waterfall-doodle" viewBox="0 -15 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<!-- Gradient for fading pool edge -->
				<radialGradient id="poolFade" cx="50%" cy="50%" rx="50%" ry="50%">
					<stop offset="0%" stop-color="#2a4555" stop-opacity="0.7"/>
					<stop offset="60%" stop-color="#1a3545" stop-opacity="0.4"/>
					<stop offset="100%" stop-color="#1a3040" stop-opacity="0"/>
				</radialGradient>
			</defs>
			
			<!-- Stars scattered around -->
			<circle cx="8" cy="12" r="1.2" fill="#ffffff" opacity="0.7"/>
			<circle cx="15" cy="-5" r="0.9" fill="#ffffff" opacity="0.6"/>
			<circle cx="5" cy="28" r="0.9" fill="#ffffff" opacity="0.55"/>
			<circle cx="92" cy="-8" r="1.1" fill="#ffffff" opacity="0.65"/>
			<circle cx="30" cy="-12" r="0.8" fill="#ffffff" opacity="0.5"/>
			<circle cx="95" cy="36" r="1" fill="#ffffff" opacity="0.6"/>
			<circle cx="70" cy="-10" r="0.7" fill="#ffffff" opacity="0.5"/>
			<circle cx="85" cy="-3" r="0.7" fill="#ffffff" opacity="0.45"/>
			<circle cx="12" cy="42" r="0.7" fill="#ffffff" opacity="0.5"/>
			<circle cx="3" cy="5" r="0.9" fill="#ffffff" opacity="0.6"/>
			<circle cx="88" cy="40" r="0.8" fill="#ffffff" opacity="0.55"/>
			<circle cx="97" cy="12" r="0.6" fill="#ffffff" opacity="0.45"/>
			<circle cx="20" cy="-2" r="0.5" fill="#ffffff" opacity="0.4"/>
			<circle cx="8" cy="-10" r="0.6" fill="#ffffff" opacity="0.5"/>
			
			<!-- Water pool at base - fading edges -->
			<ellipse cx="50" cy="58" rx="42" ry="12" fill="url(#poolFade)"/>
			<ellipse cx="50" cy="58" rx="32" ry="8" fill="#2a4555" opacity="0.5"/>
			<ellipse cx="50" cy="58" rx="24" ry="5" fill="#3a5565" opacity="0.35"/>
			<!-- Water surface shimmer -->
			<path d="M22 56 Q32 54 42 56 Q52 58 62 56 Q72 54 78 56" stroke="#6ab8d8" stroke-width="0.6" fill="none" opacity="0.35"/>
			<path d="M28 60 Q38 58 48 60 Q58 62 68 60" stroke="#5aa8c8" stroke-width="0.5" fill="none" opacity="0.25"/>
			
			<!-- Rocky cliffs - sitting in the pool -->
			<path d="M18 26 Q26 20 34 25 L36 50 Q28 54 16 50 Z" fill="#4a5565" stroke="#3a4555" stroke-width="1.5"/>
			<path d="M32 20 Q48 14 58 20 L60 50 Q50 56 34 52 Z" fill="#3a4555" stroke="#2a3545" stroke-width="1.5"/>
			<path d="M56 26 Q66 22 74 28 L72 50 Q64 54 56 50 Z" fill="#4a5565" stroke="#3a4555" stroke-width="1"/>
			<!-- Rock texture lines -->
			<path d="M24 32 Q28 34 26 40" stroke="#2a3545" stroke-width="0.8" fill="none" opacity="0.5"/>
			<path d="M44 28 Q50 30 48 40" stroke="#2a3545" stroke-width="0.8" fill="none" opacity="0.5"/>
			<path d="M62 32 Q66 34 64 40" stroke="#2a3545" stroke-width="0.8" fill="none" opacity="0.4"/>
			
			<!-- Waterfall - starts at rock top (y=20) -->
			<path d="M46 20 C48 30, 44 40, 46 52" stroke="#a8daf0" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.3"/>
			<path d="M46 20 C48 30, 44 40, 46 52" stroke="#c0e8ff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.55"/>
			<path d="M46 20 C47 30, 45 40, 46 52" stroke="#d8f0ff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.75"/>
			<path d="M46 20 C46.5 28, 45.5 38, 46 50" stroke="#e8f8ff" stroke-width="0.8" fill="none" stroke-linecap="round" opacity="0.9"/>
			<!-- Secondary streams -->
			<path d="M43 22 C44 32, 41 42, 43 52" stroke="#b0e0f8" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.4"/>
			<path d="M49 22 C51 34, 48 44, 49 52" stroke="#b0e0f8" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.35"/>
			
			<!-- Splash where waterfall meets pool -->
			<ellipse cx="46" cy="54" rx="8" ry="3" fill="#c0e8ff" opacity="0.25"/>
			<ellipse cx="46" cy="56" rx="5" ry="2" fill="#d0f0ff" opacity="0.2"/>
			
			<!-- Foliage hints on rocks -->
			<path d="M16 32 Q20 26 24 32 Q20 30 16 32" fill="#4a6050" opacity="0.5"/>
			<path d="M70 34 Q74 28 78 34 Q74 32 70 34" fill="#4a6050" opacity="0.45"/>
			
			<!-- Crescent moon - using circle with cutout -->
			<circle cx="50" cy="-3" r="7" fill="#eae6da"/>
			<circle cx="54" cy="-5" r="5.5" fill="#1e2838"/>
			<!-- Moon crater hints -->
			<circle cx="47" cy="-4" r="0.8" fill="#d8d4c8" opacity="0.3"/>
			<circle cx="49" cy="1" r="0.5" fill="#d8d4c8" opacity="0.25"/>
		</svg>

		<div class="modal-content">
			<h2 id="modal-title">magic email box</h2>
			<p>receive new dispatches from iris falls</p>
			
			{#if status === 'success'}
				<p class="success-message">check your inbox for a magic link!</p>
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
			{/if}
		</div>
	</div>
</div>

<!-- Hidden form for Ghost submission -->
<iframe name="ghost-subscribe-frame" title="Subscribe form target" style="display:none;"></iframe>
<form
	bind:this={hiddenForm}
	action="https://siberspace.ghost.io/members/api/send-magic-link/"
	method="POST"
	target="ghost-subscribe-frame"
	style="display:none;"
>
	<input type="hidden" name="email" value="" />
	<input type="hidden" name="emailType" value="signup" />
</form>

<style>
	.modal-wrapper {
		display: none;
	}

	.modal-wrapper--open {
		display: block;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		z-index: 1000;
		cursor: pointer;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/* Night-sky wooden sign */
		background: 
			url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='wood'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.12' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23wood)' opacity='0.12'/%3E%3C/svg%3E"),
			linear-gradient(180deg, #2a3545 0%, #1e2838 30%, #161e2a 70%, #0e1420 100%);
		border: 4px solid #0a1018;
		border-radius: 8px;
		padding: 5rem 2rem 2rem;
		max-width: 380px;
		width: calc(100% - 2rem);
		z-index: 1001;
		box-shadow: 
			0 20px 60px rgba(0, 0, 0, 0.7),
			inset 0 1px 0 rgba(100, 140, 180, 0.15),
			inset 0 -2px 0 rgba(0, 0, 0, 0.4),
			0 0 0 2px #060a10,
			0 0 40px rgba(80, 120, 180, 0.1);
		/* Wood plank edges - night tones */
		border-top-color: #3a4a5a;
		border-left-color: #2a3a4a;
	}

	.waterfall-doodle {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 100px;
		height: 70px;
		opacity: 0.85;
	}

	.modal-close {
		position: absolute;
		top: 0.75rem;
		right: 1rem;
		background: none;
		border: none;
		color: rgba(180, 200, 220, 0.4);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		line-height: 1;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: rgba(180, 200, 220, 0.8);
	}

	.modal-content {
		text-align: center;
		position: relative;
		z-index: 1;
	}

	/* Engraved text effect - light text with carved shadow */
	.modal-content h2 {
		font-family: "Libre Caslon Text", "Georgia", serif;
		font-size: 1.5rem;
		color: #b8c8d8;
		margin: 0.5rem 0 0.5rem;
		text-shadow: 
			0 -1px 1px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(180, 200, 220, 0.15);
		letter-spacing: 0.02em;
		font-weight: 500;
	}

	.modal-content p {
		font-family: "Libre Caslon Text", "Georgia", serif;
		color: #9aacbc;
		margin: 0 0 1.25rem;
		font-size: 0.9rem;
		font-style: italic;
		text-shadow: 
			0 -1px 1px rgba(0, 0, 0, 0.5),
			0 1px 0 rgba(180, 200, 220, 0.1);
	}

	.modal-subtext {
		font-size: 0.8rem !important;
		color: #8a9cac !important;
		text-shadow: 
			0 -1px 1px rgba(0, 0, 0, 0.4),
			0 1px 0 rgba(180, 200, 220, 0.1) !important;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	input {
		padding: 0.75rem 1rem;
		border: 2px solid rgba(0, 0, 0, 0.4);
		border-radius: 4px;
		background: rgba(220, 230, 245, 0.92);
		color: #1a2030;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-shadow: 
			inset 0 2px 4px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(255, 255, 255, 0.5);
	}

	input::placeholder {
		color: rgba(30, 50, 80, 0.5);
	}

	input:focus {
		border-color: rgba(80, 120, 180, 0.6);
		box-shadow: 
			inset 0 2px 4px rgba(0, 0, 0, 0.1),
			0 0 0 3px rgba(100, 150, 220, 0.2);
	}

	input:disabled {
		opacity: 0.6;
	}

	button[type="submit"] {
		padding: 0.75rem 1.5rem;
		border: 2px solid #0a1018;
		border-radius: 4px;
		background: linear-gradient(180deg, #3a4a5a 0%, #2a3545 100%);
		color: #b8c8d8;
		text-shadow: 
			0 -1px 1px rgba(0, 0, 0, 0.5),
			0 1px 0 rgba(180, 200, 220, 0.1);
		font-family: "Libre Caslon Text", "Georgia", serif;
		font-size: 1rem;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
		box-shadow: 
			0 2px 4px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(100, 140, 180, 0.2);
	}

	button[type="submit"]:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 
			0 4px 8px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(100, 140, 180, 0.25);
		background: linear-gradient(180deg, #4a5a6a 0%, #3a4a5a 100%);
		color: #d0e0f0;
	}

	button[type="submit"]:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.success-message {
		color: #88ddaa;
		font-size: 1rem;
		text-align: center;
		padding: 1rem 0;
	}

	@media (max-width: 480px) {
		.modal {
			padding: 4.5rem 1.5rem 1.5rem;
		}

		.modal-content h2 {
			font-size: 1.3rem;
		}

		.waterfall-doodle {
			width: 80px;
			height: 56px;
			top: 6px;
		}
	}
</style>
