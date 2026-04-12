"use client";

import Image from "next/image";
import { getIcon, ICON_IMAGE_MAP } from "@/lib/icons";

const PLATFORM_STYLES: Record<string, { from: string; to: string }> = {
  instagram: { from: "#833ab4", to: "#fd1d1d" },
  facebook: { from: "#1877f2", to: "#0d5bbf" },
  twitter: { from: "#1da1f2", to: "#0c85d0" },
  youtube: { from: "#ff0000", to: "#cc0000" },
  linkedin: { from: "#0077b5", to: "#005885" },
  whatsapp: { from: "#25d366", to: "#128c7e" },
  "message-circle": { from: "#25d366", to: "#128c7e" },
  phone: { from: "#34c759", to: "#248a3d" },
  mail: { from: "#ea4335", to: "#c5221f" },
  email: { from: "#ea4335", to: "#c5221f" },
  music: { from: "#fc3c44", to: "#c0392b" },
  "shopping-cart": { from: "#f97316", to: "#ea580c" },
  globe: { from: "#006443", to: "#004d34" },
  link: { from: "#64748b", to: "#475569" },
};

const DELAYS = ["0ms", "200ms", "400ms", "600ms"];

interface SocialLink {
  id: string;
  label: string;
  url: string;
  iconName: string | null;
}

interface Props {
  links: SocialLink[];
  title?: string;
}

function SocialBox({
  link,
  delay,
}: {
  link: SocialLink;
  delay: string;
}) {
  const key = (link.iconName || "link").toLowerCase();
  const style = PLATFORM_STYLES[key] || PLATFORM_STYLES.link;
  const imageSrc = ICON_IMAGE_MAP[key];
  const Icon = imageSrc ? null : getIcon(link.iconName);

  const handleClick = () => {
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
    <button
      onClick={handleClick}
      aria-label={link.label}
      title={link.label}
      className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${style.from}cc, ${style.to}cc)`,
        transitionDelay: delay,
      }}
    >
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={link.label}
            width={40}
            height={40}
            className="object-contain drop-shadow"
          />
        ) : Icon ? (
          <Icon className="w-9 h-9 text-white drop-shadow" strokeWidth={1.5} />
        ) : null}
      </div>

      {/* Label */}
      <span className="text-white text-xs font-semibold tracking-wide truncate max-w-full">
        {link.label}
      </span>
    </button>
  );
}

function DecorativeBox({ delay }: { delay: string }) {
  return (
    <div
      className="rounded-2xl border border-white/10"
      style={{
        background: "rgba(255,255,255,0.04)",
        transitionDelay: delay,
      }}
    />
  );
}

export default function SocialCard({ links, title = "CONNECT WITH US" }: Props) {
  const slots = links.slice(0, 4);
  const decorativeCount = Math.max(0, 4 - slots.length);

  return (
    <div className="relative w-full max-w-xs mx-auto rounded-3xl overflow-hidden p-6"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(0,0,0,0.25)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-5">
        {/* Title */}
        <p className="text-center text-sm font-bold tracking-widest text-white/80">
          {title}
        </p>

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {slots.map((link, i) => (
            <SocialBox key={link.id} link={link} delay={DELAYS[i]} />
          ))}
          {Array.from({ length: decorativeCount }).map((_, i) => (
            <DecorativeBox key={`dec-${i}`} delay={DELAYS[slots.length + i] ?? "0ms"} />
          ))}
        </div>
      </div>
    </div>
  );
}
