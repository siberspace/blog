import GhostContentAPI from "@tryghost/content-api";
import { env } from "$env/dynamic/private";

function getGhostClient() {
  return new GhostContentAPI({
    url: env.GHOST_API_URL || env.GHOST_URL || "",
    key: env.GHOST_CONTENT_API_KEY || "",
    version: "v5.0",
  });
}

export type GhostTag = {
  id: string;
  name: string;
  slug: string;
};

export type GhostAuthor = {
  id: string;
  name: string;
  slug: string;
};

export type GhostPost = {
  id: string;
  title: string;
  slug: string;
  html: string;
  feature_image: string | null;
  excerpt: string;
  published_at: string;
  tags?: GhostTag[];
  authors?: GhostAuthor[];
  primary_author?: GhostAuthor;
};

// Fetch all posts
export async function getPosts(): Promise<GhostPost[]> {
  const ghost = getGhostClient();
  const posts = await ghost.posts.browse({
    limit: "all",
    include: ["tags", "authors"],
  });
  return posts as unknown as GhostPost[];
}

// Fetch a single post by slug
export async function getPost(slug: string): Promise<GhostPost | null> {
  try {
    const ghost = getGhostClient();
    const post = await ghost.posts.read(
      { slug },
      { include: ["tags", "authors"] }
    );
    return post as unknown as GhostPost;
  } catch {
    return null;
  }
}

// Fetch all slugs (for static generation)
export async function getAllPostSlugs(): Promise<string[]> {
  const ghost = getGhostClient();
  const posts = await ghost.posts.browse({
    limit: "all",
    fields: "slug",
  });
  return posts.map((post) => post.slug);
}
