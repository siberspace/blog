/**
 * Realistic starfield based on user's location and current time
 * Default location: Beirut, Lebanon (33.9°N, 35.5°E)
 */

// Bright stars catalog - Right Ascension (hours), Declination (degrees), Magnitude
// These are the ~100 brightest stars visible to the naked eye
const BRIGHT_STARS = [
	// Name, RA (hours), Dec (degrees), Magnitude
	{ name: 'Sirius', ra: 6.75, dec: -16.72, mag: -1.46 },
	{ name: 'Canopus', ra: 6.40, dec: -52.70, mag: -0.74 },
	{ name: 'Arcturus', ra: 14.26, dec: 19.18, mag: -0.05 },
	{ name: 'Vega', ra: 18.62, dec: 38.78, mag: 0.03 },
	{ name: 'Capella', ra: 5.28, dec: 46.00, mag: 0.08 },
	{ name: 'Rigel', ra: 5.24, dec: -8.20, mag: 0.13 },
	{ name: 'Procyon', ra: 7.65, dec: 5.22, mag: 0.34 },
	{ name: 'Betelgeuse', ra: 5.92, dec: 7.41, mag: 0.42 },
	{ name: 'Altair', ra: 19.85, dec: 8.87, mag: 0.77 },
	{ name: 'Aldebaran', ra: 4.60, dec: 16.51, mag: 0.85 },
	{ name: 'Antares', ra: 16.49, dec: -26.43, mag: 0.96 },
	{ name: 'Spica', ra: 13.42, dec: -11.16, mag: 0.97 },
	{ name: 'Pollux', ra: 7.76, dec: 28.03, mag: 1.14 },
	{ name: 'Fomalhaut', ra: 22.96, dec: -29.62, mag: 1.16 },
	{ name: 'Deneb', ra: 20.69, dec: 45.28, mag: 1.25 },
	{ name: 'Regulus', ra: 10.14, dec: 11.97, mag: 1.35 },
	{ name: 'Castor', ra: 7.58, dec: 31.89, mag: 1.58 },
	{ name: 'Bellatrix', ra: 5.42, dec: 6.35, mag: 1.64 },
	{ name: 'Elnath', ra: 5.44, dec: 28.61, mag: 1.65 },
	{ name: 'Alnilam', ra: 5.60, dec: -1.20, mag: 1.69 },
	{ name: 'Alnitak', ra: 5.68, dec: -1.94, mag: 1.77 },
	{ name: 'Alioth', ra: 12.90, dec: 55.96, mag: 1.77 },
	{ name: 'Dubhe', ra: 11.06, dec: 61.75, mag: 1.79 },
	{ name: 'Mirfak', ra: 3.41, dec: 49.86, mag: 1.80 },
	{ name: 'Alkaid', ra: 13.79, dec: 49.31, mag: 1.86 },
	{ name: 'Sargas', ra: 17.62, dec: -43.00, mag: 1.87 },
	{ name: 'Alhena', ra: 6.63, dec: 16.40, mag: 1.93 },
	{ name: 'Polaris', ra: 2.53, dec: 89.26, mag: 1.98 },
	{ name: 'Hadar', ra: 14.06, dec: -60.37, mag: 0.61 },
	{ name: 'Mizar', ra: 13.40, dec: 54.93, mag: 2.04 },
	{ name: 'Kochab', ra: 14.85, dec: 74.16, mag: 2.08 },
	{ name: 'Schedar', ra: 0.68, dec: 56.54, mag: 2.23 },
	{ name: 'Merak', ra: 11.03, dec: 56.38, mag: 2.37 },
	{ name: 'Phecda', ra: 11.90, dec: 53.69, mag: 2.44 },
	{ name: 'Algol', ra: 3.14, dec: 40.96, mag: 2.12 },
	{ name: 'Almach', ra: 2.07, dec: 42.33, mag: 2.17 },
	{ name: 'Denebola', ra: 11.82, dec: 14.57, mag: 2.14 },
	{ name: 'Alphard', ra: 9.46, dec: -8.66, mag: 1.98 },
	{ name: 'Saiph', ra: 5.80, dec: -9.67, mag: 2.09 },
	{ name: 'Mintaka', ra: 5.53, dec: -0.30, mag: 2.23 },
	{ name: 'Caph', ra: 0.15, dec: 59.15, mag: 2.27 },
	{ name: 'Diphda', ra: 0.73, dec: -17.99, mag: 2.02 },
	{ name: 'Hamal', ra: 2.12, dec: 23.46, mag: 2.00 },
	{ name: 'Menkent', ra: 14.11, dec: -36.37, mag: 2.06 },
	{ name: 'Rasalhague', ra: 17.58, dec: 12.56, mag: 2.07 },
	{ name: 'Algedi', ra: 20.29, dec: -12.51, mag: 3.57 },
	{ name: 'Dabih', ra: 20.35, dec: -14.78, mag: 3.08 },
	{ name: 'Enif', ra: 21.74, dec: 9.87, mag: 2.39 },
	{ name: 'Markab', ra: 23.08, dec: 15.21, mag: 2.49 },
	{ name: 'Scheat', ra: 23.06, dec: 28.08, mag: 2.42 },
	{ name: 'Algenib', ra: 0.22, dec: 15.18, mag: 2.83 },
	{ name: 'Ankaa', ra: 0.44, dec: -42.31, mag: 2.38 },
	{ name: 'Achernar', ra: 1.63, dec: -57.24, mag: 0.46 },
	{ name: 'Sheratan', ra: 1.91, dec: 20.81, mag: 2.64 },
	{ name: 'Mira', ra: 2.32, dec: -2.98, mag: 2.0 },
	{ name: 'Menkar', ra: 3.04, dec: 4.09, mag: 2.53 },
	{ name: 'Zaurak', ra: 3.97, dec: -13.51, mag: 2.95 },
	{ name: 'Rigel Kent', ra: 14.66, dec: -60.83, mag: -0.01 },
	{ name: 'Nunki', ra: 18.92, dec: -26.30, mag: 2.02 },
	{ name: 'Ascella', ra: 19.04, dec: -29.88, mag: 2.60 },
	// Add more dimmer stars for density
	...generateDimStars(150)
];

// Generate random dimmer stars for background density
function generateDimStars(count: number) {
	const stars = [];
	for (let i = 0; i < count; i++) {
		stars.push({
			name: `dim_${i}`,
			ra: Math.random() * 24,
			dec: (Math.random() * 180) - 90,
			mag: 3 + Math.random() * 2.5 // magnitude 3-5.5
		});
	}
	return stars;
}

// Default location: Beirut, Lebanon
const DEFAULT_LOCATION = {
	latitude: 33.8938,
	longitude: 35.5018
};

export interface StarPosition {
	x: number; // 0-100 percentage
	y: number; // 0-100 percentage
	brightness: number; // 0-1
	size: number; // pixel size
	name: string;
}

export interface ObserverLocation {
	latitude: number;
	longitude: number;
}

/**
 * Calculate Local Sidereal Time
 */
function getLocalSiderealTime(longitude: number, date: Date): number {
	const J2000 = new Date('2000-01-01T12:00:00Z');
	const daysSinceJ2000 = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);
	
	// Greenwich Mean Sidereal Time
	const GMST = 18.697374558 + 24.06570982441908 * daysSinceJ2000;
	
	// Local Sidereal Time
	const LST = GMST + (longitude / 15);
	
	// Normalize to 0-24 hours
	return ((LST % 24) + 24) % 24;
}

/**
 * Convert celestial coordinates (RA/Dec) to horizontal coordinates (Alt/Az)
 */
function celestialToHorizontal(
	ra: number, // hours
	dec: number, // degrees
	lat: number, // observer latitude degrees
	lst: number // local sidereal time hours
): { altitude: number; azimuth: number } {
	// Convert to radians
	const decRad = dec * Math.PI / 180;
	const latRad = lat * Math.PI / 180;
	
	// Hour angle
	const ha = (lst - ra) * 15 * Math.PI / 180;
	
	// Calculate altitude
	const sinAlt = Math.sin(decRad) * Math.sin(latRad) + 
				   Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
	const altitude = Math.asin(sinAlt) * 180 / Math.PI;
	
	// Calculate azimuth
	const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / 
				  (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
	let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;
	
	if (Math.sin(ha) > 0) {
		azimuth = 360 - azimuth;
	}
	
	return { altitude, azimuth };
}

/**
 * Convert horizontal coordinates to screen position
 * Using a simple stereographic projection
 */
function horizontalToScreen(
	altitude: number,
	azimuth: number
): { x: number; y: number } | null {
	// Only show stars above horizon (with some margin for atmosphere)
	if (altitude < -5) return null;
	
	// Convert to radians
	const altRad = altitude * Math.PI / 180;
	const azRad = azimuth * Math.PI / 180;
	
	// Stereographic projection from zenith
	// This maps the dome of the sky to a circle
	const r = Math.cos(altRad) / (1 + Math.sin(altRad));
	
	// Convert to x, y (-1 to 1 range)
	const x = r * Math.sin(azRad);
	const y = -r * Math.cos(azRad); // negative because north is up
	
	// Convert to percentage (0-100) with some padding
	const px = 50 + x * 45;
	const py = 50 + y * 45;
	
	// Clamp to viewport with some overflow allowed
	if (px < -10 || px > 110 || py < -10 || py > 110) return null;
	
	return { x: Math.max(0, Math.min(100, px)), y: Math.max(0, Math.min(100, py)) };
}

/**
 * Calculate star brightness from magnitude
 * Brighter stars have lower magnitude numbers
 */
function magnitudeToBrightness(mag: number): number {
	// Sirius (mag -1.46) should be ~1.0, mag 5 stars should be ~0.15
	const brightness = Math.pow(10, (0 - mag) / 2.5) / Math.pow(10, (0 - (-1.5)) / 2.5);
	return Math.max(0.1, Math.min(1, brightness));
}

/**
 * Calculate star size from magnitude
 */
function magnitudeToSize(mag: number): number {
	// Brighter stars are larger
	if (mag < 0) return 3;
	if (mag < 1) return 2.5;
	if (mag < 2) return 2;
	if (mag < 3) return 1.5;
	if (mag < 4) return 1.2;
	return 1;
}

/**
 * Get visible stars for a given location and time
 */
export function getVisibleStars(
	location: ObserverLocation = DEFAULT_LOCATION,
	date: Date = new Date()
): StarPosition[] {
	const lst = getLocalSiderealTime(location.longitude, date);
	const visibleStars: StarPosition[] = [];
	
	for (const star of BRIGHT_STARS) {
		const { altitude, azimuth } = celestialToHorizontal(
			star.ra,
			star.dec,
			location.latitude,
			lst
		);
		
		const screenPos = horizontalToScreen(altitude, azimuth);
		if (screenPos) {
			visibleStars.push({
				x: screenPos.x,
				y: screenPos.y,
				brightness: magnitudeToBrightness(star.mag),
				size: magnitudeToSize(star.mag),
				name: star.name
			});
		}
	}
	
	return visibleStars;
}

/**
 * Get user's location with Lebanon as fallback
 */
export function getUserLocation(): Promise<ObserverLocation> {
	return new Promise((resolve) => {
		if (typeof navigator !== 'undefined' && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					});
				},
				() => {
					// User denied or error - use Lebanon
					resolve(DEFAULT_LOCATION);
				},
				{ timeout: 5000 }
			);
		} else {
			// No geolocation available - use Lebanon
			resolve(DEFAULT_LOCATION);
		}
	});
}

/**
 * Generate CSS for star field
 */
export function generateStarfieldCSS(stars: StarPosition[]): string {
	const gradients = stars.map(star => {
		const opacity = star.brightness;
		const size = star.size;
		return `radial-gradient(${size}px ${size}px at ${star.x}% ${star.y}%, rgba(255, 255, 255, ${opacity}) 0%, transparent 100%)`;
	});
	
	return gradients.join(',\n');
}

