import GhostContentAPI from '@tryghost/content-api';
import { GHOST_URL, GHOST_CONTENT_API_KEY } from '$env/static/private';

// Initialize the Ghost Content API client
const ghost = new GhostContentAPI({
	url: GHOST_URL,
	key: GHOST_CONTENT_API_KEY,
	version: 'v5.0'
});

// Type definitions for Ghost content
export type GhostPost = {
	id: string;
	uuid: string;
	title: string;
	slug: string;
	html: string;
	feature_image: string | null;
	feature_image_alt: string | null;
	feature_image_caption: string | null;
	featured: boolean;
	excerpt: string;
	custom_excerpt: string | null;
	published_at: string;
	updated_at: string;
	reading_time: number;
	primary_author?: GhostAuthor;
	primary_tag?: GhostTag;
	tags?: GhostTag[];
	authors?: GhostAuthor[];
};

export type GhostAuthor = {
	id: string;
	name: string;
	slug: string;
	profile_image: string | null;
	bio: string | null;
	website: string | null;
};

export type GhostTag = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	feature_image: string | null;
};

export type GhostSettings = {
	title: string;
	description: string;
	logo: string | null;
	icon: string | null;
	cover_image: string | null;
	navigation: Array<{ label: string; url: string }>;
};

// Fetch all posts
export async function getPosts(): Promise<GhostPost[]> {
	const posts = await ghost.posts.browse({
		limit: 'all',
		include: ['tags', 'authors'],
		fields: [
			'id',
			'uuid',
			'title',
			'slug',
			'feature_image',
			'feature_image_alt',
			'featured',
			'excerpt',
			'custom_excerpt',
			'published_at',
			'reading_time'
		].join(',')
	});

	return posts as unknown as GhostPost[];
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<GhostPost | null> {
	try {
		const post = await ghost.posts.read(
			{ slug },
			{
				include: ['tags', 'authors']
			}
		);
		return post as unknown as GhostPost;
	} catch {
		return null;
	}
}

// Fetch all post slugs (for static generation)
export async function getAllPostSlugs(): Promise<string[]> {
	const posts = await ghost.posts.browse({
		limit: 'all',
		fields: 'slug'
	});

	return posts.map((post) => post.slug);
}

// Fetch site settings
export async function getSettings(): Promise<GhostSettings> {
	const settings = await ghost.settings.browse();
	return settings as unknown as GhostSettings;
}

export { ghost };

