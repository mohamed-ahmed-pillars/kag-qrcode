# Neumorphic Social Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken social-card component with a clean neumorphic social card showing DB-driven platform links as raised pill rows on a light `#f5f5f5` card.

**Architecture:** A single `"use client"` component at `src/components/ui/social-card.tsx` receives plain serializable `{ id, label, url, iconName }[]` props from the server page. All icon resolution and click handling happen client-side. The component uses the existing `.neu-card` and `.neu-raised` CSS utilities already defined in `globals.css`.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS, TypeScript, Bun, lucide-react, next/image, `@/lib/icons` (getIcon, ICON_IMAGE_MAP)

---

### Task 1: Replace `social-card.tsx` with neumorphic component

**Files:**
- Replace: `src/components/ui/social-card.tsx`

**Step 1: Write this exact file**

```tsx
"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getIcon, ICON_IMAGE_MAP } from "@/lib/icons";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  facebook: "#1877f2",
  twitter: "#1da1f2",
  whatsapp: "#25d366",
  "message-circle": "#25d366",
  globe: "#006443",
  link: "#64748b",
  youtube: "#ff0000",
  linkedin: "#0077b5",
  phone: "#34c759",
  mail: "#ea4335",
  email: "#ea4335",
};

interface SocialLink {
  id: string;
  label: string;
  url: string;
  iconName: string | null;
}

export default function SocialCard({ links }: { links: SocialLink[] }) {
  const handleClick = (link: SocialLink) => {
    try {
      const parsed = new URL(link.url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
    } catch {
      return;
    }
    fetch(`/api/track/social_link/${link.id}`, { method: "POST" }).catch(() => {});
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="neu-card rounded-3xl p-5 w-72">
      {links.map((link) => {
        const key = (link.iconName ?? "link").toLowerCase();
        const color = PLATFORM_COLORS[key] ?? "#64748b";
        const imageSrc = ICON_IMAGE_MAP[key];
        const Icon = imageSrc ? null : getIcon(link.iconName);

        return (
          <button
            key={link.id}
            onClick={() => handleClick(link)}
            aria-label={link.label}
            className="neu-raised w-full flex items-center gap-4 rounded-2xl px-4 py-3 mb-3 last:mb-0 cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}22` }}
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={link.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              ) : Icon ? (
                <Icon style={{ color, width: 22, height: 22 }} strokeWidth={1.5} />
              ) : null}
            </div>

            <span className="flex-1 text-left text-sm font-semibold text-gray-700">
              {link.label}
            </span>

            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
```

**Step 2: Type-check**

Run: `bunx tsc --noEmit`
Expected: no output (zero errors)

**Step 3: Commit**

```bash
git add src/components/ui/social-card.tsx
git commit -m "feat: neumorphic social card with raised pill rows"
```

---

### Task 2: Update `page.tsx` to use the new component

**Files:**
- Replace: `src/app/page.tsx`

**Step 1: Write this exact file**

```tsx
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import Image from "next/image";
import SocialCard from "@/components/ui/social-card";
import BackgroundVideo from "@/components/public/BackgroundVideo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const links = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.active, true))
    .orderBy(asc(socialLinks.displayOrder));

  return (
    <main
      className="min-h-screen relative flex flex-col items-center overflow-x-hidden"
      style={{ fontFamily: '"Capriola", sans-serif' }}
    >
      <BackgroundVideo src="/5538178-uhd_4096_2160_25fps.mp4" />
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)", zIndex: 1 }} />

      <div className="relative z-10 w-full py-14 flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 px-4">
          <div className="relative mb-5 w-72 h-32">
            <Image src="/main-logo.png" alt="KAG" fill className="object-contain" priority />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: '"Co Headline", sans-serif' }}
          >
            KAG
          </h1>
          <p className="mt-1.5 text-sm text-white/60">Egypt's Trusted Food Export Partner</p>
          <div className="mt-5 flex items-center gap-2">
            <span className="w-6 h-px bg-white/20" />
            <span
              className="text-xs font-bold tracking-widest text-white/70"
              style={{ fontFamily: '"Co Headline", sans-serif' }}
            >
              CONNECT WITH US
            </span>
            <span className="w-6 h-px bg-white/20" />
          </div>
        </div>

        {/* Social Card */}
        <SocialCard links={links} />

        <footer className="mt-14" />
      </div>
    </main>
  );
}
```

**Step 2: Type-check**

Run: `bunx tsc --noEmit`
Expected: no output

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: use neumorphic SocialCard on main public page"
```
