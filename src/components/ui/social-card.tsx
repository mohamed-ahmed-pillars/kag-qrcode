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
    let protocol: string;
    try {
      protocol = new URL(link.url).protocol;
    } catch {
      return;
    }
    const allowed = ["https:", "http:", "tel:", "mailto:"];
    if (!allowed.includes(protocol)) return;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(link.id);
    if (isUuid) {
      fetch(`/api/track/social_link/${link.id}`, { method: "POST" }).catch(() => { });
    }

    if (protocol === "tel:" || protocol === "mailto:") {
      window.location.href = link.url;
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="neu-card rounded-3xl p-5 w-72">
      {links.map((link, i) => {
        const key = (link.iconName ?? "link").toLowerCase();
        const color = PLATFORM_COLORS[key] ?? "#64748b";
        const imageSrc = ICON_IMAGE_MAP[key];
        const Icon = imageSrc ? null : getIcon(link.iconName);

        return (
          <button
            key={link.id}
            onClick={() => handleClick(link)}
            aria-label={link.label}
            className="social-row group neu-raised w-full flex items-center gap-4 rounded-2xl px-4 py-3 mb-3 last:mb-0 cursor-pointer"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="icon-bounce w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
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

            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        );
      })}
    </div>
  );
}
