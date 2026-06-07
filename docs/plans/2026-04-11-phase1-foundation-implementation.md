# Phase 1 — Foundation (Neumorphic UI) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Cityfirstfoods orange/dark theme with KAG's neumorphic design system across CSS variables and the five primitive shadcn components (Card, Button, Input, Badge, and global CSS utility classes).

**Architecture:** All neumorphic shadow values are defined once in `globals.css` as utility classes (`.neu-card`, `.neu-raised`, `.neu-inset`, `.neu-badge`). Component files reference these class names — no inline styles needed in components. CSS variables are updated so the entire app background, card surfaces, and sidebar switch to the `#f5f5f5` neumorphic palette.

**Tech Stack:** Next.js 16, Tailwind v4, shadcn/ui (CVA), TypeScript

---

## Task 1: Update CSS variables and add neumorphic utility classes

**Files:**
- Modify: `src/app/globals.css`

**What to do:**

Replace the entire `:root` block and `.dark` block, add four neumorphic utility classes, and update `@layer base` body styles.

**Step 1: Replace `:root` block**

Find and replace the whole `:root { ... }` block (lines 73–109) with:

```css
:root {
  --radius: 0.75rem;

  /* ── Neumorphic palette ── */
  --background: #f5f5f5;
  --foreground: oklch(0.145 0 0);
  --card: #f5f5f5;
  --card-foreground: oklch(0.145 0 0);
  --popover: #f5f5f5;
  --popover-foreground: oklch(0.145 0 0);

  /* Primary = dark gray (KAG dark action button) */
  --primary: oklch(0.145 0 0);
  --primary-foreground: oklch(1 0 0);

  --secondary: #ebebeb;
  --secondary-foreground: oklch(0.205 0 0);
  --muted: #ebebeb;
  --muted-foreground: oklch(0.50 0 0);
  --accent: #e0e0e0;
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);

  --border: rgba(0, 0, 0, 0.08);
  --input: #ebebeb;
  --ring: oklch(0.4 0 0);

  /* Chart — neutral grays */
  --chart-1: oklch(0.30 0 0);
  --chart-2: oklch(0.45 0 0);
  --chart-3: oklch(0.60 0 0);
  --chart-4: oklch(0.70 0 0);
  --chart-5: oklch(0.82 0 0);

  /* Sidebar — light neumorphic */
  --sidebar: #ebebeb;
  --sidebar-foreground: oklch(0.205 0 0);
  --sidebar-primary: oklch(0.145 0 0);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: #e0e0e0;
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: rgba(0, 0, 0, 0.06);
  --sidebar-ring: oklch(0.4 0 0);
}
```

**Step 2: Delete the entire `.dark { ... }` block (lines 111–143)**

The KAG design is light-only. Remove it entirely.

**Step 3: Remove the `@custom-variant dark` line (line 26)**

Delete:
```css
@custom-variant dark (&:is(.dark *));
```

**Step 4: Add neumorphic utility classes**

Add these after the `.scrollbar-hide` block (after line 161):

```css
/* ── Neumorphic shadows ── */

/* Raised card (used by Card component and large surfaces) */
.neu-card {
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 8px 16px -4px rgba(0, 0, 0, 0.35),
    inset 0 2px 0 rgba(255, 255, 255, 0.5),
    4px 4px 8px rgba(0, 0, 0, 0.25),
    -4px -4px 8px rgba(255, 255, 255, 0.9);
}

/* Convex button / small raised element */
.neu-raised {
  box-shadow:
    4px 4px 8px rgba(0, 0, 0, 0.12),
    -3px -3px 8px rgba(255, 255, 255, 0.9);
  transition: box-shadow 0.15s ease, transform 0.1s ease;
}
.neu-raised:hover {
  box-shadow:
    5px 5px 10px rgba(0, 0, 0, 0.15),
    -4px -4px 10px rgba(255, 255, 255, 0.95);
}
.neu-raised:active {
  box-shadow:
    inset 2px 2px 5px rgba(0, 0, 0, 0.1),
    inset -2px -2px 5px rgba(255, 255, 255, 0.9);
  transform: scale(0.98);
}

/* Inset input / pressed surface */
.neu-inset {
  background: linear-gradient(145deg, #eeeeee, #d8d8d8);
  box-shadow:
    inset 3px 3px 7px rgba(0, 0, 0, 0.1),
    inset -3px -3px 7px rgba(255, 255, 255, 0.9);
}

/* Small badge / pill */
.neu-badge {
  background: #f0f0f0;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.09),
    -2px -2px 5px rgba(255, 255, 255, 0.92);
}
```

**Step 5: Verify the build compiles**

```bash
cd /Users/mohamed/MyData/Work/TechnologyPillars/Customers/KAG/kag-qrcode
npm run dev
```

Expected: server starts on `http://localhost:3000` with no CSS errors.

**Step 6: Commit**

```bash
cd /Users/mohamed/MyData/Work/TechnologyPillars/Customers/KAG/kag-qrcode
git add src/app/globals.css
git commit -m "style: replace CityFirstFoods theme with KAG neumorphic CSS variables and utilities"
```

---

## Task 2: Neumorphic Card component

**Files:**
- Modify: `src/components/ui/card.tsx`

**What to do:**

The Card is used across the entire dashboard. Replace `border shadow-sm rounded-xl` with `neu-card rounded-3xl`. No other changes.

**Step 1: Edit the `Card` function**

Replace:
```tsx
className={cn(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
  className
)}
```

With:
```tsx
className={cn(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-3xl neu-card py-6",
  className
)}
```

**Step 2: Visual check**

Open `http://localhost:3000/dashboard` in the browser.

Expected: stat cards and chart card show raised neumorphic shadow on the `#f5f5f5` background. No orange gradients.

**Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "style: neumorphic Card — replace border/shadow with neu-card rounded-3xl"
```

---

## Task 3: Neumorphic Button component

**Files:**
- Modify: `src/components/ui/button.tsx`

**What to do:**

Update the CVA variants. `default` becomes the neumorphic dark pill (KAG's primary action style). `outline` and `secondary` become neumorphic convex on the light background. Ghost and link stay minimal.

**Step 1: Replace the `buttonVariants` cva call**

Replace the entire `const buttonVariants = cva(...)` (lines 7–39) with:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
  {
    variants: {
      variant: {
        // Dark pill — KAG primary action (matches FlowButton solid from kag-website)
        default:
          "bg-gray-900 text-white rounded-xl neu-raised",
        destructive:
          "bg-destructive text-white rounded-xl neu-raised hover:bg-destructive/90",
        // Raised light surface
        outline:
          "bg-[#f5f5f5] text-gray-700 rounded-xl neu-raised border-0",
        secondary:
          "bg-[#ebebeb] text-gray-700 rounded-xl neu-raised",
        ghost:
          "text-gray-700 rounded-xl hover:bg-[#ebebeb]",
        link: "text-gray-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Step 2: Visual check**

Open `http://localhost:3000/login`.

Expected: the "Sign In" button is dark gray with a subtle raised shadow. No orange.

Open `http://localhost:3000/dashboard/products` and check action buttons.

**Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "style: neumorphic Button — dark default, neu-raised convex variants"
```

---

## Task 4: Neumorphic Input component

**Files:**
- Modify: `src/components/ui/input.tsx`

**What to do:**

Replace the flat border input with an inset neumorphic field. The inset look signals "you can type here" in the neumorphic language.

**Step 1: Replace the className in `Input`**

Replace the entire `className={cn(...)}` block with:

```tsx
className={cn(
  "w-full min-w-0 rounded-2xl px-3 py-1 text-base text-gray-800 neu-inset border-0 outline-none",
  "placeholder:text-gray-400",
  "h-9 md:text-sm",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  "focus-visible:ring-2 focus-visible:ring-gray-400/40",
  "aria-invalid:ring-2 aria-invalid:ring-destructive/40",
  className
)}
```

**Step 2: Visual check**

Open `http://localhost:3000/login`.

Expected: email and password inputs appear recessed/inset with gradient background. No flat border.

Open `http://localhost:3000/dashboard/products` → click "Add Product" or edit modal.

Expected: all form inputs are inset neumorphic.

**Step 3: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "style: neumorphic Input — inset shadow, no border"
```

---

## Task 5: Neumorphic Badge component

**Files:**
- Modify: `src/components/ui/badge.tsx`

**What to do:**

The `default` variant (used for category labels, role badges) gets the neumorphic pill look. `outline` becomes the neumorphic badge style (matching KAG's `IllustrationBadge`).

**Step 1: Replace `badgeVariants` cva call**

Replace the entire `const badgeVariants = cva(...)` block with:

```tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Neumorphic pill — used for categories, status
        default:
          "bg-gray-900 text-white",
        secondary:
          "neu-badge text-gray-600",
        destructive:
          "bg-destructive text-white",
        // Neumorphic soft badge — matching KAG IllustrationBadge
        outline:
          "neu-badge text-gray-600 border-0",
        ghost:
          "text-gray-600 hover:bg-[#ebebeb]",
        link: "text-gray-900 underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

**Step 2: Visual check**

Open `http://localhost:3000/p/<any-product-id>` (or seed the DB first).

Open `http://localhost:3000/dashboard` → check the "Live data" badge top-right.

Expected: badges look like soft neumorphic pills, not orange/colored chips.

Open `http://localhost:3000/dashboard/users` → role badges should be neumorphic.

**Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "style: neumorphic Badge — neu-badge outline, dark default pill"
```

---

## Done — Phase 1 Complete

After all 5 tasks are committed, the entire foundation is neumorphic:

- Global background: `#f5f5f5`
- Sidebar background: `#ebebeb` (light)
- Cards: raised neumorphic shadow
- Buttons: dark pill (primary) or raised light (secondary/outline)
- Inputs: inset neumorphic
- Badges: soft pill shadow

**Next phases:** Phase 4 (Branding) → Phase 2 (Dashboard screens) → Phase 3 (Public pages).
