import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { ProductImage } from "@/lib/schema";
import { ShoppingCart, ExternalLink } from "lucide-react";
import ClickTracker from "@/components/public/ClickTracker";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) return { title: "Not Found" };
  return { title: product.name, description: product.description || "" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.id, id) });

  if (!product || !product.active) notFound();

  const images = (product.images as ProductImage[]) || [];

  return (
    <>
      <ClickTracker entityType="product" entityId={id} />
      <main className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full overflow-hidden">
          {/* Image Gallery */}
          {images.length > 0 ? (
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].url}
                alt={images[0].alt || product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square w-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-orange-300" />
            </div>
          )}

          {/* Product Info */}
          <div className="p-6">
            {product.category && (
              <Badge variant="outline" className="mb-2 text-orange-600 border-orange-200">
                {product.category}
              </Badge>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

            {product.price && (
              <p className="text-xl font-semibold text-orange-600 mt-2">
                {product.currency || "USD"} {product.price}
              </p>
            )}

            {product.description && (
              <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
            )}

            {/* Additional images */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {images.slice(1).map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img.url}
                    alt={img.alt || `Image ${i + 2}`}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                  />
                ))}
              </div>
            )}

            {/* CTA */}
            {product.ctaUrl && (
              <a
                href={product.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl py-3 px-6 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {product.ctaText || "Order Now"}
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
