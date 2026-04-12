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
          <p className="mt-1.5 text-sm text-white/60">Egypt&apos;s Trusted Food Export Partner</p>
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
