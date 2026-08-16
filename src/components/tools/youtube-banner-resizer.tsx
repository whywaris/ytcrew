"use client";

import * as React from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  Maximize2,
  RefreshCw,
  Info,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BANNER_WIDTH = 2560;
const BANNER_HEIGHT = 1440;

// YouTube Official Safe Zone Dimensions
const SAFE_ZONE_WIDTH = 1546;
const SAFE_ZONE_HEIGHT = 423;
const DESKTOP_HEIGHT = 423;

export function YouTubeBannerResizer() {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = React.useState<string>("");
  const [originalDimensions, setOriginalDimensions] = React.useState<{ w: number; h: number } | null>(
    null
  );

  // Position & Zoom State (in 2560x1440 coordinate space)
  const [zoom, setZoom] = React.useState<number>(1);
  const [offsetX, setOffsetX] = React.useState<number>(0);
  const [offsetY, setOffsetY] = React.useState<number>(0);
  const [bgColor, setBgColor] = React.useState<string>("#0F0F13");
  const [showSafeZone, setShowSafeZone] = React.useState<boolean>(true);
  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg">("png");
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const loadedImageRef = React.useRef<HTMLImageElement | null>(null);
  const dragStartPosRef = React.useRef<{ x: number; y: number; startOffX: number; startOffY: number }>({
    x: 0,
    y: 0,
    startOffX: 0,
    startOffY: 0,
  });

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB. Please choose a smaller image.");
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
        // Reset zoom & pan to default centered cover
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
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

  /**
   * Render image and guides onto any target canvas
   */
  const drawBanner = React.useCallback(
    (targetCanvas: HTMLCanvasElement, includeGuides = false) => {
      const ctx = targetCanvas.getContext("2d");
      if (!ctx || !loadedImageRef.current) return;

      const img = loadedImageRef.current;
      targetCanvas.width = BANNER_WIDTH;
      targetCanvas.height = BANNER_HEIGHT;

      // 1. Fill background canvas
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

      // 2. Calculate aspect-preserving "cover" base scale + zoom multiplier
      const baseScale = Math.max(BANNER_WIDTH / img.width, BANNER_HEIGHT / img.height);
      const activeScale = baseScale * zoom;
      const drawnWidth = img.width * activeScale;
      const drawnHeight = img.height * activeScale;

      // Center with offsets
      const drawX = (BANNER_WIDTH - drawnWidth) / 2 + offsetX;
      const drawY = (BANNER_HEIGHT - drawnHeight) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawnWidth, drawnHeight);

      // 3. Draw YouTube Safe Zone Guideline Overlays
      if (includeGuides) {
        // Semi-transparent shading outside TV / Safe zones
        const deskY = (BANNER_HEIGHT - DESKTOP_HEIGHT) / 2;
        const safeX = (BANNER_WIDTH - SAFE_ZONE_WIDTH) / 2;
        const safeY = (BANNER_HEIGHT - SAFE_ZONE_HEIGHT) / 2;

        // Desktop Band (2560 x 423 px)
        ctx.fillStyle = "rgba(99, 102, 241, 0.12)";
        ctx.fillRect(0, deskY, BANNER_WIDTH, DESKTOP_HEIGHT);
        ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
        ctx.lineWidth = 4;
        ctx.strokeRect(0, deskY, BANNER_WIDTH, DESKTOP_HEIGHT);

        // Safe Area (Mobile & All Devices: 1546 x 423 px)
        ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
        ctx.fillRect(safeX, safeY, SAFE_ZONE_WIDTH, SAFE_ZONE_HEIGHT);
        ctx.strokeStyle = "rgba(34, 197, 94, 0.9)";
        ctx.lineWidth = 6;
        ctx.strokeRect(safeX, safeY, SAFE_ZONE_WIDTH, SAFE_ZONE_HEIGHT);

        // Crosshairs & Grid Center
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(BANNER_WIDTH / 2, safeY);
        ctx.lineTo(BANNER_WIDTH / 2, safeY + SAFE_ZONE_HEIGHT);
        ctx.moveTo(safeX, BANNER_HEIGHT / 2);
        ctx.lineTo(safeX + SAFE_ZONE_WIDTH, BANNER_HEIGHT / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Informative Labels
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fillText(
          "📱 Mobile & Text Safe Zone (1546 × 423 px)",
          BANNER_WIDTH / 2,
          BANNER_HEIGHT / 2 + 10
        );

        ctx.font = "bold 26px Inter, sans-serif";
        ctx.fillText("💻 Desktop Max Band (2560 × 423 px)", BANNER_WIDTH / 2, deskY + 38);

        ctx.font = "bold 28px Inter, sans-serif";
        ctx.fillText("📺 Smart TV Display (2560 × 1440 px)", BANNER_WIDTH / 2, 90);
        ctx.shadowBlur = 0;
      }
    },
    [bgColor, zoom, offsetX, offsetY]
  );

  // Redraw preview whenever image, zoom, offset, or guides change
  React.useEffect(() => {
    if (previewCanvasRef.current && imageSrc) {
      drawBanner(previewCanvasRef.current, showSafeZone);
    }
  }, [imageSrc, zoom, offsetX, offsetY, bgColor, showSafeZone, drawBanner]);

  /**
   * Mouse & Touch Dragging Handlers for interactive pan
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!previewCanvasRef.current) return;
    setIsDragging(true);
    dragStartPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffX: offsetX,
      startOffY: offsetY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !previewCanvasRef.current) return;
    const canvasRect = previewCanvasRef.current.getBoundingClientRect();
    const scaleFactor = BANNER_WIDTH / canvasRect.width;

    const deltaX = (e.clientX - dragStartPosRef.current.x) * scaleFactor;
    const deltaY = (e.clientY - dragStartPosRef.current.y) * scaleFactor;

    setOffsetX(dragStartPosRef.current.startOffX + deltaX);
    setOffsetY(dragStartPosRef.current.startOffY + deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && previewCanvasRef.current) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startOffX: offsetX,
        startOffY: offsetY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1 || !previewCanvasRef.current) return;
    const touch = e.touches[0];
    const canvasRect = previewCanvasRef.current.getBoundingClientRect();
    const scaleFactor = BANNER_WIDTH / canvasRect.width;

    const deltaX = (touch.clientX - dragStartPosRef.current.x) * scaleFactor;
    const deltaY = (touch.clientY - dragStartPosRef.current.y) * scaleFactor;

    setOffsetX(dragStartPosRef.current.startOffX + deltaX);
    setOffsetY(dragStartPosRef.current.startOffY + deltaY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  /**
   * Reset Zoom and Pan to Center
   */
  const handleResetPosition = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  /**
   * Offscreen render & direct download at exact 2560x1440 resolution
   */
  const handleDownload = () => {
    if (!loadedImageRef.current) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Create offscreen canvas at exact 2560x1440 without guideline overlays
      const exportCanvas = document.createElement("canvas");
      drawBanner(exportCanvas, false);

      const mimeType = exportFormat === "png" ? "image/png" : "image/jpeg";
      const quality = exportFormat === "jpeg" ? 0.95 : undefined;

      exportCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Failed to generate banner blob.");
            setIsProcessing(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const baseName = originalFileName.replace(/\.[^/.]+$/, "") || "youtube-channel";
          link.download = `${baseName}-banner-2560x1440.${exportFormat}`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsProcessing(false);
        },
        mimeType,
        quality
      );
    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to download banner. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setOriginalFileName("");
    setOriginalDimensions(null);
    loadedImageRef.current = null;
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span>YouTube Banner Resizer & Safe Zone Cropper</span>
          </CardTitle>
          <CardDescription>
            Crop, pan, zoom, and resize any artwork to YouTube&apos;s exact 2560 × 1440 px banner dimensions with real-time mobile and desktop safe-zone guides.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Upload Box */}
          {!imageSrc ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <span className="flex h-5 w-5 rounded-full bg-primary text-primary-foreground items-center justify-center text-[10px]">
                  1
                </span>
                <span>Upload Channel Artwork</span>
              </div>

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
                    Click to upload or drag & drop banner image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PNG, JPG, or WEBP (up to 25MB). Auto-loads into interactive 2560 × 1440 canvas.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Step 2 Header & Positioning Instructions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span className="flex h-5 w-5 rounded-full bg-primary text-primary-foreground items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Drag To Reposition & Adjust Zoom</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Move className="h-3.5 w-3.5 text-primary" />
                  <span>Click and drag on the preview to pan</span>
                </div>
              </div>

              {/* Controls Toolbar: Zoom, Guides, Color, Reset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
                {/* Zoom Controls */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <ZoomIn className="h-3.5 w-3.5 text-primary" />
                      <span>Zoom: {Math.round(zoom * 100)}%</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPosition}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Center Position
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Safe Zone Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Safe Zone Guides
                  </label>
                  <Button
                    type="button"
                    variant={showSafeZone ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className="w-full text-xs h-8 gap-1.5"
                  >
                    {showSafeZone ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Guides: ON</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Guides: OFF</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Canvas Padding Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-12 rounded cursor-pointer border border-input bg-transparent"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Draggable Canvas Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <Maximize2 className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Original File: {originalDimensions?.w} × {originalDimensions?.h} px
                    </span>
                  </span>
                  <span className="font-semibold text-primary">
                    Output: 2560 × 1440 px (Official YouTube Spec)
                  </span>
                </div>

                {/* Interactive Canvas Viewport */}
                <div className="relative w-full rounded-xl overflow-hidden border-2 border-border bg-black shadow-xl select-none group">
                  <canvas
                    ref={previewCanvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`w-full h-auto block ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    style={{ aspectRatio: "16 / 9" }}
                  />

                  {/* Drag hint overlay badge */}
                  <div className="absolute bottom-3 right-3 pointer-events-none px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-[11px] text-white/90 flex items-center gap-1.5 border border-white/10">
                    <Move className="h-3 w-3 text-primary" />
                    <span>Drag canvas to position</span>
                  </div>
                </div>
              </div>

              {/* Safe Zone Legend */}
              {showSafeZone && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs p-3.5 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-emerald-500/50 border border-emerald-500 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">1546 × 423 px:</strong> Mobile & Text Safe Zone
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-indigo-500/40 border border-indigo-500 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">2560 × 423 px:</strong> Desktop Display Band
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-neutral-700/50 border border-neutral-600 shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">2560 × 1440 px:</strong> Smart TV Full Canvas
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 3: Export Section */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <span className="flex h-5 w-5 rounded-full bg-primary text-primary-foreground items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Download Ready 2560 × 1440 Banner</span>
                  </div>

                  {/* Format Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground font-medium">Format:</span>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as "png" | "jpeg")}
                      className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="png">PNG (Lossless High Quality)</option>
                      <option value="jpeg">JPG (Optimized File Size)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleDownload}
                    disabled={isProcessing}
                    className="flex-1 gap-2 text-sm sm:text-base font-bold shadow-lg shadow-indigo-500/20"
                  >
                    <Download className="h-5 w-5" />
                    <span>
                      {isProcessing
                        ? "Generating Banner..."
                        : `Download 2560 × 1440 Banner (${exportFormat.toUpperCase()})`}
                    </span>
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

              {/* Creator Tip */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-card border border-border/80 text-xs text-muted-foreground">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>YouTube Recommendation:</strong> Ensure your channel name, logo, social links, and key text fit inside the central <strong>1546 × 423 px green safe zone</strong>. The exported image will be exactly <strong>2560 × 1440 px</strong> without any watermarks or guideline overlays.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
