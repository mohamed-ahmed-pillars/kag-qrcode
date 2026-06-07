"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, PanInfo } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { getIcon } from "@/lib/icons";

const ICON_IMAGES: Record<string, string> = {
  whatsapp: "/WhatsApp.svg",
  "message-circle": "/WhatsApp.svg",
  instagram: "/Instagram_icon.svg",
  facebook: "/Facebook_icon.svg",
  globe: "/web_icon.svg",
  link: "/web_icon.svg",
};

const PLATFORM_STYLES: Record<string, { from: string; to: string; icon: string }> = {
  instagram: { from: "#833ab4", to: "#fd1d1d", icon: "#fff" },
  facebook: { from: "#1877f2", to: "#0d5bbf", icon: "#fff" },
  twitter: { from: "#1da1f2", to: "#0c85d0", icon: "#fff" },
  youtube: { from: "#ff0000", to: "#cc0000", icon: "#fff" },
  linkedin: { from: "#0077b5", to: "#005885", icon: "#fff" },
  whatsapp: { from: "#25d366", to: "#128c7e", icon: "#fff" },
  "message-circle": { from: "#25d366", to: "#128c7e", icon: "#fff" },
  phone: { from: "#34c759", to: "#248a3d", icon: "#fff" },
  mail: { from: "#ea4335", to: "#c5221f", icon: "#fff" },
  email: { from: "#ea4335", to: "#c5221f", icon: "#fff" },
  music: { from: "#fc3c44", to: "#c0392b", icon: "#fff" },
  "shopping-cart": { from: "#f97316", to: "#ea580c", icon: "#fff" },
  globe: { from: "#006443", to: "#004d34", icon: "#fff" },
  link: { from: "#64748b", to: "#475569", icon: "#fff" },
};

interface SocialLink {
  id: string;
  label: string;
  url: string;
  iconName: string | null;
}

interface Props {
  links: SocialLink[];
}

function SocialCard({
  link,
  position,
  handleShuffle,
}: {
  link: SocialLink;
  position: "front" | "middle" | "back" | "far";
  handleShuffle: (dir: "next" | "prev") => void;
}) {
  const isFront = position === "front";
  const key = (link.iconName || "link").toLowerCase();
  const style = PLATFORM_STYLES[key] || PLATFORM_STYLES.link;
  const imageSrc = ICON_IMAGES[key];
  const Icon = imageSrc ? null : getIcon(link.iconName);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) handleShuffle("next");
    else if (info.offset.x > swipeThreshold) handleShuffle("prev");
  };

  const handleClick = () => {
    if (!isFront) return;
    fetch(`/api/track/social_link/${link.id}`, { method: "POST" }).catch(() => {});
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? 3 : position === "middle" ? 2 : position === "back" ? 1 : 0,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "2px solid rgba(255,255,255,0.15)",
        position: "absolute",
        left: 0,
        top: 0,
        width: "160px",
        height: "230px",
        borderRadius: "20px",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        userSelect: "none",
      }}
      animate={{
        rotate: position === "front" ? "-9deg" : position === "middle" ? "-3deg" : position === "back" ? "3deg" : "9deg",
        x: position === "front" ? 0 : position === "middle" ? 55 : position === "back" ? 110 : 165,
        y: position === "front" ? 0 : position === "middle" ? -6 : position === "back" ? -10 : -6,
      }}
      drag={isFront}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      transition={{ duration: 0.800 }}
      className={isFront ? "cursor-grab active:cursor-grabbing" : ""}
    >
      {/* Icon */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{ background: `${style.from}33` }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={key}
              width={32}
              height={32}
              className="object-contain"
              style={key === "globe" || key === "link" ? { filter: "invert(1)" } : undefined}
            />
          ) : Icon ? (
            <Icon style={{ color: style.from, width: 32, height: 32 }} strokeWidth={1.5} />
          ) : null}
        </div>
      </div>

      {/* Label */}
      <div className="w-full">
        <p className="text-center text-sm font-bold mb-3 text-white">
          {link.label}
        </p>
        <div
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <span className="text-sm font-semibold text-white">Visit</span>
          <ExternalLink style={{ color: "#fff", width: 14, height: 14 }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function SocialCarousel({ links }: Props) {
  const [order, setOrder] = useState<number[]>(links.map((_, i) => i));

  if (links.length === 0) {
    return <p className="text-white/40 text-sm text-center py-10">No links available yet.</p>;
  }

  const handleShuffle = (dir: "next" | "prev") => {
    setOrder((prev) => {
      const next = [...prev];
      if (dir === "next") next.push(next.shift()!);
      else next.unshift(next.pop()!);
      return next;
    });
  };

  const positionMap: Record<number, "front" | "middle" | "back" | "far"> = {
    0: "front",
    1: "middle",
    2: "back",
    3: "far",
  };

  return (
    <div className="flex flex-col items-center gap-8 pb-8">
      {/* Shuffle card stack */}
      <div className="relative" style={{ height: "230px", width: "325px" }}>
        {order.slice(0, 4).map((linkIndex, pos) => (
          <SocialCard
            key={links[linkIndex].id}
            link={links[linkIndex]}
            position={positionMap[pos]}
            handleShuffle={handleShuffle}
          />
        ))}
      </div>

      {/* Swipe hint + dots */}
      <div className="flex flex-col items-center gap-3">
        <span style={{ color: '#F16726' }}>← swipe to Switch </span>
        <div className="flex gap-2">
          {links.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: order[0] === i ? "20px" : "6px",
                height: "6px",
                background: order[0] === i ? "#F16726" : "#006443",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
