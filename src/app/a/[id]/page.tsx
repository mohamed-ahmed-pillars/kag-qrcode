import { db } from "@/lib/db";
import { ads } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExternalLink, Calendar } from "lucide-react";
import ClickTracker from "@/components/public/ClickTracker";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await db.query.ads.findFirst({ where: eq(ads.id, id) });
  if (!ad) return { title: "Not Found" };
  return { title: ad.title, description: ad.description || "" };
}

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await db.query.ads.findFirst({ where: eq(ads.id, id) });

  if (!ad || !ad.active) notFound();

  // Check if ad is within date range
  const now = new Date();
  if (ad.endsAt && new Date(ad.endsAt) < now) notFound();

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <ClickTracker entityType="ad" entityId={id} />
      <main className="min-h-screen bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Hero Image */}
          {ad.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <span className="text-6xl">🎉</span>
            </div>
          )}

          {/* Content */}
          <div className="p-8 text-center">
            <div className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              PROMOTION
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{ad.title}</h1>

            {ad.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{ad.description}</p>
            )}

            {/* Dates */}
            {(ad.startsAt || ad.endsAt) && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                <Calendar className="w-4 h-4" />
                <span>
                  {ad.startsAt && `From ${formatDate(ad.startsAt)}`}
                  {ad.startsAt && ad.endsAt && " · "}
                  {ad.endsAt && `Until ${formatDate(ad.endsAt)}`}
                </span>
              </div>
            )}

            {/* CTA */}
            {ad.ctaUrl && (
              <a
                href={ad.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl py-4 px-6 transition-colors text-lg"
              >
                <ExternalLink className="w-5 h-5" />
                {ad.ctaText || "Claim Offer"}
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
