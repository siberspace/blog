import GhostContentAPI from '@tryghost/content-api';
import { GHOST_URL, GHOST_CONTENT_API_KEY } from '$env/static/private';

const ghost = new GhostContentAPI({
	url: GHOST_URL,
	key: GHOST_CONTENT_API_KEY,
	version: 'v5.0'
});

export type GhostPost = {
	id: string;
	title: string;
	slug: string;
	html: string;
	feature_image: string | null;
	excerpt: string;
	published_at: string;
};

// Fetch all posts
export async function getPosts(): Promise<GhostPost[]> {
	const posts = await ghost.posts.browse({
		limit: 'all'
	});
	return posts as unknown as GhostPost[];
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<GhostPost | null> {
	try {
		const post = await ghost.posts.read({ slug });
		return post as unknown as GhostPost;
	} catch {
		return null;
	}
}

// Fetch all slugs (for static generation)
export async function getAllPostSlugs(): Promise<string[]> {
	const posts = await ghost.posts.browse({
		limit: 'all',
		fields: 'slug'
	});
	return posts.map((post) => post.slug);
}
