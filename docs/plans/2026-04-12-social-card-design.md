# Social Card Design — 2026-04-12

## Goal

Replace the existing `SocialCarousel` swipeable card stack on the main public page (`/`) with a static `SocialCard` grid component that matches the visual style of the provided `social-card.tsx` reference component. Social links remain dynamic (fetched from the database).

## Approach

Option B — Tailwind-only rewrite. No external CSS files. Consistent with the project's existing Tailwind + shadcn setup.

## Component Design

**File:** `src/components/public/SocialCard.tsx`

- Renders a card shell with a glass/dark overlay background and a title
- Up to 4 active social links from the DB rendered as icon boxes in a 2×2 grid
- Each box uses platform gradient colors from `PLATFORM_STYLES` (already defined in `SocialCarousel.tsx`)
- Platform icons from `/public/` SVG images with lucide fallback (same as `SocialCarousel`)
- Staggered entrance animation using Tailwind `transition-all` with `delay-[Xms]` per box
- Click: POST `/api/track/social_link/:id` then `window.open` to link URL
- A 4th decorative/empty box renders if fewer than 4 links exist

## Page Change

**File:** `src/app/page.tsx`

- Swap `SocialCarousel` import and usage for `SocialCard`
- DB query stays the same (active links, ordered by displayOrder)

## Out of Scope

- `SocialCarousel.tsx` is not deleted (may be used elsewhere)
- No schema or API changes
