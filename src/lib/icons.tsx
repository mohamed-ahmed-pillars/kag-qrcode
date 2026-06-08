import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Music,
  ShoppingCart,
  Link,
  Linkedin,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  globe: Globe,
  phone: Phone,
  mail: Mail,
  email: Mail,
  "message-circle": MessageCircle,
  whatsapp: MessageCircle,
  music: Music,
  "shopping-cart": ShoppingCart,
  link: Link,
  linkedin: Linkedin,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Link;
  return ICON_MAP[name.toLowerCase()] || Link;
}

// Brand SVG icons from /public/icons (keyed by iconName)
export const ICON_IMAGE_MAP: Record<string, string> = {
  facebook: "/icons/facebook.svg",
  instagram: "/icons/instagram.svg",
  whatsapp: "/icons/whatsapp.svg",
  "message-circle": "/icons/whatsapp.svg",
  mail: "/icons/maildotru.svg",
  email: "/icons/maildotru.svg",
  globe: "/web_icon.svg",
};

export const AVAILABLE_ICONS = [
  { name: "instagram", label: "Instagram" },
  { name: "facebook", label: "Facebook" },
  { name: "twitter", label: "Twitter / X" },
  { name: "youtube", label: "YouTube" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "globe", label: "Website" },
  { name: "phone", label: "Phone" },
  { name: "mail", label: "Email" },
  { name: "message-circle", label: "WhatsApp" },
  { name: "music", label: "Music" },
  { name: "shopping-cart", label: "Shop" },
  { name: "link", label: "Link" },
];
