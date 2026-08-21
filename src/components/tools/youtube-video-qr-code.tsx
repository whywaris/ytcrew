"use client";

import * as React from "react";
import QRCode from "qrcode";
import { z } from "zod";
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Sliders,
  Palette,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const YOUTUBE_URL_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|channel\/|@))([\w-]{1,100})/;

const formSchema = z.object({
  url: z
    .string()
    .min(1, "Please enter a YouTube video, Short, or channel URL.")
    .refine((val) => {
      const trimmed = val.trim();
      return (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("youtu") ||
        trimmed.startsWith("youtube")
      );
    }, "Please enter a valid YouTube link (e.g. https://youtu.be/dQw4w9WgXcQ)."),
});

export function YouTubeVideoQrCode() {
  const [url, setUrl] = React.useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
  const [size, setSize] = React.useState<number>(320);
  const [darkColor, setDarkColor] = React.useState<string>("#000000");
  const [lightColor, setLightColor] = React.useState<string>("#FFFFFF");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = React.useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Generate QR code on state change
  const generateQr = React.useCallback(async () => {
    if (!url.trim()) return;

    try {
      const dataUrl = await QRCode.toDataURL(url.trim(), {
        width: size,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel,
      });
      setQrDataUrl(dataUrl);
      setError(null);
    } catch (err) {
      console.error("[QRCode Error]:", err);
      setError("Failed to render QR Code.");
    }
  }, [url, size, darkColor, lightColor, errorCorrectionLevel]);

  React.useEffect(() => {
    generateQr();
  }, [generateQr]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `youtube-qr-code-${Date.now()}.png`;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls & Configuration */}
      <Card className="border border-border/80 bg-card/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            YouTube Video QR Code Generator
          </CardTitle>
          <CardDescription>
            Generate high-resolution, scannable QR codes for your YouTube videos, Shorts, live streams, or channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">YouTube Video / Channel URL</label>
            <Input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-background/80 border-input h-11 text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/40">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-primary" /> Image Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-input bg-background/80 px-3 text-xs focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <option value={200}>Small (200 x 200 px)</option>
                <option value={320}>Medium (320 x 320 px)</option>
                <option value={512}>Large (512 x 512 px)</option>
                <option value={1024}>Ultra HD (1024 x 1024 px)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" /> Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="h-9 w-10 rounded border border-input bg-transparent cursor-pointer p-0.5"
                />
                <Input
                  type="text"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" /> Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="h-9 w-10 rounded border border-input bg-transparent cursor-pointer p-0.5"
                />
                <Input
                  type="text"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" /> Error Correction
              </label>
              <select
                value={errorCorrectionLevel}
                onChange={(e) => setErrorCorrectionLevel(e.target.value as "L" | "M" | "Q" | "H")}
                className="w-full h-9 rounded-md border border-input bg-background/80 px-3 text-xs focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <option value="L">Low (7% recovery)</option>
                <option value="M">Medium (15% recovery)</option>
                <option value="Q">Quartile (25% recovery)</option>
                <option value="H">High (30% recovery)</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* QR Code Output Card */}
      {qrDataUrl && (
        <Card className="border border-border bg-card/90 shadow-md overflow-hidden animate-in fade-in-50 duration-300">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Scannable QR Code Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8 text-xs cursor-pointer border-border hover:border-primary/50"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Copied URL
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 text-xs cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download PNG
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center space-y-6">
            {/* Rendered QR Image */}
            <div className="p-4 rounded-2xl bg-white shadow-lg border border-border/80 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="YouTube QR Code"
                className="max-w-[280px] max-h-[280px] w-full h-auto object-contain rounded"
              />
            </div>

            <div className="text-center space-y-1 max-w-sm">
              <p className="text-xs font-semibold text-foreground">Scan with any smartphone camera</p>
              <p className="text-xs text-muted-foreground font-mono truncate">{url}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
