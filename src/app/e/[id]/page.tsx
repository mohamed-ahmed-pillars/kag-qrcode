import { db } from "@/lib/db";
import { employees } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { ActionLink } from "@/lib/schema";
import ClickTracker from "@/components/public/ClickTracker";
import BackgroundVideo from "@/components/public/BackgroundVideo";
import SocialCarousel from "@/components/public/SocialCarousel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await db.query.employees.findFirst({ where: eq(employees.id, id) });
  if (!employee) return { title: "Not Found" };
  return { title: employee.name, description: employee.title || "" };
}

// Map action link type → iconName used by SocialCarousel
const TYPE_TO_ICON: Record<ActionLink["type"], string> = {
  phone: "phone",
  whatsapp: "message-circle",
  email: "mail",
  website: "globe",
  instagram: "instagram",
  other: "link",
};

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await db.query.employees.findFirst({ where: eq(employees.id, id) });

  if (!employee || !employee.active) notFound();

  const actionLinks = (employee.actionLinks as ActionLink[]) || [];

  // Convert action links to the format SocialCarousel expects
  const carouselLinks = actionLinks.map((link, i) => ({
    id: `${id}-action-${i}`,
    label: link.label,
    url: link.url,
    iconName: TYPE_TO_ICON[link.type] || "link",
  }));

  return (
    <>
      <ClickTracker entityType="employee" entityId={id} />
      <main
        className="min-h-screen relative flex flex-col items-center overflow-x-hidden"
        style={{ background: "#ffffff", fontFamily: '"Capriola", sans-serif' }}
      >
        {/* Background video */}
        <BackgroundVideo src="/5538178-uhd_4096_2160_25fps.mp4" />

        {/* Black overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", zIndex: 1 }} />

        {/* Content */}
        <div className="relative z-10 w-full py-14 flex flex-col items-center">

          {/* Logo & Brand */}
          <div className="flex flex-col items-center mb-10 px-4">
            <div className="relative mb-5 w-72 h-32">
              <Image
                src="/main-logo.png"
                alt="KAG"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: '"Co Headline", sans-serif' }}>KAG</h2>
            <p className="mt-1.5 text-sm text-gray-300">Egypt's Trusted Food Export Partner</p>
            <div className="mt-5 flex items-center gap-2">
              <span className="w-6 h-px bg-white/20" />
              <span className="text-base font-bold tracking-widest text-white/80" style={{ fontFamily: '"Co Headline", sans-serif' }}>OUR TEAM</span>
              <span className="w-6 h-px bg-white/20" />
            </div>
          </div>

          {/* Employee profile card */}
          <div
            className="w-full max-w-sm rounded-2xl flex flex-col items-center overflow-hidden mb-5 pt-8"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "2px solid rgba(255,255,255,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Colored header stri
            p
            <div
              className="w-full h-24 relative"
              style={{ background: "linear-gradient(135deg, #006443 0%, #F16726 100%)" }}
            /> */}

            {/* Avatar */}
            <div className="mb-4">
              {employee.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={employee.photoUrl}
                  alt={employee.name}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{ border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #006443, #F16726)", border: "3px solid rgba(255,255,255,0.3)" }}
                >
                  <span className="text-white text-3xl font-bold">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name + title + bio */}
            <div className="px-6 pb-6 text-center">
              <h1 className="text-xl font-bold text-white">{employee.name}</h1>
              {employee.title && (
                <p className="text-sm mt-1" style={{ color: "#006443" }}>{employee.title}</p>
              )}
              {employee.bio && (
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "#F16726" }}>
                  {employee.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action links as shuffle cards */}
          {carouselLinks.length > 0 && (
            <div className="w-full" style={{ marginTop: "16px" }}>
              <p
                className="text-center text-xs font-semibold tracking-widest mb-6"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                CONNECT
              </p>
              <SocialCarousel links={carouselLinks} />
            </div>
          )}

        </div>
      </main>
    </>
  );
}
