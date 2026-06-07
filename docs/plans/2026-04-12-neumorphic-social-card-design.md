# Neumorphic Social Card Design — 2026-04-12

## Goal

Replace the broken social-card component on the main public page with a clean neumorphic social card that fits the existing design system.

## Design

- Light `#f5f5f5` neumorphic card (~280px wide, rounded 24px) floating on the dark video background
- "CONNECT WITH US" label above the card in white
- Each active DB social link rendered as a `neu-raised` pill row: icon (colored) + label + chevron
- Hover: `neu-inset` press-down effect
- Dynamic: fetches links from DB ordered by displayOrder

## Files

- Replace: `src/components/ui/social-card.tsx` — new neumorphic component (client)
- Modify: `src/app/page.tsx` — use new component with DB links
- No new CSS needed — uses existing `.neu-card`, `.neu-raised`, `.neu-inset` from globals.css
