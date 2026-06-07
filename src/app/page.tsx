import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import BackgroundVideo from "@/components/public/BackgroundVideo";
import { AnimatedAIChat, type SocialLink } from "@/components/ui/animated-ai-chat";

export const dynamic = "force-dynamic";

const FALLBACK_LINKS: SocialLink[] = [
  { id: "fb", label: "Facebook", url: "https://www.facebook.com/share/1DNJqy7Bou/?mibextid=wwXIfr", iconName: "facebook" },
  { id: "ig", label: "Instagram", url: "https://www.instagram.com/kag.egypt", iconName: "instagram" },
  { id: "li", label: "LinkedIn", url: "https://www.linkedin.com/company/kagegypt/", iconName: "linkedin" },
  { id: "wa", label: "WhatsApp", url: "https://wa.me/201033322050", iconName: "whatsapp" },
  { id: "mail", label: "E-mail", url: "mailto:wecare@kagegypt.com", iconName: "mail" },
];

export default async function HomePage() {
  let links: SocialLink[] = FALLBACK_LINKS;
  try {
    const rows = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.active, true))
      .orderBy(asc(socialLinks.displayOrder));
    if (rows.length > 0) links = rows;
  } catch {
    // DB unavailable — use FALLBACK_LINKS
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0B]">
      <BackgroundVideo src="/herovid.mp4" />
      <div
        className="absolute inset-0 bg-black/60 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      <section className="relative" style={{ zIndex: 2 }}>
        <AnimatedAIChat socialLinks={links} />
      </section>
    </main>
  );
}
