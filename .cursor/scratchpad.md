# Siber Blog - Svelte + Ghost Headless CMS

## Background and Motivation

**Goal:** Set up a modern blog using Ghost as a headless CMS with a Svelte frontend.

**Why this stack?**
- **Ghost CMS**: Powerful, open-source headless CMS with excellent content management, built-in SEO, and a robust Content API
- **Svelte/SvelteKit**: Modern, performant frontend framework with excellent DX, smaller bundle sizes, and built-in SSR/SSG capabilities

**User Context:**
- First time using Svelte
- Has Ghost CMS (headless mode) ready or will set up
- Repository: siber-blog

## Key Challenges and Analysis

### Decisions Made ✅

1. **Ghost Setup:** Ghost Pro account (hosted) - need to get Content API key
2. **Deployment Target:** Vercel (use `@sveltejs/adapter-vercel`)
3. **Rendering Strategy:** SSG (Static Site Generation)
4. **MVP Features:** Homepage (post list) + Individual post pages
5. **Styling:** Tailwind CSS
6. **TypeScript:** Yes

### Technical Considerations

- **SvelteKit** is the recommended framework (like Next.js for React)
- Ghost Content API returns JSON - we'll use `@tryghost/content-api` package
- Need to handle:
  - API key security (environment variables)
  - Image optimization (Ghost serves images, may want to proxy/optimize)
  - SEO meta tags
  - RSS feed generation
  - Sitemap generation

## High-level Task Breakdown

### Phase 1: Project Setup
- [ ] 1.1 Initialize SvelteKit project with TypeScript
- [ ] 1.2 Configure Tailwind CSS
- [ ] 1.3 Set up environment variables for Ghost API
- [ ] 1.4 Install and configure Ghost Content API client
- [ ] 1.5 Configure Vercel adapter for SSG

### Phase 2: Core Pages (MVP)
- [ ] 2.1 Create layout with header/footer
- [ ] 2.2 Homepage - fetch and display posts list
- [ ] 2.3 Post page - dynamic route `[slug]` for individual posts
- [ ] 2.4 Style with Tailwind

### Phase 3: Future Enhancements (Post-MVP)
- [ ] Tag pages
- [ ] Author pages
- [ ] SEO meta tags
- [ ] RSS feed
- [ ] Sitemap

### Phase 4: Deployment
- [ ] Deploy to Vercel
- [ ] Connect custom domain (if applicable)

## Project Status Board

### Phase 1: Project Setup ✅
- [x] 1.1 Initialize SvelteKit project with TypeScript
- [x] 1.2 Configure Tailwind CSS
- [x] 1.3 Set up environment variables for Ghost API
- [x] 1.4 Install and configure Ghost Content API client
- [x] 1.5 Configure Vercel adapter for SSG

### Phase 2: Core Pages (MVP) ✅
- [x] 2.1 Create layout with header/footer
- [x] 2.2 Homepage - fetch and display posts list
- [x] 2.3 Post page - dynamic route for individual posts
- [x] 2.4 Style with Tailwind

## Executor's Feedback or Assistance Requests

N/A - Planning phase

## Lessons

(To be updated as we learn things during development)

