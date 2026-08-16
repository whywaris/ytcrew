"use client";

import * as React from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Download,
  Sliders,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  Maximize2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 720;

type FitMode = "cover" | "contain" | "blur-contain" | "stretch";

export function YouTubeThumbnailResizer() {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = React.useState<string>("");
  const [originalDimensions, setOriginalDimensions] = React.useState<{ w: number; h: number } | null>(
    null
  );
  const [fitMode, setFitMode] = React.useState<FitMode>("cover");
  const [bgColor, setBgColor] = React.useState<string>("#000000");
  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg">("png");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const loadedImageRef = React.useRef<HTMLImageElement | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size exceeds 20MB. Please choose a smaller image.");
      return;
    }

    setOriginalFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ w: img.width, h: img.height });
        loadedImageRef.current = img;
        setImageSrc(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const renderCanvas = React.useCallback(
    (targetCanvas: HTMLCanvasElement) => {
      const ctx = targetCanvas.getContext("2d");
      if (!ctx || !loadedImageRef.current) return;

      const img = loadedImageRef.current;
      targetCanvas.width = THUMBNAIL_WIDTH;
      targetCanvas.height = THUMBNAIL_HEIGHT;

      if (fitMode === "blur-contain") {
        // Draw blurred background
        ctx.save();
        ctx.filter = "blur(30px) brightness(0.7)";
        ctx.drawImage(img, -20, -20, THUMBNAIL_WIDTH + 40, THUMBNAIL_HEIGHT + 40);
        ctx.restore();

        // Draw contained sharp image in center
        const hRatio = THUMBNAIL_WIDTH / img.width;
        const vRatio = THUMBNAIL_HEIGHT / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (THUMBNAIL_WIDTH - img.width * ratio) / 2;
        const centerShiftY = (THUMBNAIL_HEIGHT - img.height * ratio) / 2;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      } else if (fitMode === "contain") {
        // Solid background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

        const hRatio = THUMBNAIL_WIDTH / img.width;
        const vRatio = THUMBNAIL_HEIGHT / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (THUMBNAIL_WIDTH - img.width * ratio) / 2;
        const centerShiftY = (THUMBNAIL_HEIGHT - img.height * ratio) / 2;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      } else if (fitMode === "stretch") {
        ctx.drawImage(img, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      } else {
        // "cover" mode (Crop to fill 1280x720 16:9)
        const hRatio = THUMBNAIL_WIDTH / img.width;
        const vRatio = THUMBNAIL_HEIGHT / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (THUMBNAIL_WIDTH - img.width * ratio) / 2;
        const centerShiftY = (THUMBNAIL_HEIGHT - img.height * ratio) / 2;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
      }
    },
    [bgColor, fitMode]
  );

  React.useEffect(() => {
    if (previewCanvasRef.current && imageSrc) {
      renderCanvas(previewCanvasRef.current);
    }
  }, [imageSrc, fitMode, bgColor, renderCanvas]);

  const handleDownload = () => {
    if (!loadedImageRef.current) return;
    setIsProcessing(true);

    try {
      const exportCanvas = document.createElement("canvas");
      renderCanvas(exportCanvas);

      const mimeType = exportFormat === "png" ? "image/png" : "image/jpeg";
      const dataUrl = exportCanvas.toDataURL(mimeType, 0.95);

      const link = document.createElement("a");
      const baseName = originalFileName.replace(/\.[^/.]+$/, "") || "youtube-thumbnail";
      link.download = `${baseName}-thumbnail-1280x720.${exportFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to download image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setOriginalFileName("");
    setOriginalDimensions(null);
    loadedImageRef.current = null;
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>YouTube Thumbnail Resizer (1280 × 720)</span>
          </CardTitle>
          <CardDescription>
            Crop and resize any screenshot, photo, or graphic to YouTube&apos;s exact 1280 × 720 HD standard with 16:9 ratio and under 2MB file optimization.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!imageSrc ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 bg-secondary/20 hover:bg-secondary/30 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Click to upload or drag & drop image
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PNG, JPG, or WEBP (Max 20MB). Auto-crops to 1280 × 720 px (16:9).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Settings Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
                {/* Fit Mode */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Scaling Method</span>
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as FitMode)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="cover">Cover (Smart Crop to 16:9)</option>
                    <option value="blur-contain">Blur Padding (Modern Aesthetic)</option>
                    <option value="contain">Color Padding (Letterbox)</option>
                    <option value="stretch">Stretch (Fit Exactly)</option>
                  </select>
                </div>

                {/* Color if contain */}
                {fitMode === "contain" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Letterbox Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-12 rounded cursor-pointer border border-input bg-transparent"
                      />
                      <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Export Format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as "png" | "jpeg")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="png">PNG (High Quality)</option>
                      <option value="jpeg">JPG (Web Optimized)</option>
                    </select>
                  </div>
                )}

                {/* Format selector when contain is chosen */}
                {fitMode === "contain" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Export Format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as "png" | "jpeg")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="png">PNG (High Quality)</option>
                      <option value="jpeg">JPG (Web Optimized)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Canvas Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Original: {originalDimensions?.w} × {originalDimensions?.h} px
                    </span>
                  </span>
                  <span className="font-semibold text-foreground">
                    Output: 1280 × 720 px (16:9 Standard)
                  </span>
                </div>

                <div className="relative w-full rounded-xl overflow-hidden border border-border bg-black shadow-lg">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full h-auto block"
                    style={{ aspectRatio: "16 / 9" }}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions Row */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download 1280 × 720 Thumbnail ({exportFormat.toUpperCase()})</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Upload Different Image</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
