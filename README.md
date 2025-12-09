# Siberspace Blog

A modern blog built with **SvelteKit** and **Ghost** as a headless CMS.

## Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **CMS**: Ghost (headless mode)
- **Styling**: Tailwind CSS
- **Package Manager**: Bun
- **Deployment**: Vercel (Static Site Generation)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (or Node.js 22+)
- A Ghost site with Content API access

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd siber-blog
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file with your Ghost credentials:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your Ghost URL and Content API key:
   ```
   GHOST_URL=https://your-site.ghost.io
   GHOST_CONTENT_API_KEY=your_content_api_key
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Getting Your Ghost API Key

1. Log into your Ghost admin panel
2. Go to **Settings** → **Integrations**
3. Click **"+ Add custom integration"**
4. Name it (e.g., "Svelte Frontend")
5. Copy the **Content API Key** and **API URL**

## Available Scripts

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally

## Deployment

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables (`GHOST_URL`, `GHOST_CONTENT_API_KEY`)
4. Deploy!

## Project Structure

```
src/
├── lib/
│   └── ghost.ts          # Ghost API client
├── routes/
│   ├── +layout.svelte    # Shared layout (header/footer)
│   ├── +page.svelte      # Homepage (post list)
│   ├── +page.server.ts   # Homepage data loader
│   └── [slug]/
│       ├── +page.svelte      # Individual post page
│       └── +page.server.ts   # Post data loader
└── app.css               # Global styles (Tailwind)
```

## License

MIT
