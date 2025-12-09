import { getPosts, getSettings } from '$lib/ghost';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [posts, settings] = await Promise.all([getPosts(), getSettings()]);

	return {
		posts,
		settings
	};
};

// Enable prerendering for static generation
export const prerender = true;

