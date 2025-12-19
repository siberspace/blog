# Implementation Plan: Figma Design → Code

This document outlines the step-by-step plan to implement the Figma design (node-id: 122-2) for the blog post page.

## Design Overview

The Figma design shows a dark-themed blog post layout with:
- **Hero Image**: Large full-width black & white image with rounded top corners
- **Content Section**: Black background with centered title, tags, and article body
- **Typography**: Serif fonts with justified text and light text on dark background

## Current State vs. Target State

### Current Implementation
- Light theme (#e1e1e1 background)
- Black hero section with title overlay
- Light gray body section
- Title in hero section with mix-blend-mode

### Target Design
- Dark theme throughout
- Separate hero image section
- Black content section
- Centered title in content section
- Light text on dark background

---

## Implementation Steps

### Step 1: Update Design Tokens
**Goal**: Add new color tokens for the dark theme

**Tasks**:
- [ ] Add `--color-bg-content` token: `#000000` (black)
- [ ] Add `--color-text-on-dark` token: `#F3F2F1` (light cream/off-white)
- [ ] Add `--color-text-body-dark` token: `#E0DDD9` (soft off-white for body)
- [ ] Update `tokens.ts` with corresponding TypeScript values

**Files to modify**:
- `src/lib/design-system/tokens.css`
- `src/lib/design-system/tokens.ts`

**Estimated time**: 15 minutes

---

### Step 2: Restructure Post Page Layout
**Goal**: Separate hero image from content section

**Tasks**:
- [ ] Remove title from hero section
- [ ] Create dedicated hero image section (full-width, rounded top corners)
- [ ] Move title to content section (centered, below hero image)
- [ ] Update layout structure: Header → Hero Image → Content Section
- [ ] Remove sidebar images section (not in Figma design)

**Files to modify**:
- `src/routes/[slug]/+page.svelte`

**Estimated time**: 30 minutes

---

### Step 3: Style Hero Image Section
**Goal**: Implement the hero image with proper styling

**Tasks**:
- [ ] Create full-width hero image container
- [ ] Add rounded top corners (border-radius on top-left and top-right)
- [ ] Ensure image fills container properly (object-cover)
- [ ] Add subtle borders/spacing as shown in design
- [ ] Handle case when no feature_image is available (placeholder or skip section)

**Files to modify**:
- `src/routes/[slug]/+page.svelte`

**Estimated time**: 25 minutes

---

### Step 4: Style Content Section Background
**Goal**: Apply black background to content section

**Tasks**:
- [ ] Change content section background from light gray to black (#000000)
- [ ] Update layout background if needed
- [ ] Ensure proper contrast for all text elements

**Files to modify**:
- `src/routes/[slug]/+page.svelte`
- `src/routes/+layout.svelte` (if needed)

**Estimated time**: 15 minutes

---

### Step 5: Style Title in Content Section
**Goal**: Center and style the post title

**Tasks**:
- [ ] Center the title horizontally
- [ ] Apply light text color (#F3F2F1)
- [ ] Adjust font size to match design (large serif)
- [ ] Add proper spacing above and below title
- [ ] Use serif font family

**Files to modify**:
- `src/routes/[slug]/+page.svelte`

**Estimated time**: 20 minutes

---

### Step 6: Center Tag Pills
**Goal**: Center tags below title

**Tasks**:
- [ ] Center tag pills horizontally below title
- [ ] Update tag pill styling for dark background (transparent fill, colored border) if needed
- [ ] Adjust spacing between tags

**Files to modify**:
- `src/routes/[slug]/+page.svelte`
- `src/lib/components/TagPill.svelte` (if styling changes needed)

**Estimated time**: 20 minutes

---

### Step 7: Style Article Body Text
**Goal**: Implement dark theme typography for article content

**Tasks**:
- [ ] Change body text color to light color (#E0DDD9)
- [ ] Apply justified text alignment
- [ ] Increase line height for readability
- [ ] Add generous paragraph spacing
- [ ] Ensure proper contrast

**Files to modify**:
- `src/routes/[slug]/+page.svelte`
- `src/app.css` (if global styles needed)

**Estimated time**: 20 minutes

---

### Step 8: Update Layout Background
**Goal**: Ensure overall layout matches dark theme

**Tasks**:
- [ ] Update main layout background color to black
- [ ] Ensure consistent dark theme throughout
- [ ] Check spacing and padding match design

**Files to modify**:
- `src/routes/+layout.svelte`

**Estimated time**: 15 minutes

---

### Step 9: Responsive Design Adjustments
**Goal**: Ensure design works on mobile and tablet

**Tasks**:
- [ ] Test hero image on mobile (full-width, proper aspect ratio)
- [ ] Adjust title size for smaller screens
- [ ] Ensure tag pills wrap properly on mobile
- [ ] Test text readability on all screen sizes
- [ ] Adjust spacing for mobile

**Files to modify**:
- `src/routes/[slug]/+page.svelte`

**Estimated time**: 30 minutes

---

### Step 10: Polish and Refinement
**Goal**: Final touches to match Figma

**Tasks**:
- [ ] Compare with Figma screenshot
- [ ] Adjust spacing values to match
- [ ] Fine-tune typography sizes
- [ ] Verify color accuracy
- [ ] Test with different post content
- [ ] Remove any unused code/styles

**Files to modify**:
- All modified files

**Estimated time**: 30 minutes

---

## Color Reference

Based on the design:
- **Content Background**: `#000000` (black)
- **Title Text**: `#F3F2F1` (light cream)
- **Body Text**: `#E0DDD9` (soft off-white)
- **Tag Colors**: Use existing tag colors (no changes needed)

---

## Testing Checklist

After implementation, verify:
- [ ] Hero image displays with rounded top corners
- [ ] Content section has black background
- [ ] Title is centered with light text
- [ ] Tags are centered below title
- [ ] Article body has light text on dark background
- [ ] Text is justified
- [ ] Design matches Figma on desktop
- [ ] Design is responsive on mobile/tablet
- [ ] All colors match design tokens
- [ ] Typography matches design

---

## Estimated Total Time

**Total**: ~3-3.5 hours

**Breakdown**:
- Steps 1-4: Foundation (1.5 hours)
- Steps 5-7: Content styling (1 hour)
- Steps 8-10: Polish and refinement (1 hour)

---

## Notes

- Keep existing functionality (Ghost CMS integration, routing, etc.)
- Maintain component structure where possible
- Update design system tokens for reusability
- Test with real Ghost content
- Consider accessibility (contrast ratios, etc.)
- Header component remains unchanged
- Tag colors remain unchanged
- Drop caps and quote styling are not required

