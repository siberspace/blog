import { getPost } from '$lib/ghost';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Default color theme (green)
const defaultColors = {
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

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post,
		colors: defaultColors
	};
};

