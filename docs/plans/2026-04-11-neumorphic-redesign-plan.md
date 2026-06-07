# KAG QR Code App — Neumorphic UI Redesign Plan

**Date:** 2026-04-11
**Base project:** Cityfirstfoods QrcodeApp (copied)
**Target style:** KAG website neumorphic design system

---

## Design Language

Taken directly from the KAG website (`kag-website` repo):

| Token | Value |
|---|---|
| Background | `#f5f5f5` |
| Card surface | `#f5f5f5` |
| Card border-top | `1px solid rgba(255,255,255,0.8)` |
| Card shadow | `0 8px 16px -4px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.5), 4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.9)` |
| Input shadow (inset/pressed) | `inset 3px 3px 7px rgba(0,0,0,0.1), inset -3px -3px 7px rgba(255,255,255,0.9)` |
| Button shadow (convex) | `4px 4px 8px rgba(0,0,0,0.12), -3px -3px 8px rgba(255,255,255,0.9)` |
| Badge shadow | `3px 3px 6px rgba(0,0,0,0.09), -2px -2px 5px rgba(255,255,255,0.92)` |
| Border radius (cards) | `rounded-3xl` (24px) |
| Border radius (small) | `rounded-2xl` (16px) |
| Heading color | `text-gray-900` |
| Body color | `text-gray-500` |
| Accent (KAG brand) | No color accent — pure gray-scale neumorphic |

---

## Scope of Changes

### Phase 1 — Foundation (CSS Variables + Primitive Components)

**Files to change:**

1. **`src/app/globals.css`**
   - Set `--background: #f5f5f5` and `--card: #f5f5f5` for both light theme
   - Remove or disable dark theme variant (KAG site is light-only)
   - Add CSS utility classes: `.neu-card`, `.neu-badge`, `.neu-input`, `.neu-button`
   - Update sidebar CSS variables to match light neumorphic (light background, gray text)

2. **`src/components/ui/card.tsx`**
   - Replace default shadcn border/shadow with neumorphic shadow
   - Background: `bg-[#f5f5f5]`, border-top highlight, neumorphic box-shadow

3. **`src/components/ui/button.tsx`**
   - Default variant: convex neumorphic (raised appearance)
   - Remove colored gradients for primary; use dark gray (`bg-gray-900 text-white`) as primary
   - Add active/pressed state: inset shadow on `:active`

4. **`src/components/ui/input.tsx`**
   - Inset neumorphic style: `background: #ebebeb`, inset shadow, no border ring
   - Matches KAG website form inputs

5. **`src/components/ui/badge.tsx`**
   - Neumorphic badge: `bg-[#f5f5f5]`, badge shadow, `text-gray-600`

---

### Phase 2 — Dashboard Screens

**Files to change:**

6. **`src/components/dashboard/AppSidebar.tsx`**
   - Switch from dark sidebar to light neumorphic sidebar
   - Background: `#f0f0f0` (slightly darker than page bg for contrast)
   - Active nav item: inset neumorphic highlight instead of color fill
   - Brand header: KAG logo + "KAG" name replacing "Cityfirstfoods"
   - User avatar: gray circle instead of orange

7. **`src/app/dashboard/layout.tsx`**
   - Update sidebar CSS variables override to light palette

8. **`src/app/dashboard/page.tsx`** (Overview)
   - Stat cards: replace shadcn Card with inline neumorphic card styles
   - Remove colored gradient top bars — use subtle gray neumorphic icon circles instead
   - Click activity chart bar: use `#333` (dark gray) for bars instead of orange

9. **`src/app/dashboard/analytics/AnalyticsClient.tsx`**
   - Neumorphic card wrappers for chart sections

10. **`src/app/dashboard/products/ProductsClient.tsx`**
    - Table container wrapped in neumorphic card
    - Action buttons: neumorphic convex style

11. **`src/app/dashboard/employees/EmployeesClient.tsx`**
    - Same pattern as products

12. **`src/app/dashboard/ads/AdsClient.tsx`**
    - Same pattern

13. **`src/app/dashboard/social-links/SocialLinksClient.tsx`**
    - Same pattern

---

### Phase 3 — Public Pages

**Files to change:**

14. **`src/app/page.tsx`** (Home / Social links landing)
    - Replace dark video overlay design with light neumorphic design
    - Background: `#f5f5f5` (no video — KAG is clean/minimal)
    - KAG logo centered at top
    - Social link cards displayed as neumorphic raised buttons
    - Keep `SocialCarousel` component but restyle it

15. **`src/components/public/SocialCarousel.tsx`**
    - Each card: neumorphic convex card with icon + label
    - Hover: slight scale-up
    - Remove orange/brand-color tints

16. **`src/app/p/[id]/page.tsx`** (Product page)
    - Replace `bg-white rounded-2xl shadow-lg` card with full neumorphic card
    - Background: `#f5f5f5`
    - CTA button: dark neumorphic (matches KAG's FlowButton style — dark pill)
    - Price tag: neumorphic badge

17. **`src/app/e/[id]/page.tsx`** (Employee profile page)
    - Replace dark video + glassmorphism card with light neumorphic
    - Background: `#f5f5f5`
    - Employee avatar: neumorphic circle frame
    - Profile card: neumorphic raised card
    - Action links: neumorphic buttons (same as social carousel)

18. **`src/app/a/[id]/page.tsx`** (Ad/promotion page)
    - Read first to understand current design
    - Apply neumorphic card wrapping

19. **`src/app/login/page.tsx`**
    - Replace `bg-gradient-to-br from-amber-50 to-orange-100` with `bg-[#f5f5f5]`
    - Login card: neumorphic raised card
    - Inputs: neumorphic inset
    - Submit button: dark neumorphic pill

---

### Phase 4 — Branding

**Files to change:**

20. **`package.json`**
    - `"name": "cityfirstfoods-app"` → `"name": "kag-qrcode"`

21. **`src/components/dashboard/AppSidebar.tsx`**
    - `"Cityfirstfoods"` → `"KAG"` (brand name)
    - `"Management Portal"` → `"QR Management Portal"`
    - Logo: replace `/Logo.png` reference with KAG logo asset

22. **`src/app/page.tsx`** + **`src/app/e/[id]/page.tsx`**
    - Remove CityFirstFoods brand colors (#006443, #F16726)
    - Replace with KAG brand identity (neutral/gray palette)
    - Update tagline text

23. **Environment variables**
    - `NEXT_PUBLIC_APP_NAME` = `"KAG"`

24. **`public/` directory**
    - Add KAG logo files (replace CityFirstFoods assets)

---

## Implementation Order

```
Phase 1 (Foundation)  →  Phase 4 (Branding)  →  Phase 2 (Dashboard)  →  Phase 3 (Public)
```

Start with Foundation + Branding together since they are the smallest and will make subsequent phases coherent.

---

## Files NOT Changing

- All API routes (`src/app/api/**`) — logic untouched
- Database schema (`src/lib/schema.ts`) — untouched
- Auth config (`src/lib/auth.ts`) — untouched
- `ClickTracker` component — untouched
- `BackgroundVideo` component — may be removed from public pages (replacing dark-overlay design with light neumorphic)
- `drizzle.config.ts`, `docker-compose.yml`, `Dockerfile` — untouched

---

## Key Reusable Neumorphic Patterns (copy from kag-website)

```tsx
// Neumorphic card
const neuCard = {
  borderTop: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.5), 4px 4px 8px rgba(0,0,0,0.25), -4px -4px 8px rgba(255,255,255,0.9)',
};

// Neumorphic badge
const neuBadge = {
  background: '#f0f0f0',
  boxShadow: '3px 3px 6px rgba(0,0,0,0.09), -2px -2px 5px rgba(255,255,255,0.92)',
};

// Neumorphic input (inset)
const neuInput = {
  background: 'linear-gradient(145deg, #eeeeee, #d8d8d8)',
  boxShadow: 'inset 3px 3px 7px rgba(0,0,0,0.1), inset -3px -3px 7px rgba(255,255,255,0.9)',
};
```
