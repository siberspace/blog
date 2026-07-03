<script lang="ts">
	import { mapBackgroundSrc } from './assets';
	import { landmarks } from './landmarks';
</script>

{#if mapBackgroundSrc}
	<img
		src={mapBackgroundSrc}
		alt=""
		class="map-bg-img"
		width="320"
		height="180"
		decoding="async"
	/>
{:else}
	<svg
		class="map-bg-svg"
		viewBox="0 0 320 180"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		shape-rendering="crispEdges"
		preserveAspectRatio="xMidYMid slice"
	>
		<!-- Night sky -->
		<rect width="320" height="180" fill="#050510" />

		<!-- Soft nebula washes -->
		<ellipse cx="60" cy="40" rx="50" ry="30" fill="#0a1a28" opacity="0.8" />
		<ellipse cx="260" cy="50" rx="60" ry="35" fill="#0c1824" opacity="0.7" />
		<ellipse cx="160" cy="20" rx="80" ry="25" fill="#0a1420" opacity="0.6" />

		<!-- Stars (static positions; twinkle via CSS on .star) -->
		<g class="stars">
			<circle class="star" cx="20" cy="12" r="0.8" fill="#c8c8d0" style="--d: 0s" />
			<circle class="star" cx="45" cy="28" r="0.5" fill="#e0e0e8" style="--d: 0.4s" />
			<circle class="star" cx="78" cy="8" r="0.6" fill="#c8c8d0" style="--d: 1.1s" />
			<circle class="star" cx="110" cy="22" r="0.4" fill="#a0a0b0" style="--d: 0.7s" />
			<circle class="star" cx="140" cy="10" r="0.7" fill="#e0e0e8" style="--d: 1.8s" />
			<circle class="star" cx="175" cy="30" r="0.5" fill="#c8c8d0" style="--d: 0.2s" />
			<circle class="star" cx="200" cy="14" r="0.6" fill="#e0e0e8" style="--d: 1.4s" />
			<circle class="star" cx="230" cy="26" r="0.4" fill="#a0a0b0" style="--d: 0.9s" />
			<circle class="star" cx="255" cy="8" r="0.8" fill="#c8c8d0" style="--d: 2.1s" />
			<circle class="star" cx="280" cy="20" r="0.5" fill="#e0e0e8" style="--d: 0.5s" />
			<circle class="star" cx="300" cy="35" r="0.4" fill="#a0a0b0" style="--d: 1.6s" />
			<circle class="star" cx="35" cy="45" r="0.5" fill="#c8c8d0" style="--d: 1.2s" />
			<circle class="star" cx="95" cy="38" r="0.4" fill="#e0e0e8" style="--d: 0.3s" />
			<circle class="star" cx="290" cy="48" r="0.6" fill="#c8c8d0" style="--d: 1.9s" />
			<circle class="star" cx="160" cy="42" r="0.4" fill="#a0a0b0" style="--d: 0.8s" />
		</g>

		<!-- Small moon -->
		<g class="moon">
			<circle cx="280" cy="28" r="8" fill="#c8c8d0" opacity="0.9" />
			<circle cx="283" cy="26" r="6" fill="#050510" />
			<circle cx="276" cy="30" r="1.2" fill="#a0a0b0" opacity="0.4" />
			<circle cx="278" cy="24" r="0.8" fill="#a0a0b0" opacity="0.3" />
		</g>

		<!-- Drifting clouds -->
		<g class="clouds">
			<g class="cloud cloud--a">
				<rect x="30" y="50" width="24" height="4" fill="#1a2838" opacity="0.55" />
				<rect x="34" y="46" width="16" height="4" fill="#1a2838" opacity="0.55" />
				<rect x="38" y="54" width="12" height="3" fill="#1a2838" opacity="0.4" />
			</g>
			<g class="cloud cloud--b">
				<rect x="180" y="40" width="28" height="4" fill="#1a2838" opacity="0.5" />
				<rect x="186" y="36" width="16" height="4" fill="#1a2838" opacity="0.5" />
				<rect x="190" y="44" width="14" height="3" fill="#1a2838" opacity="0.35" />
			</g>
			<g class="cloud cloud--c">
				<rect x="100" y="55" width="20" height="3" fill="#1a2838" opacity="0.45" />
				<rect x="104" y="52" width="12" height="3" fill="#1a2838" opacity="0.45" />
			</g>
		</g>

		<!-- Terrain — dark teal/navy landmasses -->
		<!-- Far hills -->
		<path
			d="M0 100 L20 92 L40 96 L60 88 L90 94 L120 86 L150 92 L180 84 L210 90 L240 82 L270 88 L300 80 L320 86 L320 180 L0 180 Z"
			fill="#0a1620"
		/>
		<!-- Mid terrain -->
		<path
			d="M0 115 L25 108 L50 112 L80 104 L110 110 L145 102 L175 108 L210 100 L245 106 L280 98 L320 104 L320 180 L0 180 Z"
			fill="#0c1c28"
		/>
		<!-- Near ground -->
		<path
			d="M0 130 L30 124 L55 128 L90 120 L130 126 L165 118 L200 124 L240 116 L275 122 L320 118 L320 180 L0 180 Z"
			fill="#0e2230"
		/>
		<!-- Foreground earth -->
		<path
			d="M0 145 L40 140 L70 144 L110 136 L150 142 L190 134 L230 140 L270 132 L320 138 L320 180 L0 180 Z"
			fill="#102838"
		/>

		<!-- Terrain pixel detail (cream-tinted patches) -->
		<rect x="40" y="148" width="8" height="4" fill="#1a3a48" />
		<rect x="120" y="152" width="12" height="4" fill="#1a3a48" />
		<rect x="200" y="146" width="10" height="4" fill="#1a3a48" />
		<rect x="260" y="150" width="8" height="4" fill="#1a3a48" />
		<rect x="80" y="160" width="6" height="3" fill="#163040" />
		<rect x="180" y="158" width="10" height="3" fill="#163040" />

		<!-- Warm accent flowers / markers on terrain -->
		<rect x="55" y="142" width="2" height="2" fill="#e59d50" opacity="0.7" />
		<rect x="140" y="138" width="2" height="2" fill="#9ecf5a" opacity="0.7" />
		<rect x="220" y="144" width="2" height="2" fill="#e59d50" opacity="0.6" />
		<rect x="290" y="140" width="2" height="2" fill="#9d7bdd" opacity="0.6" />

		<!-- Winding path (cream linework) connecting landmark nodes -->
		{#if landmarks.length > 0}
			{@const pathPoints = landmarks.map((l) => ({
				x: (l.x / 100) * 320,
				y: (l.y / 100) * 180
			}))}
			<!-- Entry path from bottom-left toward first landmark -->
			<path
				d="M20 170
					Q 40 160, 55 150
					Q 70 140, 85 135
					Q 100 128, {(pathPoints[0]?.x ?? 134) - 20} {(pathPoints[0]?.y ?? 104) + 10}
					L {pathPoints[0]?.x ?? 134} {pathPoints[0]?.y ?? 104}"
				fill="none"
				stroke="#c8c8d0"
				stroke-width="3"
				stroke-linecap="square"
				stroke-linejoin="miter"
				opacity="0.55"
			/>
			<path
				d="M20 170
					Q 40 160, 55 150
					Q 70 140, 85 135
					Q 100 128, {(pathPoints[0]?.x ?? 134) - 20} {(pathPoints[0]?.y ?? 104) + 10}
					L {pathPoints[0]?.x ?? 134} {pathPoints[0]?.y ?? 104}"
				fill="none"
				stroke="#a09070"
				stroke-width="1"
				stroke-linecap="square"
				opacity="0.4"
			/>
			<!-- Path stubs toward future landmarks (decorative) -->
			<path
				d="M{pathPoints[0]?.x ?? 134} {pathPoints[0]?.y ?? 104}
					Q {(pathPoints[0]?.x ?? 134) + 40} {(pathPoints[0]?.y ?? 104) - 20},
					   {(pathPoints[0]?.x ?? 134) + 70} {(pathPoints[0]?.y ?? 104) - 10}"
				fill="none"
				stroke="#c8c8d0"
				stroke-width="2"
				stroke-dasharray="4 4"
				opacity="0.25"
			/>
			<path
				d="M{pathPoints[0]?.x ?? 134} {pathPoints[0]?.y ?? 104}
					Q {(pathPoints[0]?.x ?? 134) - 30} {(pathPoints[0]?.y ?? 104) - 30},
					   {(pathPoints[0]?.x ?? 134) - 50} {(pathPoints[0]?.y ?? 104) - 45}"
				fill="none"
				stroke="#c8c8d0"
				stroke-width="2"
				stroke-dasharray="4 4"
				opacity="0.2"
			/>
		{/if}
	</svg>
{/if}

<style>
	.map-bg-img,
	.map-bg-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
	}

	.map-bg-img {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	.star {
		animation: twinkle 3s ease-in-out infinite;
		animation-delay: var(--d, 0s);
	}

	.cloud--a {
		animation: drift 40s linear infinite;
	}

	.cloud--b {
		animation: drift 55s linear infinite reverse;
	}

	.cloud--c {
		animation: drift 48s linear infinite;
		animation-delay: -10s;
	}

	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.35;
		}
		50% {
			opacity: 1;
		}
	}

	@keyframes drift {
		0% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(12px);
		}
		100% {
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.star,
		.cloud--a,
		.cloud--b,
		.cloud--c {
			animation: none;
		}
	}
</style>
