<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import type { StarPosition } from '$lib/utils/starfield';

	interface Props {
		stars?: StarPosition[];
		washColor?: { r: number; g: number; b: number };
		washImageUrl?: string;
		forceCSSFallback?: boolean;
		fixed?: boolean;
	}

	let { stars = [], washColor = { r: 0.4, g: 0.3, b: 0.5 }, washImageUrl = '', forceCSSFallback = false, fixed = false }: Props = $props();

	let container: HTMLDivElement;
	let animationId: number;
	let renderer: THREE.WebGLRenderer | null = null;
	let nebulaUniforms: Record<string, { value: unknown }> | null = null;
	let starUniforms: Record<string, { value: unknown }> | null = null;
	let starGeometry: THREE.BufferGeometry | null = null;
	let starPoints: THREE.Points | null = null;
	let useFallback = $state(false);
	
	// Performance settings
	let isMobile = false;
	let prefersReducedMotion = false;
	const MOBILE_BREAKPOINT = 768;
	const MOBILE_MAX_STARS = 80;
	const MOBILE_FRAME_INTERVAL = 1000 / 30; // 30fps on mobile
	
	// Color transition settings
	const COLOR_TRANSITION_SPEED = 0.02;
	type ColorSet = { r: number; g: number; b: number }[];
	let targetColors: ColorSet = [];
	let currentColors: ColorSet = [
		{ r: 0.3, g: 0.25, b: 0.4 },
		{ r: 0.25, g: 0.3, b: 0.35 },
		{ r: 0.35, g: 0.2, b: 0.3 },
		{ r: 0.3, g: 0.35, b: 0.25 },
		{ r: 0.25, g: 0.25, b: 0.35 }
	];

	// ===== NEBULA SHADERS (background pass) =====
	const nebulaVertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`;

	const nebulaFragmentShader = `
		precision highp float;
		
		varying vec2 vUv;
		
		uniform float uTime;
		uniform vec3 uWashColor1;
		uniform vec3 uWashColor2;
		uniform vec3 uWashColor3;
		uniform vec3 uWashColor4;
		uniform vec3 uWashColor5;
		uniform float uHasImageColors;
		
		float ellipseDist(vec2 uv, vec2 center, vec2 radius) {
			vec2 d = (uv - center) / radius;
			return length(d);
		}
		
		void main() {
			vec2 uv = vUv;
			float t = uTime * 0.015;
			
			// Deep space base
			vec3 spaceBlack = vec3(0.008, 0.01, 0.018);
			vec3 spaceDark = vec3(0.012, 0.016, 0.032);
			float baseGrad = uv.y * 0.5 + 0.25 + (uv.x * 0.15 - 0.075);
			vec3 color = mix(spaceBlack, spaceDark, baseGrad);
			
			// Nebula regions — vibrant clouds reflecting image colors
			if (uHasImageColors > 0.5) {
				vec3 nebula = vec3(0.0);
				
				// Primary cloud — large center bloom
				vec2 c1 = vec2(0.5 + sin(t * 0.7) * 0.06, 0.45 + cos(t * 0.5) * 0.05);
				nebula += uWashColor1 * exp(-pow(ellipseDist(uv, c1, vec2(0.55, 0.5)), 2.0) * 2.0) * 0.5;
				
				// Secondary cloud — upper left
				vec2 c2 = vec2(0.15 + sin(t * 0.4 + 1.0) * 0.06, 0.2 + cos(t * 0.6) * 0.05);
				nebula += uWashColor2 * exp(-pow(ellipseDist(uv, c2, vec2(0.45, 0.4)), 2.0) * 2.5) * 0.5;
				
				// Tertiary cloud — lower right
				vec2 c3 = vec2(0.85 + sin(t * 0.5 + 2.5) * 0.04, 0.8 + cos(t * 0.4 + 1.0) * 0.04);
				nebula += uWashColor3 * exp(-pow(ellipseDist(uv, c3, vec2(0.4, 0.45)), 2.0) * 2.5) * 0.45;
				
				// Wisp — upper right
				vec2 c4 = vec2(0.85 + sin(t * 0.6 + 3.5) * 0.04, 0.15 + cos(t * 0.5 + 2.0) * 0.04);
				nebula += uWashColor4 * exp(-pow(ellipseDist(uv, c4, vec2(0.4, 0.35)), 2.0) * 2.8) * 0.45;
				
				// Wisp — lower left
				vec2 c5 = vec2(0.1 + sin(t * 0.35 + 4.5) * 0.04, 0.85 + cos(t * 0.45 + 3.0) * 0.04);
				nebula += uWashColor5 * exp(-pow(ellipseDist(uv, c5, vec2(0.45, 0.4)), 2.0) * 2.5) * 0.4;
				
				// Diffuse center haze — ties the clouds together
				vec2 c6 = vec2(0.5 + sin(t * 0.2) * 0.08, 0.5 + cos(t * 0.25) * 0.06);
				vec3 avgColor = (uWashColor1 + uWashColor2 + uWashColor3 + uWashColor4 + uWashColor5) / 5.0;
				nebula += avgColor * exp(-pow(length(uv - c6), 2.0) * 1.2) * 0.15;
				
				// Screen blend — nebula lightens space
				color = 1.0 - (1.0 - color) * (1.0 - nebula);
			} else {
				// Fallback single wash
				vec2 center = vec2(0.5 + sin(t * 2.0) * 0.1, 0.5 + cos(t * 1.4) * 0.1);
				float glow = exp(-pow(length(uv - center), 2.0) * 2.5);
				vec3 wash = uWashColor1 * glow * 0.4;
				color = 1.0 - (1.0 - color) * (1.0 - wash);
			}
			
			// Vignette — soft darkening at edges
			float vignette = 1.0 - smoothstep(0.3, 1.1, length(uv - 0.5) * 1.2);
			color *= mix(0.55, 1.0, vignette);
			
			gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
		}
	`;

	// ===== STAR SHADERS (points pass) =====
	const starVertexShader = `
		attribute float aBrightness;
		attribute float aSize;
		attribute float aPhase;
		
		varying float vBrightness;
		varying float vPhase;
		
		uniform float uTime;
		uniform vec2 uResolution;
		uniform float uPixelRatio;
		
		void main() {
			vBrightness = aBrightness;
			vPhase = aPhase;
			
			// Position is in 0-1 normalized coords, convert to clip space
			vec2 pos = position.xy * 2.0 - 1.0;
			gl_Position = vec4(pos, 0.0, 1.0);
			
			// Dramatic size range:
			//   dim stars (brightness ~0.1): tiny 2px specks
			//   medium stars (brightness ~0.3): 4-5px dots
			//   bright stars (brightness ~0.7+): 12-24px with spike room
			float baseSize = 1.5 + pow(aBrightness, 0.6) * 22.0;
			gl_PointSize = clamp(baseSize, 2.0, 24.0) * uPixelRatio;
		}
	`;

	const starFragmentShader = `
		precision highp float;
		
		varying float vBrightness;
		varying float vPhase;
		
		uniform float uTime;
		
		void main() {
			vec2 coord = gl_PointCoord - 0.5;
			float dist = length(coord) * 2.0;
			
			// Core dot — all stars have this
			float core = exp(-dist * dist * 16.0);
			
			// Soft glow — scales with brightness
			float glow = exp(-dist * dist * 4.0) * 0.35 * vBrightness;
			
			// Diffraction spikes — only on bright stars (brightness > 0.4)
			float spikeMask = smoothstep(0.35, 0.7, vBrightness);
			float spikeIntensity = 0.0;
			if (spikeMask > 0.0) {
				float ax = abs(coord.x);
				float ay = abs(coord.y);
				// 4-point cross spikes
				float spikeH = exp(-ay * 80.0) * exp(-ax * 5.0);
				float spikeV = exp(-ax * 80.0) * exp(-ay * 5.0);
				spikeIntensity = (spikeH + spikeV) * spikeMask * 0.5;
			}
			
			float shape = core + glow + spikeIntensity;
			
			// Twinkle
			float twinkle = sin(uTime * (1.0 + vPhase * 1.2) + vPhase * 6.283) * 0.1 + 0.9;
			
			// Color temperature
			vec3 starColor = mix(
				vec3(0.85, 0.93, 1.0),
				vec3(1.0, 0.95, 0.88),
				vPhase
			);
			
			// Brightness: natural range — dim stars are subtle, bright stars pop
			float intensity = shape * (vBrightness * 1.2 + 0.15) * twinkle;
			
			if (intensity < 0.005) discard;
			
			gl_FragColor = vec4(starColor * intensity, 1.0);
		}
	`;

	// Update star geometry when stars change
	function updateStarGeometry() {
		if (!starGeometry) return;
		
		const maxStars = isMobile ? MOBILE_MAX_STARS : 200;
		const starsToRender = isMobile 
			? [...stars].sort((a, b) => b.brightness - a.brightness).slice(0, maxStars)
			: stars.slice(0, maxStars);
		
		const positions = new Float32Array(maxStars * 3);
		const brightnesses = new Float32Array(maxStars);
		const sizes = new Float32Array(maxStars);
		const phases = new Float32Array(maxStars);
		
		starsToRender.forEach((star, i) => {
			// Position in 0-1 range
			positions[i * 3] = star.x / 100;
			positions[i * 3 + 1] = 1.0 - (star.y / 100); // Flip Y
			positions[i * 3 + 2] = 0;
			
			brightnesses[i] = star.brightness;
			sizes[i] = star.size;
			phases[i] = Math.random(); // Random phase for twinkle
		});
		
		// Fill remaining with invisible stars
		for (let i = starsToRender.length; i < maxStars; i++) {
			positions[i * 3] = 0;
			positions[i * 3 + 1] = 0;
			positions[i * 3 + 2] = 0;
			brightnesses[i] = 0;
			sizes[i] = 0;
			phases[i] = 0;
		}
		
		starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		starGeometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightnesses, 1));
		starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
		starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
	}

	// Extract colors from image
	function extractColorsFromImage(url: string) {
		if (!nebulaUniforms || !url) {
			if (nebulaUniforms) nebulaUniforms.uHasImageColors.value = 0.0;
			return;
		}
		
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const size = 16;
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx || !nebulaUniforms) return;
			
			ctx.drawImage(img, 0, 0, size, size);
			const imageData = ctx.getImageData(0, 0, size, size).data;
			
			const regions = [
				{ x: 4, y: 4, w: 8, h: 8 },
				{ x: 0, y: 0, w: 7, h: 7 },
				{ x: 9, y: 9, w: 7, h: 7 },
				{ x: 9, y: 0, w: 7, h: 7 },
				{ x: 0, y: 9, w: 7, h: 7 },
			];
			
			const colors: { r: number; g: number; b: number }[] = [];
			
			for (const region of regions) {
				let r = 0, g = 0, b = 0, count = 0;
				for (let y = region.y; y < region.y + region.h && y < size; y++) {
					for (let x = region.x; x < region.x + region.w && x < size; x++) {
						const idx = (y * size + x) * 4;
						r += imageData[idx];
						g += imageData[idx + 1];
						b += imageData[idx + 2];
						count++;
					}
				}
				if (count > 0) {
					colors.push({
						r: (r / count) / 255,
						g: (g / count) / 255,
						b: (b / count) / 255
					});
				}
			}
			
			const boostSaturation = (c: { r: number; g: number; b: number }, factor: number) => {
				const luma = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
				return {
					r: Math.min(1, luma + (c.r - luma) * factor),
					g: Math.min(1, luma + (c.g - luma) * factor),
					b: Math.min(1, luma + (c.b - luma) * factor)
				};
			};
			
			if (colors.length >= 5) {
				const boosted = colors.map(c => boostSaturation(c, 1.6));
				targetColors = boosted;
				if (nebulaUniforms) nebulaUniforms.uHasImageColors.value = 1.0;
			}
		};
		img.onerror = () => {
			if (nebulaUniforms) nebulaUniforms.uHasImageColors.value = 0.0;
		};
		img.src = url;
	}

	onMount(() => {
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		
		if (forceCSSFallback || prefersReducedMotion) {
			useFallback = true;
			return;
		}

		const testCanvas = document.createElement('canvas');
		const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
		if (!gl) {
			useFallback = true;
			return;
		}

		// Setup Three.js
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		renderer = new THREE.WebGLRenderer({ 
			antialias: false,
			alpha: false,
			powerPreference: isMobile ? 'low-power' : 'high-performance'
		});
		renderer.setClearColor(0x020208, 1); // Dark space color to prevent white flash
		
		const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		// ===== Pass 1: Nebula background =====
		nebulaUniforms = {
			uTime: { value: 0 },
			uWashColor1: { value: new THREE.Vector3(washColor.r, washColor.g, washColor.b) },
			uWashColor2: { value: new THREE.Vector3(washColor.r * 0.9, washColor.g * 0.8, washColor.b * 1.1) },
			uWashColor3: { value: new THREE.Vector3(washColor.r * 0.7, washColor.g * 0.9, washColor.b * 0.8) },
			uWashColor4: { value: new THREE.Vector3(washColor.r * 1.1, washColor.g * 0.7, washColor.b * 0.9) },
			uWashColor5: { value: new THREE.Vector3(washColor.r * 0.8, washColor.g * 1.1, washColor.b * 0.7) },
			uHasImageColors: { value: 0.0 }
		};

		const nebulaGeometry = new THREE.PlaneGeometry(2, 2);
		const nebulaMaterial = new THREE.ShaderMaterial({
			vertexShader: nebulaVertexShader,
			fragmentShader: nebulaFragmentShader,
			uniforms: nebulaUniforms,
			depthTest: false,
			depthWrite: false
		});
		const nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
		nebulaMesh.renderOrder = 0;
		scene.add(nebulaMesh);

		// ===== Pass 2: Stars as points =====
		const maxStars = isMobile ? MOBILE_MAX_STARS : 200;
		starGeometry = new THREE.BufferGeometry();
		
		// Initialize with empty data
		starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxStars * 3), 3));
		starGeometry.setAttribute('aBrightness', new THREE.BufferAttribute(new Float32Array(maxStars), 1));
		starGeometry.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(maxStars), 1));
		starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(maxStars), 1));

		starUniforms = {
			uTime: { value: 0 },
			uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			uPixelRatio: { value: pixelRatio }
		};

		const starMaterial = new THREE.ShaderMaterial({
			vertexShader: starVertexShader,
			fragmentShader: starFragmentShader,
			uniforms: starUniforms,
			transparent: true,
			blending: THREE.CustomBlending,
			blendSrc: THREE.OneFactor,
			blendDst: THREE.OneFactor,
			blendEquation: THREE.AddEquation,
			depthTest: false,
			depthWrite: false
		});

		starPoints = new THREE.Points(starGeometry, starMaterial);
		starPoints.renderOrder = 1;
		scene.add(starPoints);

		// Initial data
		updateStarGeometry();
		if (washImageUrl) extractColorsFromImage(washImageUrl);

		// Resize handler - update size and render immediately to prevent flashing
		let resizeTimeout: number;
		let justResized = false;
		let lastWidth = window.innerWidth;
		
		const handleResize = () => {
			if (!renderer || !starUniforms) return;
			
			const newWidth = window.innerWidth;
			
			// On mobile, ignore height-only changes (caused by browser chrome
			// hiding/showing during scroll — resizing the canvas causes a jump)
			if (isMobile && newWidth === lastWidth) return;
			lastWidth = newWidth;
			
			// Update size and render immediately to prevent blank frame
			renderer.setSize(window.innerWidth, window.innerHeight);
			(starUniforms.uResolution.value as THREE.Vector2).set(window.innerWidth, window.innerHeight);
			renderer.render(scene, camera);
			justResized = true;
			
			// Debounce expensive operations
			clearTimeout(resizeTimeout);
			resizeTimeout = window.setTimeout(() => {
				if (!renderer) return;
				
				// Check for mobile breakpoint change
				const wasMobile = isMobile;
				isMobile = window.innerWidth < MOBILE_BREAKPOINT;
				
				if (wasMobile !== isMobile) {
					const newPixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
					renderer.setPixelRatio(newPixelRatio);
					renderer.setSize(window.innerWidth, window.innerHeight);
					if (starUniforms) {
						(starUniforms.uPixelRatio.value as number) = newPixelRatio;
					}
					updateStarGeometry();
				}
			}, 150);
		};
		window.addEventListener('resize', handleResize);

		// Visibility tracking — pause rendering when off-screen
		let isVisible = true;
		const observer = new IntersectionObserver(
			(entries) => {
				isVisible = entries[0].isIntersecting;
				// Resume animation loop when becoming visible again
				if (isVisible && animationId === 0) {
					animationId = requestAnimationFrame(animate);
				}
			},
			{ threshold: 0 }
		);
		observer.observe(container);

		// Animation loop
		const startTime = performance.now();
		let lastFrameTime = 0;
		
		const animate = (currentTime: number) => {
			// Stop the loop entirely when not visible (saves GPU + CPU)
			if (!isVisible) {
				animationId = 0;
				return;
			}
			
			animationId = requestAnimationFrame(animate);
			
			// Skip if we just rendered from resize handler
			if (justResized) {
				justResized = false;
				return;
			}
			
			if (isMobile) {
				const elapsed = currentTime - lastFrameTime;
				if (elapsed < MOBILE_FRAME_INTERVAL) return;
				lastFrameTime = currentTime - (elapsed % MOBILE_FRAME_INTERVAL);
			}
			
			const time = (performance.now() - startTime) / 1000;
			
			if (nebulaUniforms) {
				nebulaUniforms.uTime.value = time;
				
				// Smooth color transition
				if (targetColors.length === 5) {
					for (let i = 0; i < 5; i++) {
						currentColors[i].r += (targetColors[i].r - currentColors[i].r) * COLOR_TRANSITION_SPEED;
						currentColors[i].g += (targetColors[i].g - currentColors[i].g) * COLOR_TRANSITION_SPEED;
						currentColors[i].b += (targetColors[i].b - currentColors[i].b) * COLOR_TRANSITION_SPEED;
					}
					
					(nebulaUniforms.uWashColor1.value as THREE.Vector3).set(currentColors[0].r, currentColors[0].g, currentColors[0].b);
					(nebulaUniforms.uWashColor2.value as THREE.Vector3).set(currentColors[1].r, currentColors[1].g, currentColors[1].b);
					(nebulaUniforms.uWashColor3.value as THREE.Vector3).set(currentColors[2].r, currentColors[2].g, currentColors[2].b);
					(nebulaUniforms.uWashColor4.value as THREE.Vector3).set(currentColors[3].r, currentColors[3].g, currentColors[3].b);
					(nebulaUniforms.uWashColor5.value as THREE.Vector3).set(currentColors[4].r, currentColors[4].g, currentColors[4].b);
				}
			}
			
			if (starUniforms) {
				starUniforms.uTime.value = time;
			}
			
			renderer?.render(scene, camera);
		};
		animationId = requestAnimationFrame(animate);

		// Cleanup
		return () => {
			observer.disconnect();
			clearTimeout(resizeTimeout);
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationId);
			renderer?.dispose();
			nebulaGeometry.dispose();
			nebulaMaterial.dispose();
			starGeometry?.dispose();
			starMaterial.dispose();
			if (container && renderer?.domElement) {
				container.removeChild(renderer.domElement);
			}
		};
	});

	// React to stars prop changes
	$effect(() => {
		if (stars.length > 0) {
			updateStarGeometry();
		}
	});

	// React to washImageUrl prop changes
	$effect(() => {
		if (washImageUrl !== undefined) {
			extractColorsFromImage(washImageUrl);
		}
	});

	// React to washColor prop changes
	$effect(() => {
		if (nebulaUniforms && washColor) {
			(nebulaUniforms.uWashColor1.value as THREE.Vector3).set(washColor.r, washColor.g, washColor.b);
		}
	});
</script>

<div class="cosmic-background" class:cosmic-background--fixed={fixed} bind:this={container}>
	{#if useFallback}
		<div class="fallback-bg">
			<div 
				class="fallback-wash" 
				style="--wash-r: {washColor.r}; --wash-g: {washColor.g}; --wash-b: {washColor.b};"
			></div>
			<div class="fallback-stars"></div>
			<div class="fallback-vignette"></div>
		</div>
	{/if}
</div>

<style>
	.cosmic-background {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		/* Immediate dark sky while WebGL initializes */
		background: radial-gradient(ellipse at 20% 20%, #0a0a15 0%, #050510 50%, #020208 100%);
	}

	.cosmic-background--fixed {
		position: fixed;
	}

	.cosmic-background :global(canvas) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.fallback-bg {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 20% 20%, #0a0a15 0%, #050510 50%, #020208 100%);
	}

	.fallback-wash {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at 50% 45%,
			rgba(
				calc(var(--wash-r, 0.4) * 255),
				calc(var(--wash-g, 0.3) * 255),
				calc(var(--wash-b, 0.5) * 255),
				0.3
			) 0%,
			transparent 60%
		);
		mix-blend-mode: screen;
	}

	.fallback-stars {
		position: absolute;
		inset: 0;
		background-image: 
			radial-gradient(2px 2px at 15% 20%, rgba(255, 255, 255, 0.9) 0%, transparent 100%),
			radial-gradient(1.5px 1.5px at 85% 15%, rgba(255, 255, 255, 0.7) 0%, transparent 100%),
			radial-gradient(2.5px 2.5px at 45% 75%, rgba(255, 255, 255, 0.95) 0%, transparent 100%),
			radial-gradient(1px 1px at 70% 40%, rgba(255, 255, 255, 0.5) 0%, transparent 100%),
			radial-gradient(1.5px 1.5px at 25% 60%, rgba(255, 255, 255, 0.6) 0%, transparent 100%),
			radial-gradient(2px 2px at 90% 70%, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
			radial-gradient(1px 1px at 10% 85%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
			radial-gradient(1.5px 1.5px at 55% 25%, rgba(255, 255, 255, 0.65) 0%, transparent 100%),
			radial-gradient(2px 2px at 35% 90%, rgba(255, 255, 255, 0.75) 0%, transparent 100%),
			radial-gradient(1px 1px at 80% 55%, rgba(255, 255, 255, 0.55) 0%, transparent 100%);
	}

	.fallback-vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 0%,
			transparent 50%,
			rgba(0, 0, 0, 0.4) 100%
		);
	}
</style>
