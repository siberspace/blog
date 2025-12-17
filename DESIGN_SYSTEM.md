# Design System Documentation

This document outlines the design system for the blog, including design tokens, components, and usage guidelines.

## Table of Contents

- [Design Tokens](#design-tokens)
- [Components](#components)
- [Usage Guidelines](#usage-guidelines)
- [Figma Integration](#figma-integration)

## Design Tokens

Design tokens are the foundational values of the design system. They're defined in two places:

1. **TypeScript tokens** (`src/lib/design-system/tokens.ts`) - For programmatic access
2. **CSS custom properties** (`src/lib/design-system/tokens.css`) - For styling

### Colors

#### Backgrounds
- `--color-bg-primary`: `#e1e1e1` - Main background color
- `--color-bg-hero`: `#000000` - Hero section background

#### Text
- `--color-text-primary`: `#1a1a1a` - Primary text color
- `--color-text-secondary`: `#525252` - Secondary text color
- `--color-text-light`: `#ffffff` - Light text (for dark backgrounds)

#### Accent
- `--color-accent`: `#0e8b3e` - Primary accent color
- `--color-accent-hover`: `#0a6b2e` - Accent hover state

#### Tags
- `--color-tag-orange`: `#e59d50`
- `--color-tag-green`: `#9ecf5a`
- `--color-tag-blue`: `#4590b3`
- `--color-tag-purple`: `#9d7bdd`

### Typography

#### Font Families
- `--font-sans`: `"Inter", sans-serif` - For UI elements and headers
- `--font-serif`: `"Libre Caslon Text", "Georgia", serif` - For article content
- `--font-handwritten`: `"Delicious Handrawn", cursive` - For tags and decorative elements

#### Font Sizes
- `--text-xs` through `--text-5xl` - Standard size scale

### Spacing

- `--spacing-xs`: `0.25rem`
- `--spacing-sm`: `0.5rem`
- `--spacing-md`: `1rem`
- `--spacing-lg`: `1.5rem`
- `--spacing-xl`: `2rem`
- `--spacing-2xl`: `3rem`

### Transitions

- `--transition-fast`: `0.15s ease`
- `--transition-base`: `0.2s ease`
- `--transition-slow`: `0.3s ease`

## Components

### TagPill

A decorative tag component with organic, sketch-style borders.

**Props:**
- `label` (string, required) - The text to display
- `color` (string, optional) - Hex color code. Defaults to random tag color
- `pathIndex` (number, optional) - Index of sketch path to use. Defaults to random
- `size` ('sm' | 'md' | 'lg', optional) - Size variant. Defaults to 'md'

**Usage:**
```svelte
<script>
  import { TagPill } from '$lib/components';
  import { tagColors, sketchPaths } from '$lib/design-system';
</script>

<TagPill label="2024" color={tagColors[1]} pathIndex={1} />
<TagPill label="Design" size="sm" />
```

### Header

Site header component with logo and navigation.

**Props:**
- `siteName` (string, optional) - Site name. Defaults to 'saberspace'
- `indexLink` (string, optional) - Link for index. Defaults to '/'
- `indexLabel` (string, optional) - Label for index link. Defaults to 'Quick Index'

**Usage:**
```svelte
<script>
  import { Header } from '$lib/components';
</script>

<Header />
<Header siteName="My Blog" indexLabel="All Posts" />
```

### BackLink

A styled back link component for navigation.

**Props:**
- `href` (string, optional) - Link destination. Defaults to '/'
- `label` (string, optional) - Link text. Defaults to '← Back to index'

**Usage:**
```svelte
<script>
  import { BackLink } from '$lib/components';
</script>

<BackLink />
<BackLink href="/posts" label="← Back to posts" />
```

## Usage Guidelines

### Importing Components

Always import components from the central export:

```svelte
import { TagPill, Header, BackLink } from '$lib/components';
```

### Using Design Tokens

#### In TypeScript/JavaScript:
```typescript
import { tokens, tagColors } from '$lib/design-system';

const primaryColor = tokens.colors.bg.primary;
const accentColor = tokens.colors.accent.base;
```

#### In CSS:
```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-serif);
  transition: opacity var(--transition-base);
}
```

#### In Tailwind (using arbitrary values):
```svelte
<div class="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
```

### Color Rotation for Tags

When displaying multiple tags, use the `tagColors` array for consistent color rotation:

```svelte
{#each items as item, i}
  <TagPill 
    label={item.name} 
    color={tagColors[i % tagColors.length]} 
  />
{/each}
```

## Figma Integration

### Design Token Mapping

When designing in Figma, use these values to match the code:

| CSS Variable | Figma Value | Usage |
|------------|-------------|-------|
| `--color-bg-primary` | `#E1E1E1` | Backgrounds |
| `--color-bg-hero` | `#000000` | Hero sections |
| `--color-text-primary` | `#1A1A1A` | Body text |
| `--color-text-secondary` | `#525252` | Secondary text |
| `--color-accent` | `#0E8B3E` | Links, CTAs |
| `--font-sans` | Inter | UI, headers |
| `--font-serif` | Libre Caslon Text | Article content |
| `--font-handwritten` | Delicious Handrawn | Tags, decorative |

### Component Specifications

#### TagPill Component
- **Padding**: `0.5rem 1.25rem` (md), `0.35rem 1rem` (sm), `0.625rem 1.5rem` (lg)
- **Font**: Delicious Handrawn
- **Font Size**: `1.25rem` (md), `1.125rem` (sm), `1.5rem` (lg)
- **Border**: Organic SVG path, 2px stroke
- **Colors**: Use tag color palette

#### Header Component
- **Padding**: `1.25rem 1.5rem`
- **Logo**: Inter Bold, `1.5rem`, `-0.025em` letter-spacing
- **Index Link**: Inter Light, `1.5rem`

### Best Practices for Figma

1. **Create a Component Library**: Build reusable components in Figma that match the code components
2. **Use Styles**: Create color styles, text styles, and effect styles that match the design tokens
3. **Auto Layout**: Use Figma's Auto Layout for components that need to adapt (like TagPill with different text lengths)
4. **Variants**: Create component variants for different sizes (sm, md, lg)
5. **Documentation**: Add notes to Figma components explaining their props and usage

### Exporting from Figma

When exporting assets or specifications:

1. **Colors**: Export as CSS variables or use Figma's "Copy as CSS" feature
2. **Spacing**: Use Figma's spacing tokens or document measurements
3. **Typography**: Export font families and sizes to match the design tokens
4. **Components**: Use Figma's "Copy/Paste as CSS" for component styles

## Extending the Design System

### Adding New Tokens

1. Add to `tokens.ts`:
```typescript
export const tokens = {
  // ... existing tokens
  newCategory: {
    value: '#hexcode',
  },
};
```

2. Add to `tokens.css`:
```css
:root {
  --color-new-category: #hexcode;
}
```

3. Update this documentation

### Creating New Components

1. Create component file in `src/lib/components/`
2. Use design tokens from the system
3. Export from `src/lib/components/index.ts`
4. Document in this file
5. Add TypeScript types for props

## Resources

- [Design Tokens Source](./src/lib/design-system/tokens.ts)
- [Components Source](./src/lib/components/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Svelte Documentation](https://svelte.dev/docs)
