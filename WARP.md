# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A SvelteKit blog using Ghost as a headless CMS with static site generation (SSG). The site is deployed to Vercel and uses Bun as the package manager.

## Tech Stack

- **Framework**: SvelteKit 2.x with TypeScript
- **CMS**: Ghost Content API (headless)
- **Styling**: Tailwind CSS 4.x
- **Package Manager**: Bun
- **Deployment**: Vercel with Node.js 22.x runtime
- **SSG**: All pages prerendered at build time

## Development Commands

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:5173)
bun dev

# Build for production
bun run build

# Preview production build locally
bun run preview

# Type checking and validation
bun run check

# Type checking with watch mode
bun run check:watch
```

## Environment Setup

Required environment variables in `.env`:
- `GHOST_URL`: Your Ghost site URL (e.g., https://your-site.ghost.io)
- `GHOST_CONTENT_API_KEY`: Ghost Content API key from Settings → Integrations

To get Ghost API credentials:
1. Log into Ghost admin panel
2. Go to Settings → Integrations
3. Create a custom integration
4. Copy the Content API Key and API URL

## Architecture

### Data Flow
1. **Build time**: Ghost Content API is queried to fetch all posts and settings
2. **Static generation**: SvelteKit prerenders all routes (homepage + individual post pages)
3. **Deployment**: Static HTML/CSS/JS served from Vercel CDN

### Key Files

**Ghost API Client** (`src/lib/ghost.ts`):
- Initializes `@tryghost/content-api` client with credentials from env vars
- Exports typed functions: `getPosts()`, `getPost(slug)`, `getAllPostSlugs()`, `getSettings()`
- Contains TypeScript types for Ghost content (GhostPost, GhostAuthor, GhostTag, GhostSettings)

**Routes**:
- `src/routes/+page.server.ts`: Homepage data loader, fetches all posts and site settings
- `src/routes/[slug]/+page.server.ts`: Individual post loader, includes `entries` function for SSG
- `src/routes/+layout.svelte`: Shared layout with header/footer, loads custom fonts (Instrument Serif, DM Sans)

All server load functions have `export const prerender = true` to enable static generation.

### SvelteKit Configuration
- Uses `@sveltejs/adapter-vercel` with Node.js 22.x runtime
- Tailwind CSS 4.x integrated via `@tailwindcss/vite` plugin
- TypeScript strict mode enabled

### Styling
- Tailwind CSS with custom fonts (Instrument Serif for headings, DM Sans for body)
- Design uses stone color palette (stone-50, stone-200, stone-600, stone-900)
- Global styles in `src/app.css`

## Working with Ghost Content

When adding/modifying Ghost-related functionality:
- All Ghost API interactions go through `src/lib/ghost.ts`
- Use the exported types (GhostPost, GhostAuthor, etc.) for type safety
- The Content API is read-only (use Ghost Admin API for writes)
- Remember that data is fetched at build time, not runtime (static site)

## Building New Features

When creating new routes:
- Add `export const prerender = true` to server load functions for SSG
- Use `+page.server.ts` for data fetching (server-side only)
- Import types from `./$types` for PageServerLoad, etc.

When modifying Ghost data fetching:
- Edit functions in `src/lib/ghost.ts`
- Consider what fields are needed to minimize API payload
- Update TypeScript types if adding new Ghost content types
