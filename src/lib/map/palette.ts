/** Fixed scene palette — index 0 is transparent (skip when blitting). */
export const PALETTE: readonly string[] = [
	'#00000000', // 0 transparent
	'#050510', // 1 void / deepest
	'#0a1020', // 2 sky dark
	'#121a30', // 3 sky mid
	'#1a2440', // 4 sky light band
	'#0c1828', // 5 water A
	'#142838', // 6 water B
	'#1c3048', // 7 water highlight
	'#1a2038', // 8 mountain far
	'#283050', // 9 mountain mid
	'#384868', // 10 mountain near
	'#4a5a78', // 11 mountain rim
	'#d0d0d8', // 12 cream / stars
	'#e8d878', // 13 moon
	'#f0c030', // 14 lantern
	'#0a0808', // 15 salamander black
	'#e86828', // 16 salamander orange
	'#a84818', // 17 salamander dark orange
	'#3a3028', // 18 building dark / cliff deep
	'#5a5040', // 19 building mid / cliff mid
	'#8a7a60', // 20 path / building light / cliff rim
	'#2a4a3a', // 21 island grass top
	'#1e3a2e', // 22 island grass shade
	'#4a6a50' // 23 island grass highlight
];

/** Precomputed RGBA bytes for fast putImageData. */
export const PALETTE_RGBA: Uint8ClampedArray[] = PALETTE.map((hex) => {
	if (hex.length === 9) {
		// #RRGGBBAA
		return new Uint8ClampedArray([
			parseInt(hex.slice(1, 3), 16),
			parseInt(hex.slice(3, 5), 16),
			parseInt(hex.slice(5, 7), 16),
			parseInt(hex.slice(7, 9), 16)
		]);
	}
	return new Uint8ClampedArray([
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16),
		255
	]);
});

export const VIRTUAL_W = 320;
export const VIRTUAL_H = 180;
