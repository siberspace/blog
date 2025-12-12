import { getPosts } from '$lib/ghost';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = await getPosts();
	return { posts };
};

export const prerender = true;
