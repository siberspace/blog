<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import type { StarPosition } from '$lib/utils/starfield';

	interface Props {
		stars?: StarPosition[];
		washColor?: { r: number; g: number; b: number };
		washImageUrl?: string;
		forceCSSFallback?: boolean;
	}

	let { stars = [], washColor = { r: 0.4, g: 0.3, b: 0.5 }, washImageUrl = '', forceCSSFallback = false }: Props = $props();

	let container: HTMLDivElement;
	let animationId: number;
	let renderer: THREE.WebGLRenderer | null = null;
	let uniforms: Record<string, { value: unknown }> | null = null;
	let starTexture: THREE.DataTexture | null = null;
	let useFallback = $state(false);
	
	// Performance settings
	let isMobile = false;
	let prefersReducedMotion = false;
	const MOBILE_BREAKPOINT = 768;
	const MOBILE_MAX_STARS = 50;
	const MOBILE_FRAME_INTERVAL = 1000 / 30; // 30fps on mobile
	
	// Color transition settings
	const COLOR_TRANSITION_SPEED = 0.02; // How fast colors blend (0-1 per frame)
	type ColorSet = { r: number; g: number; b: number }[];
	let targetColors: ColorSet = [];
	let currentColors: ColorSet = [
		{ r: 0.3, g: 0.25, b: 0.4 },
		{ r: 0.25, g: 0.3, b: 0.35 },
		{ r: 0.35, g: 0.2, b: 0.3 },
		{ r: 0.3, g: 0.35, b: 0.25 },
		{ r: 0.25, g: 0.25, b: 0.35 }
	];

	// Vertex shader
	const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		}
	`;

	// Fragment shader - rich nebula with varied gradients
	const fragmentShader = `
		precision highp float;
		
		varying vec2 vUv;
		
		uniform float uTime;
		uniform vec2 uResolution;
		uniform vec3 uWashColor1;  // Center
		uniform vec3 uWashColor2;  // Top-left
		uniform vec3 uWashColor3;  // Bottom-right
		uniform vec3 uWashColor4;  // Top-right
		uniform vec3 uWashColor5;  // Bottom-left
		uniform float uHasImageColors;
		uniform sampler2D uStarTexture;
		uniform float uStarCount;
		
		// Hash for randomization
		float hash(vec2 p) {
			return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
		}
		
		// Elliptical distance for organic shapes
		float ellipseDist(vec2 uv, vec2 center, vec2 radius) {
			vec2 d = (uv - center) / radius;
			return length(d);
		}
		
		void main() {
			vec2 uv = vUv;
			float t = uTime * 0.015;
			
			// === Layer 1: Deep space base with subtle variation ===
			vec3 spaceBlack = vec3(0.008, 0.01, 0.018);
			vec3 spaceDark = vec3(0.012, 0.016, 0.032);
			float baseGrad = uv.y * 0.5 + 0.25;
			// Add diagonal variation
			baseGrad += (uv.x * 0.15 - 0.075);
			vec3 color = mix(spaceBlack, spaceDark, baseGrad);
			
			// === Layer 2: Rich nebula with multiple organic regions ===
			if (uHasImageColors > 0.5) {
				vec3 nebula = vec3(0.0);
				
				// Region 1: Large primary glow (center-ish, elliptical)
				vec2 c1 = vec2(0.5 + sin(t * 0.7) * 0.06, 0.45 + cos(t * 0.5) * 0.05);
				vec2 r1 = vec2(0.55, 0.5);
				float d1 = ellipseDist(uv, c1, r1);
				float g1 = exp(-d1 * d1 * 2.0) * 0.5;
				nebula += uWashColor1 * g1;
				
				// Region 2: Top-left glow (distinct position)
				vec2 c2 = vec2(0.15 + sin(t * 0.4 + 1.0) * 0.06, 0.2 + cos(t * 0.6) * 0.05);
				vec2 r2 = vec2(0.45, 0.4);
				float d2 = ellipseDist(uv, c2, r2);
				float g2 = exp(-d2 * d2 * 2.5) * 0.5;
				nebula += uWashColor2 * g2;
				
				// Region 3: Bottom-right glow (distinct position)
				vec2 c3 = vec2(0.85 + sin(t * 0.5 + 2.5) * 0.04, 0.8 + cos(t * 0.4 + 1.0) * 0.04);
				vec2 r3 = vec2(0.4, 0.45);
				float d3 = ellipseDist(uv, c3, r3);
				float g3 = exp(-d3 * d3 * 2.5) * 0.45;
				nebula += uWashColor3 * g3;
				
				// Region 4: Top-right accent (distinct position)
				vec2 c4 = vec2(0.85 + sin(t * 0.6 + 3.5) * 0.04, 0.15 + cos(t * 0.5 + 2.0) * 0.04);
				vec2 r4 = vec2(0.4, 0.35);
				float d4 = ellipseDist(uv, c4, r4);
				float g4 = exp(-d4 * d4 * 2.8) * 0.45;
				nebula += uWashColor4 * g4;
				
				// Region 5: Bottom-left fill (distinct position)
				vec2 c5 = vec2(0.1 + sin(t * 0.35 + 4.5) * 0.04, 0.85 + cos(t * 0.45 + 3.0) * 0.04);
				vec2 r5 = vec2(0.45, 0.4);
				float d5 = ellipseDist(uv, c5, r5);
				float g5 = exp(-d5 * d5 * 2.5) * 0.4;
				nebula += uWashColor5 * g5;
				
				// Region 6: Very subtle center blend
				vec2 c6 = vec2(0.5 + sin(t * 0.2) * 0.08, 0.5 + cos(t * 0.25) * 0.06);
				float d6 = length(uv - c6);
				float g6 = exp(-d6 * d6 * 1.2) * 0.15;
				vec3 avgColor = (uWashColor1 + uWashColor2 + uWashColor3 + uWashColor4 + uWashColor5) / 5.0;
				nebula += avgColor * g6;
				
				// Screen blend for natural glow
				color = 1.0 - (1.0 - color) * (1.0 - nebula);
				
			} else {
				// Fallback: simple animated wash
				vec2 center = vec2(0.5 + sin(t * 2.0) * 0.1, 0.5 + cos(t * 1.4) * 0.1);
				float dist = length(uv - center);
				float glow = exp(-dist * dist * 2.5);
				vec3 wash = uWashColor1 * glow * 0.4;
				color = 1.0 - (1.0 - color) * (1.0 - wash);
			}
			
			// === Layer 3: Stars ===
			for (float i = 0.0; i < 256.0; i++) {
				if (i >= uStarCount) break;
				
				vec4 starData = texture2D(uStarTexture, vec2((i + 0.5) / 256.0, 0.5));
				vec2 starPos = starData.xy;
				float brightness = starData.z;
				float size = starData.w;
				
				if (brightness < 0.05) continue;
				
				float dist = length(uv - starPos);
				
				// Twinkle
				float phase = hash(starPos) * 6.283;
				float speed = 1.0 + hash(starPos + 0.5) * 2.0;
				float twinkle = sin(uTime * speed + phase) * 0.3 + 0.7;
				
				// Star glow (gaussian falloff)
				float starRadius = size * 0.006;
				float glow = exp(-dist * dist / (starRadius * starRadius * 6.0)) * 0.5;
				float core = exp(-dist * dist / (starRadius * starRadius * 0.4)) * 1.0;
				
				float starBrightness = (glow + core) * brightness * twinkle;
				
				// Color temperature variation
				vec3 starColor = mix(
					vec3(0.85, 0.92, 1.0),
					vec3(1.0, 0.95, 0.85),
					hash(starPos * 2.0)
				);
				
				color += starColor * starBrightness;
			}
			
			// === Layer 4: Vignette ===
			float vignette = 1.0 - smoothstep(0.3, 1.1, length(uv - 0.5) * 1.2);
			vignette = mix(0.55, 1.0, vignette);
			color *= vignette;
			
			gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
		}
	`;

	// Update star texture (respects mobile star limit)
	function updateStarTexture() {
		if (!starTexture || !uniforms) return;
		
		const data = starTexture.image.data as Float32Array;
		data.fill(0);
		
		// On mobile, limit to brightest stars only
		const maxStars = isMobile ? MOBILE_MAX_STARS : 256;
		const starsToRender = isMobile 
			? [...stars].sort((a, b) => b.brightness - a.brightness).slice(0, maxStars)
			: stars;
		
		starsToRender.forEach((star, i) => {
			if (i >= maxStars) return;
			const idx = i * 4;
			data[idx] = star.x / 100;
			data[idx + 1] = 1.0 - (star.y / 100);
			data[idx + 2] = star.brightness;
			data[idx + 3] = star.size / 3;
		});
		
		starTexture.needsUpdate = true;
		uniforms.uStarCount.value = Math.min(starsToRender.length, maxStars);
	}

	// Extract colors from image using canvas (CPU-side, no shader texture sampling)
	function extractColorsFromImage(url: string) {
		if (!uniforms || !url) {
			if (uniforms) uniforms.uHasImageColors.value = 0.0;
			return;
		}
		
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			// Create small canvas for color sampling
			const canvas = document.createElement('canvas');
			const size = 16; // Very small - we just want average colors
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext('2d');
			if (!ctx || !uniforms) return;
			
			ctx.drawImage(img, 0, 0, size, size);
			const imageData = ctx.getImageData(0, 0, size, size).data;
			
			// Sample colors from 5 different regions for varied nebula
			const regions = [
				{ x: 4, y: 4, w: 8, h: 8 },   // Center (primary)
				{ x: 0, y: 0, w: 7, h: 7 },   // Top-left
				{ x: 9, y: 9, w: 7, h: 7 },   // Bottom-right
				{ x: 9, y: 0, w: 7, h: 7 },   // Top-right
				{ x: 0, y: 9, w: 7, h: 7 },   // Bottom-left
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
			
			// Boost saturation of extracted colors for more vibrant nebula
			const boostSaturation = (c: { r: number; g: number; b: number }, factor: number) => {
				const luma = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
				return {
					r: Math.min(1, luma + (c.r - luma) * factor),
					g: Math.min(1, luma + (c.g - luma) * factor),
					b: Math.min(1, luma + (c.b - luma) * factor)
				};
			};
			
			// Set target colors for smooth transition (5 color regions) with saturation boost
			if (colors.length >= 5) {
				const boosted = colors.map(c => boostSaturation(c, 1.6));
				targetColors = boosted;
				if (uniforms) uniforms.uHasImageColors.value = 1.0;
			}
		};
		img.onerror = () => {
			if (uniforms) uniforms.uHasImageColors.value = 0.0;
		};
		img.src = url;
	}

	onMount(() => {
		// Detect device capabilities
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		
		// Use CSS fallback for reduced motion preference or forced fallback
		if (forceCSSFallback || prefersReducedMotion) {
			useFallback = true;
			return;
		}

		// Check WebGL
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
		
		// Mobile: pixel ratio 1, Desktop: up to 2
		const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		// Create star texture
		const starData = new Float32Array(256 * 4);
		starTexture = new THREE.DataTexture(starData, 256, 1, THREE.RGBAFormat, THREE.FloatType);
		starTexture.needsUpdate = true;

		// Create uniforms - 5 color regions for rich nebula
		uniforms = {
			uTime: { value: 0 },
			uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			uWashColor1: { value: new THREE.Vector3(washColor.r, washColor.g, washColor.b) },
			uWashColor2: { value: new THREE.Vector3(washColor.r * 0.9, washColor.g * 0.8, washColor.b * 1.1) },
			uWashColor3: { value: new THREE.Vector3(washColor.r * 0.7, washColor.g * 0.9, washColor.b * 0.8) },
			uWashColor4: { value: new THREE.Vector3(washColor.r * 1.1, washColor.g * 0.7, washColor.b * 0.9) },
			uWashColor5: { value: new THREE.Vector3(washColor.r * 0.8, washColor.g * 1.1, washColor.b * 0.7) },
			uHasImageColors: { value: 0.0 },
			uStarTexture: { value: starTexture },
			uStarCount: { value: 0 }
		};

		// Initial data
		updateStarTexture();
		if (washImageUrl) extractColorsFromImage(washImageUrl);

		// Create mesh
		const geometry = new THREE.PlaneGeometry(2, 2);
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			depthTest: false,
			depthWrite: false
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		// Resize handler (also updates mobile detection)
		const handleResize = () => {
			if (!renderer || !uniforms) return;
			const wasMobile = isMobile;
			isMobile = window.innerWidth < MOBILE_BREAKPOINT;
			
			// Update pixel ratio if mobile state changed
			if (wasMobile !== isMobile) {
				const newPixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
				renderer.setPixelRatio(newPixelRatio);
				updateStarTexture(); // Re-apply star limit
			}
			
			renderer.setSize(window.innerWidth, window.innerHeight);
			(uniforms.uResolution.value as THREE.Vector2).set(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);

		// Animation loop with mobile throttling
		const startTime = performance.now();
		let lastFrameTime = 0;
		
		const animate = (currentTime: number) => {
			animationId = requestAnimationFrame(animate);
			
			// Throttle to 30fps on mobile
			if (isMobile) {
				const elapsed = currentTime - lastFrameTime;
				if (elapsed < MOBILE_FRAME_INTERVAL) return;
				lastFrameTime = currentTime - (elapsed % MOBILE_FRAME_INTERVAL);
			}
			
			if (uniforms) {
				uniforms.uTime.value = (performance.now() - startTime) / 1000;
				
				// Smoothly interpolate colors toward targets
				if (targetColors.length === 5) {
					for (let i = 0; i < 5; i++) {
						currentColors[i].r += (targetColors[i].r - currentColors[i].r) * COLOR_TRANSITION_SPEED;
						currentColors[i].g += (targetColors[i].g - currentColors[i].g) * COLOR_TRANSITION_SPEED;
						currentColors[i].b += (targetColors[i].b - currentColors[i].b) * COLOR_TRANSITION_SPEED;
					}
					
					// Update uniforms with interpolated colors
					(uniforms.uWashColor1.value as THREE.Vector3).set(currentColors[0].r, currentColors[0].g, currentColors[0].b);
					(uniforms.uWashColor2.value as THREE.Vector3).set(currentColors[1].r, currentColors[1].g, currentColors[1].b);
					(uniforms.uWashColor3.value as THREE.Vector3).set(currentColors[2].r, currentColors[2].g, currentColors[2].b);
					(uniforms.uWashColor4.value as THREE.Vector3).set(currentColors[3].r, currentColors[3].g, currentColors[3].b);
					(uniforms.uWashColor5.value as THREE.Vector3).set(currentColors[4].r, currentColors[4].g, currentColors[4].b);
				}
			}
			renderer?.render(scene, camera);
		};
		animationId = requestAnimationFrame(animate);

		// Cleanup
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationId);
			renderer?.dispose();
			geometry.dispose();
			material.dispose();
			starTexture?.dispose();
			if (container && renderer?.domElement) {
				container.removeChild(renderer.domElement);
			}
		};
	});

	// React to stars prop changes
	$effect(() => {
		if (stars.length > 0) {
			updateStarTexture();
		}
	});

	// React to washImageUrl prop changes
	$effect(() => {
		if (washImageUrl !== undefined) {
			extractColorsFromImage(washImageUrl);
		}
	});

	// React to washColor prop changes (fallback when no image)
	$effect(() => {
		if (uniforms && washColor) {
			(uniforms.uWashColor1.value as THREE.Vector3).set(washColor.r, washColor.g, washColor.b);
		}
	});
</script>

<div class="cosmic-background" bind:this={container}>
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
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
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
