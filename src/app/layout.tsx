import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../../public/fonts/Headline English/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Headline English/Poppins-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../public/fonts/Headline English/Poppins-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/Headline English/Poppins-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Headline English/Poppins-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/Headline English/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Headline English/Poppins-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../public/fonts/Headline English/Poppins-Black.ttf", weight: "900", style: "normal" },
    { path: "../../public/fonts/Headline English/Poppins-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
});

const outfit = localFont({
  variable: "--font-outfit",
  display: "swap",
  src: [
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Body Text_Eng/Outfit/Outfit-Black.ttf", weight: "900", style: "normal" },
  ],
});

const notoArabic = localFont({
  variable: "--font-noto-arabic",
  display: "swap",
  src: [
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/Noto Sans/NotoSansArabic-Black.ttf", weight: "900", style: "normal" },
  ],
});

const handicrafts = localFont({
  variable: "--font-handicrafts",
  display: "swap",
  src: [
    { path: "../../public/fonts/Headline Arabic/TheYearofHandicrafts-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Headline Arabic/TheYearofHandicrafts-Medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Headline Arabic/TheYearofHandicrafts-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Headline Arabic/TheYearofHandicrafts-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Headline Arabic/TheYearofHandicrafts-Black.otf", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "KAG — Khalid Abdelhamid Group | Egyptian Food Manufacturer",
  description:
    "KAG (Khalid Abdelhamid Group) is an Egyptian food manufacturer producing sauces, jams, juices, fava beans, and condiments for retail, private label, and global export from Cairo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${outfit.variable} ${notoArabic.variable} ${handicrafts.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
