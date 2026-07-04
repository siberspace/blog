import { PALETTE_RGBA, VIRTUAL_H, VIRTUAL_W } from './palette';

/** Palette-index buffer: 0 = transparent. */
export type PixelBuf = Uint8Array;

export function createBuf(): PixelBuf {
	return new Uint8Array(VIRTUAL_W * VIRTUAL_H);
}

export function fillRect(
	buf: PixelBuf,
	x: number,
	y: number,
	w: number,
	h: number,
	color: number
): void {
	const x0 = Math.max(0, x | 0);
	const y0 = Math.max(0, y | 0);
	const x1 = Math.min(VIRTUAL_W, (x + w) | 0);
	const y1 = Math.min(VIRTUAL_H, (y + h) | 0);
	for (let py = y0; py < y1; py++) {
		const row = py * VIRTUAL_W;
		for (let px = x0; px < x1; px++) {
			buf[row + px] = color;
		}
	}
}

/** Bayer 2×2 ordered dither between two palette colors. */
export function ditherRect(
	buf: PixelBuf,
	x: number,
	y: number,
	w: number,
	h: number,
	c0: number,
	c1: number,
	phase = 0
): void {
	const x0 = Math.max(0, x | 0);
	const y0 = Math.max(0, y | 0);
	const x1 = Math.min(VIRTUAL_W, (x + w) | 0);
	const y1 = Math.min(VIRTUAL_H, (y + h) | 0);
	for (let py = y0; py < y1; py++) {
		const row = py * VIRTUAL_W;
		for (let px = x0; px < x1; px++) {
			buf[row + px] = ((px + py + phase) & 1) === 0 ? c0 : c1;
		}
	}
}

/** Bayer 4×4 for softer mist bands (still hard pixels). */
const BAYER4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5]
];

export function ditherMist(
	buf: PixelBuf,
	x: number,
	y: number,
	w: number,
	h: number,
	c0: number,
	c1: number,
	threshold: number,
	phaseX = 0
): void {
	const x0 = Math.max(0, x | 0);
	const y0 = Math.max(0, y | 0);
	const x1 = Math.min(VIRTUAL_W, (x + w) | 0);
	const y1 = Math.min(VIRTUAL_H, (y + h) | 0);
	for (let py = y0; py < y1; py++) {
		const row = py * VIRTUAL_W;
		for (let px = x0; px < x1; px++) {
			const bx = (px + phaseX) & 3;
			const by = py & 3;
			if (BAYER4[by][bx] < threshold) {
				buf[row + px] = ((px + py) & 1) === 0 ? c0 : c1;
			}
		}
	}
}

/** Blit a sprite (rows of palette indices; 0 = skip). */
export function blit(
	buf: PixelBuf,
	sprite: readonly (readonly number[])[],
	ox: number,
	oy: number
): void {
	for (let sy = 0; sy < sprite.length; sy++) {
		const row = sprite[sy];
		const py = oy + sy;
		if (py < 0 || py >= VIRTUAL_H) continue;
		const destRow = py * VIRTUAL_W;
		for (let sx = 0; sx < row.length; sx++) {
			const c = row[sx];
			if (!c) continue;
			const px = ox + sx;
			if (px < 0 || px >= VIRTUAL_W) continue;
			buf[destRow + px] = c;
		}
	}
}

/** Stepped mountain silhouette from a height profile (one height per column). */
export function blitMountainProfile(
	buf: PixelBuf,
	ox: number,
	baseY: number,
	heights: readonly number[],
	color: number,
	rimColor?: number
): void {
	for (let i = 0; i < heights.length; i++) {
		const h = heights[i];
		const px = ox + i;
		if (px < 0 || px >= VIRTUAL_W) continue;
		for (let dy = 0; dy < h; dy++) {
			const py = baseY - dy;
			if (py < 0 || py >= VIRTUAL_H) continue;
			const c = rimColor !== undefined && dy === h - 1 ? rimColor : color;
			buf[py * VIRTUAL_W + px] = c;
		}
	}
}

/** Stepped causeway / rope-bridge between two points (Bresenham-ish, 2px thick). */
export function blitSteppedPath(
	buf: PixelBuf,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	color: number
): void {
	let x = x0 | 0;
	let y = y0 | 0;
	const dx = Math.abs((x1 | 0) - x);
	const dy = Math.abs((y1 | 0) - y);
	const sx = x < x1 ? 1 : -1;
	const sy = y < y1 ? 1 : -1;
	let err = dx - dy;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (x >= 0 && x < VIRTUAL_W && y >= 0 && y < VIRTUAL_H) {
			buf[y * VIRTUAL_W + x] = color;
			if (y + 1 < VIRTUAL_H) buf[(y + 1) * VIRTUAL_W + x] = color;
		}
		if (x === (x1 | 0) && y === (y1 | 0)) break;
		const e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			x += sx;
		}
		if (e2 < dx) {
			err += dx;
			y += sy;
		}
	}
}

export function bufToImageData(buf: PixelBuf, imageData: ImageData): void {
	const data = imageData.data;
	for (let i = 0; i < buf.length; i++) {
		const rgba = PALETTE_RGBA[buf[i]] ?? PALETTE_RGBA[1];
		const o = i * 4;
		data[o] = rgba[0];
		data[o + 1] = rgba[1];
		data[o + 2] = rgba[2];
		data[o + 3] = rgba[3];
	}
}
