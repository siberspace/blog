import { VIRTUAL_H, VIRTUAL_W } from './palette';
import {
	blit,
	blitMountainProfile,
	blitSteppedPath,
	bufToImageData,
	createBuf,
	ditherMist,
	ditherRect,
	fillRect,
	type PixelBuf
} from './pixel';
import {
	OBSERVATORY,
	PRINT_PRESS,
	SALAMANDER,
	SALAMANDER_BLINK,
	TOWN
} from './sprites';
import { ISLANDS, SPRITE_ORIGIN, WATER_TOP } from './positions';

function drawSky(buf: PixelBuf): void {
	fillRect(buf, 0, 0, VIRTUAL_W, 28, 2);
	fillRect(buf, 0, 28, VIRTUAL_W, 22, 3);
	fillRect(buf, 0, 50, VIRTUAL_W, 18, 4);
	fillRect(buf, 0, 68, VIRTUAL_W, WATER_TOP - 68, 8);
}

function drawStars(buf: PixelBuf, t: number, reducedMotion: boolean): void {
	const stars: [number, number][] = [
		[12, 8],
		[28, 18],
		[44, 6],
		[60, 22],
		[78, 11],
		[95, 19],
		[112, 7],
		[130, 24],
		[148, 10],
		[165, 16],
		[182, 5],
		[200, 20],
		[218, 9],
		[235, 15],
		[252, 6],
		[268, 22],
		[285, 12],
		[302, 18],
		[38, 32],
		[88, 28],
		[155, 30],
		[210, 28],
		[275, 30]
	];
	for (let i = 0; i < stars.length; i++) {
		const [x, y] = stars[i];
		if (!reducedMotion && ((t / 400 + i) | 0) % 5 === 0) continue;
		if (x >= 0 && x < VIRTUAL_W && y >= 0 && y < VIRTUAL_H) {
			buf[y * VIRTUAL_W + x] = 12;
		}
	}
}

function drawMoon(buf: PixelBuf): void {
	const ox = 278;
	const oy = 14;
	const disc = [
		'001111100',
		'011111110',
		'111111111',
		'111111111',
		'111111111',
		'011111110',
		'001111100'
	];
	const cut = [
		'000011100',
		'000111110',
		'001111111',
		'001111111',
		'001111111',
		'000111110',
		'000011100'
	];
	for (let y = 0; y < disc.length; y++) {
		for (let x = 0; x < disc[y].length; x++) {
			if (disc[y][x] === '1' && cut[y][x] !== '1') {
				const px = ox + x;
				const py = oy + y;
				if (px < VIRTUAL_W && py < VIRTUAL_H) buf[py * VIRTUAL_W + px] = 13;
			}
		}
	}
}

function drawShootingStars(buf: PixelBuf, t: number, reducedMotion: boolean): void {
	if (reducedMotion) return;
	const streaks = [
		{ x0: 40, y0: 20, len: 8, period: 6000, phase: 0 },
		{ x0: 200, y0: 12, len: 6, period: 9000, phase: 3000 }
	];
	for (const s of streaks) {
		const local = (t + s.phase) % s.period;
		if (local > 400) continue;
		const progress = local / 400;
		const headX = (s.x0 + progress * 40) | 0;
		const headY = (s.y0 + progress * 12) | 0;
		for (let i = 0; i < s.len; i++) {
			const px = headX - i;
			const py = headY - Math.floor(i / 2);
			if (px >= 0 && px < VIRTUAL_W && py >= 0 && py < VIRTUAL_H) {
				buf[py * VIRTUAL_W + px] = i < 2 ? 12 : 4;
			}
		}
	}
}

/** Distant hazy ridge behind mist. */
function drawBackgroundRidge(buf: PixelBuf): void {
	const far: number[] = [];
	let h = 5;
	for (let x = 0; x < VIRTUAL_W; x++) {
		const n = (x * 13 + (x >> 3) * 5) % 9;
		if (n < 2) h = Math.min(12, h + 1);
		else if (n > 6) h = Math.max(3, h - 1);
		far.push(h);
	}
	blitMountainProfile(buf, 0, WATER_TOP - 6, far, 8);
}

function drawWater(buf: PixelBuf, t: number, reducedMotion: boolean): void {
	const phase = reducedMotion ? 0 : ((t / 800) | 0) & 1;
	ditherRect(buf, 0, WATER_TOP, VIRTUAL_W, VIRTUAL_H - WATER_TOP, 5, 6, phase);

	// SMW-style wave chevrons (stepped "v" marks)
	const waveY0 = WATER_TOP + 8;
	for (let y = waveY0; y < VIRTUAL_H; y += 6) {
		for (let x = 2 + ((y + phase) & 1) * 2; x < VIRTUAL_W - 2; x += 8) {
			const py = y + ((x >> 3) & 1);
			if (py >= VIRTUAL_H) continue;
			buf[py * VIRTUAL_W + x] = 7;
			if (x + 1 < VIRTUAL_W) buf[py * VIRTUAL_W + x + 1] = 7;
			if (py + 1 < VIRTUAL_H) {
				buf[(py + 1) * VIRTUAL_W + x - 1] = 7;
				buf[(py + 1) * VIRTUAL_W + x + 2] = 7;
			}
		}
	}
}

/**
 * SMW-style plateau island: flat grass top, beveled rim, banded cliff face.
 * Stepped sides so the landmass reads as a raised block above open water.
 */
function drawPlateauIsland(
	buf: PixelBuf,
	x0: number,
	x1: number,
	topY: number,
	cliffH: number
): void {
	const width = x1 - x0;
	const inset = 3; // beveled edge steps

	// --- Grass top (flat plateau) ---
	for (let x = x0; x < x1; x++) {
		// Top highlight row
		if (topY - 1 >= 0) buf[(topY - 1) * VIRTUAL_W + x] = 23;
		buf[topY * VIRTUAL_W + x] = 21;
		// Slight shade near edges
		if (x < x0 + 2 || x >= x1 - 2) buf[topY * VIRTUAL_W + x] = 22;
	}
	// Inner grass fill (2–3 rows of plateau surface)
	for (let dy = 1; dy <= 2; dy++) {
		for (let x = x0 + 1; x < x1 - 1; x++) {
			buf[(topY + dy) * VIRTUAL_W + x] = dy === 1 ? 21 : 22;
		}
	}

	// --- Cliff face with horizontal banding ---
	const cliffTop = topY + 3;
	const cliffBottom = topY + cliffH;
	for (let y = cliffTop; y < cliffBottom; y++) {
		// Step the sides inward slightly toward the bottom (buttress)
		const progress = (y - cliffTop) / Math.max(1, cliffH - 3);
		const sideIn = Math.min(inset, Math.floor(progress * inset));
		const left = x0 + sideIn;
		const right = x1 - sideIn;
		// Band color alternates for SMW cliff stripes
		const band = Math.floor((y - cliffTop) / 3) % 2 === 0 ? 19 : 18;
		for (let x = left; x < right; x++) {
			buf[y * VIRTUAL_W + x] = band;
		}
		// Left/right rim
		if (left < VIRTUAL_W) buf[y * VIRTUAL_W + left] = 20;
		if (right - 1 >= 0) buf[y * VIRTUAL_W + (right - 1)] = 18;
	}

	// Bottom lip into water
	const lipY = cliffBottom;
	if (lipY < VIRTUAL_H) {
		for (let x = x0 + inset; x < x1 - inset; x++) {
			buf[lipY * VIRTUAL_W + x] = 18;
			if (lipY + 1 < VIRTUAL_H) buf[(lipY + 1) * VIRTUAL_W + x] = 18;
		}
	}

	// Tiny decorative peak behind plateau (optional depth, not under buildings)
	const peakW = Math.min(12, Math.floor(width / 4));
	const peakX = x0 + 2;
	const peakHeights: number[] = [];
	for (let i = 0; i < peakW; i++) {
		const t = 1 - Math.abs(i - peakW / 2) / (peakW / 2);
		peakHeights.push(Math.max(1, Math.round(6 * t)));
	}
	blitMountainProfile(buf, peakX, topY - 1, peakHeights, 9, 11);
}

function drawIslands(buf: PixelBuf): void {
	const { observatory, town, printpress } = ISLANDS;
	drawPlateauIsland(buf, observatory.x0, observatory.x1, observatory.topY, observatory.cliffH);
	drawPlateauIsland(buf, town.x0, town.x1, town.topY, town.cliffH);
	drawPlateauIsland(buf, printpress.x0, printpress.x1, printpress.topY, printpress.cliffH);
}

function drawCauseways(buf: PixelBuf): void {
	// Short bridges just above water, spanning open gaps only
	const y1 = WATER_TOP + 4;
	// Observatory → town
	blitSteppedPath(buf, ISLANDS.observatory.x1 + 1, y1 + 8, ISLANDS.town.x0 - 1, y1 + 6, 20);
	fillRect(buf, 78, y1 + 5, 1, 3, 20);
	fillRect(buf, 98, y1 + 5, 1, 3, 20);
	// Town → print press
	blitSteppedPath(buf, ISLANDS.town.x1 + 1, y1 + 6, ISLANDS.printpress.x0 - 1, y1 + 8, 20);
	fillRect(buf, 226, y1 + 5, 1, 3, 20);
	fillRect(buf, 244, y1 + 5, 1, 3, 20);
}

function drawBuildings(buf: PixelBuf): void {
	// Drawn after islands so feet sit on grass tops
	blit(buf, OBSERVATORY, SPRITE_ORIGIN.observatory.x, SPRITE_ORIGIN.observatory.y);
	blit(buf, TOWN, SPRITE_ORIGIN.town.x, SPRITE_ORIGIN.town.y);
	blit(buf, PRINT_PRESS, SPRITE_ORIGIN.printpress.x, SPRITE_ORIGIN.printpress.y);
}

function drawMist(buf: PixelBuf, t: number, reducedMotion: boolean, band: 'back' | 'front'): void {
	const drift = reducedMotion ? 0 : ((t / 120) | 0) % VIRTUAL_W;
	if (band === 'back') {
		ditherMist(buf, 0, WATER_TOP - 14, VIRTUAL_W, 10, 4, 8, 5, drift);
		ditherMist(buf, 0, WATER_TOP - 6, VIRTUAL_W, 6, 3, 4, 4, (drift * 2) % VIRTUAL_W);
	} else {
		// Mist only in open-water gaps
		ditherMist(buf, 62, WATER_TOP + 2, 56, 8, 4, 8, 3, (drift * 3) % VIRTUAL_W);
		ditherMist(buf, 214, WATER_TOP + 2, 44, 8, 4, 8, 3, (drift * 3) % VIRTUAL_W);
	}
}

function drawSalamander(buf: PixelBuf, t: number, reducedMotion: boolean): void {
	const bob = reducedMotion ? 0 : ((t / 600) | 0) % 2 === 0 ? 0 : 1;
	const blinkCycle = ((t / 100) | 0) % 50;
	const blinking = !reducedMotion && blinkCycle >= 47;
	const sprite = blinking ? SALAMANDER_BLINK : SALAMANDER;
	const ox = SPRITE_ORIGIN.salamander.x;
	const oy = SPRITE_ORIGIN.salamander.y + bob;
	blit(buf, sprite, ox, oy);

	// Waterline overlap on lower head
	const phase = reducedMotion ? 0 : ((t / 800) | 0) & 1;
	const waterRows = 4;
	const spriteH = sprite.length;
	const overlapTop = oy + spriteH - waterRows;
	for (let py = overlapTop; py < oy + spriteH + 2; py++) {
		if (py < WATER_TOP || py >= VIRTUAL_H) continue;
		for (let px = ox; px < ox + (sprite[0]?.length ?? 0); px++) {
			if (px < 0 || px >= VIRTUAL_W) continue;
			buf[py * VIRTUAL_W + px] = ((px + py + phase) & 1) === 0 ? 5 : 6;
		}
	}

	if (reducedMotion) return;
	const rippleT = ((t / 80) | 0) % 28;
	const cx = ox + 8;
	const cy = oy + spriteH - 2;
	for (const ring of [
		{ r: rippleT, color: 7, step: 1 },
		{ r: rippleT - 9, color: 6, step: 2 },
		{ r: rippleT - 18, color: 5, step: 3 }
	]) {
		if (ring.r < 3 || ring.r > 16) continue;
		drawPixelRing(buf, cx, cy, ring.r, ring.color, ring.step);
	}
}

function drawPixelRing(
	buf: PixelBuf,
	cx: number,
	cy: number,
	r: number,
	color: number,
	step: number
): void {
	for (let dx = -r; dx <= r; dx++) {
		if (step > 1 && Math.abs(dx) % step !== 0) continue;
		const dy = r - Math.abs(dx);
		for (const sy of [-1, 1]) {
			const px = cx + dx;
			const py = cy + dy * sy;
			if (px >= 0 && px < VIRTUAL_W && py >= WATER_TOP && py < VIRTUAL_H) {
				buf[py * VIRTUAL_W + px] = color;
			}
		}
	}
}

/** Render one frame into an existing ImageData (VIRTUAL_W × VIRTUAL_H). */
export function renderScene(
	imageData: ImageData,
	t: number,
	reducedMotion: boolean
): void {
	const buf = createBuf();
	drawSky(buf);
	drawStars(buf, t, reducedMotion);
	drawMoon(buf);
	drawShootingStars(buf, t, reducedMotion);
	drawBackgroundRidge(buf);
	drawMist(buf, t, reducedMotion, 'back');
	drawWater(buf, t, reducedMotion);
	drawIslands(buf);
	drawCauseways(buf);
	drawBuildings(buf);
	drawMist(buf, t, reducedMotion, 'front');
	drawSalamander(buf, t, reducedMotion);
	bufToImageData(buf, imageData);
}
