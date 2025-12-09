import { getPost, getAllPostSlugs } from '$lib/ghost';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
};

// Generate static pages for all posts
export const entries: EntryGenerator = async () => {
	const slugs = await getAllPostSlugs();
	return slugs.map((slug) => ({ slug }));
};

export const prerender = true;

