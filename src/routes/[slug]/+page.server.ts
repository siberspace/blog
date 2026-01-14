import { getPost, getAllPostSlugs } from '$lib/ghost';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';
import { Vibrant } from 'node-vibrant/node';

// Helper to determine if a color is light or dark
function isLightColor(hex: string): boolean {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5;
}

// Darken a hex color by a percentage
function darkenColor(hex: string, percent: number): string {
	const r = Math.max(0, Math.floor(parseInt(hex.slice(1, 3), 16) * (1 - percent)));
	const g = Math.max(0, Math.floor(parseInt(hex.slice(3, 5), 16) * (1 - percent)));
	const b = Math.max(0, Math.floor(parseInt(hex.slice(5, 7), 16) * (1 - percent)));
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Lighten a hex color by a percentage
function lightenColor(hex: string, percent: number): string {
	const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) + (255 - parseInt(hex.slice(1, 3), 16)) * percent));
	const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) + (255 - parseInt(hex.slice(3, 5), 16)) * percent));
	const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) + (255 - parseInt(hex.slice(5, 7), 16)) * percent));
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Extract colors from an image URL
async function extractColors(imageUrl: string) {
	try {
		const palette = await Vibrant.from(imageUrl).getPalette();
		
		// Get the most prominent colors
		const vibrant = palette.Vibrant?.hex || '#385c35';
		const darkVibrant = palette.DarkVibrant?.hex || '#1e3d1a';
		const lightVibrant = palette.LightVibrant?.hex || '#7bc043';
		const muted = palette.Muted?.hex || '#4a5a48';
		const darkMuted = palette.DarkMuted?.hex || '#2d3d2b';
		const lightMuted = palette.LightMuted?.hex || '#a8b8a6';

		// Determine if we should use a light or dark theme based on the dominant color
		const dominantColor = palette.Vibrant?.hex || palette.Muted?.hex || '#385c35';
		const useLight = isLightColor(dominantColor);

		// Create a cohesive color scheme
		const bgColor = useLight ? lightenColor(lightMuted, 0.3) : darkenColor(darkMuted, 0.4);
		const textColor = useLight ? darkenColor(darkVibrant, 0.3) : lightenColor(lightMuted, 0.2);
		const headlineColor = vibrant;
		const headlineShadow = darkVibrant;
		const headlineAccent = lightVibrant;
		const tagColor = useLight ? darkenColor(muted, 0.2) : lightenColor(muted, 0.1);
		const tagTextColor = useLight ? darkVibrant : lightMuted;
		const borderColor = vibrant;
		const linkColor = useLight ? darkVibrant : lightVibrant;

		return {
			bgColor,
			textColor,
			headlineColor,
			headlineShadow,
			headlineAccent,
			tagColor,
			tagTextColor,
			borderColor,
			linkColor,
			isLight: useLight
		};
	} catch (e) {
		console.error('Failed to extract colors:', e);
		// Return default green theme
		return {
			bgColor: '#385c35',
			textColor: '#c8d8c6',
			headlineColor: '#7bc043',
			headlineShadow: '#1e3d1a',
			headlineAccent: '#5bbcd4',
			tagColor: '#4a5a48',
			tagTextColor: '#c8d8c6',
			borderColor: '#385c35',
			linkColor: '#7bc043',
			isLight: false
		};
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	// Extract colors from feature image
	let colors = {
		bgColor: '#385c35',
		textColor: '#c8d8c6',
		headlineColor: '#7bc043',
		headlineShadow: '#1e3d1a',
		headlineAccent: '#5bbcd4',
		tagColor: '#4a5a48',
		tagTextColor: '#c8d8c6',
		borderColor: '#385c35',
		linkColor: '#7bc043',
		isLight: false
	};

	if (post.feature_image) {
		colors = await extractColors(post.feature_image);
	}

	return {
		post,
		colors
	};
};

// Generate static pages for all posts
export const entries: EntryGenerator = async () => {
	const slugs = await getAllPostSlugs();
	return slugs.map((slug) => ({ slug }));
};

export const prerender = true;
