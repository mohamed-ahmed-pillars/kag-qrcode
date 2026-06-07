"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, QrCode, Loader2, ImageIcon } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  entityUrl: string;
  entityName: string;
}

type QRFormat = "png" | "branded";

export default function QRCodeModal({
  open,
  onClose,
  entityUrl,
  entityName,
}: Props) {
  const [format, setFormat] = useState<QRFormat>("branded");
  const [grayscale, setGrayscale] = useState(false);
  const [brandedLoading, setBrandedLoading] = useState(false);
  const [brandedSrc, setBrandedSrc] = useState<string | null>(null);
  const [brandedError, setBrandedError] = useState<string | null>(null);

  // Plain PNG src is deterministic — no loading state needed
  const plainSrc = open
    ? `/api/qrcode?url=${encodeURIComponent(entityUrl)}&format=png`
    : null;

  function brandedApiUrl() {
    return `/api/qrcode?url=${encodeURIComponent(entityUrl)}&format=branded&size=1024${grayscale ? "&grayscale=1" : ""}`;
  }

  // Branded QR: reload whenever format, grayscale, or entity changes
  useEffect(() => {
    if (!open || !entityUrl || format !== "branded") return;

    setBrandedLoading(true);
    setBrandedError(null);
    setBrandedSrc(null);

    fetch(brandedApiUrl())
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate branded QR");
        }
        const blob = await res.blob();
        setBrandedSrc(URL.createObjectURL(blob));
      })
      .catch((e: Error) => setBrandedError(e.message))
      .finally(() => setBrandedLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityUrl, format, grayscale]);

  // Reset branded state when entity changes
  useEffect(() => {
    setBrandedSrc(null);
    setBrandedError(null);
  }, [entityUrl]);

  const currentSrc = format === "branded" ? brandedSrc : plainSrc;
  const isLoading = format === "branded" && brandedLoading;

  function handleDownload() {
    const apiUrl = format === "branded"
      ? brandedApiUrl()
      : `/api/qrcode?url=${encodeURIComponent(entityUrl)}&format=png`;

    const slug = entityName.replace(/\s+/g, "-").toLowerCase();
    const suffix = grayscale ? "-bw" : "";
    const filename = format === "branded"
      ? `qrcode-branded${suffix}-${slug}.png`
      : `qrcode-${slug}.png`;

    const a = document.createElement("a");
    a.href = apiUrl;
    a.download = filename;
    a.click();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-1">
          <p className="text-sm text-muted-foreground text-center font-medium">
            {entityName}
          </p>

          {/* Format selector */}
          <Tabs
            value={format}
            onValueChange={(v) => setFormat(v as QRFormat)}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="branded" className="flex-1 gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Branded
              </TabsTrigger>
              <TabsTrigger value="png" className="flex-1 gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Plain
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* B&W toggle — only shown for branded */}
          {format === "branded" && (
            <div className="flex items-center gap-2 self-end">
              <Switch
                id="grayscale"
                checked={grayscale}
                onCheckedChange={setGrayscale}
              />
              <Label htmlFor="grayscale" className="text-xs text-muted-foreground cursor-pointer">
                Black &amp; White
              </Label>
            </div>
          )}

          {/* Preview area */}
          <div className="w-56 h-56 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-xs">Generating branded QR…</p>
              </div>
            ) : brandedError && format === "branded" ? (
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <p className="text-xs text-red-500">{brandedError}</p>
                <p className="text-xs text-muted-foreground">
                  Make sure a logo is at{" "}
                  <code className="text-xs">public/logo.png</code>
                </p>
              </div>
            ) : currentSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentSrc}
                alt="QR Code"
                className="w-56 h-56 rounded-xl object-contain border border-gray-100 shadow-sm"
              />
            ) : null}
          </div>

          {/* URL label */}
          <p className="text-[11px] text-muted-foreground break-all text-center max-w-full px-2 leading-relaxed">
            {entityUrl}
          </p>

          {/* Download */}
          <Button
            onClick={handleDownload}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isLoading || (format === "branded" && !!brandedError)}
          >
            <Download className="w-4 h-4 mr-2" />
            {format === "branded" ? "Download Branded PNG" : "Download Plain PNG"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
