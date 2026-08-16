"use client";

import * as React from "react";
import { z } from "zod";
import {
  MessageSquare,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Heart,
  BadgeCheck,
  AlertTriangle,
  Upload,
  Sun,
  Moon,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const commentSchema = z.object({
  author: z.string().min(1, "Author name is required").max(50, "Name too long"),
  comment: z.string().min(1, "Comment text is required").max(500, "Comment too long"),
  likes: z.number().int().min(0, "Likes cannot be negative"),
  timeAgo: z.string().min(1, "Time is required"),
});

interface CommentTemplate {
  author: string;
  comment: string;
  likes: number;
  timeAgo: string;
  isVerified?: boolean;
  isPinned?: boolean;
  hasCreatorHeart?: boolean;
}

const REALISTIC_COMMENT_TEMPLATES: CommentTemplate[] = [
  {
    author: "Alex Rivers",
    comment: "This is hands down the best explanation of this topic on YouTube. Deserves way more subscribers! 🔥",
    likes: 4200,
    timeAgo: "2 days ago",
    isVerified: false,
    hasCreatorHeart: true,
  },
  {
    author: "Sarah TechTips",
    comment: "Bro dropped the most valuable 10-minute video on the internet and thought we wouldn't notice 🐐",
    likes: 12500,
    timeAgo: "3 hours ago",
    isVerified: true,
    isPinned: true,
    hasCreatorHeart: true,
  },
  {
    author: "Quantum Gamer",
    comment: "Who else is watching this at 2 AM instead of doing what they were supposed to do? 😭",
    likes: 890,
    timeAgo: "1 day ago",
    hasCreatorHeart: false,
  },
  {
    author: "Creator Lab Official",
    comment: "Pinning this so everyone sees the link to the resource sheet mentioned in the video! Thanks for watching.",
    likes: 15400,
    timeAgo: "5 hours ago",
    isVerified: true,
    isPinned: true,
    hasCreatorHeart: true,
  },
  {
    author: "Jordan Vance",
    comment: "The editing on this video is on a whole different level. The pacing kept me hooked the entire time.",
    likes: 310,
    timeAgo: "4 days ago",
    hasCreatorHeart: true,
  },
  {
    author: "PixelForge",
    comment: "Subscribed immediately after watching the first 2 minutes. Keep up the high production value!",
    likes: 1840,
    timeAgo: "1 week ago",
    hasCreatorHeart: false,
  },
  {
    author: "Maya Lin",
    comment: "That transition at 3:45 was so smooth I had to rewind it three times just to appreciate it.",
    likes: 670,
    timeAgo: "6 hours ago",
    hasCreatorHeart: true,
  },
  {
    author: "CodeCraft Academy",
    comment: "Incredible breakdown! Sharing this with our entire community cohort today. 🚀",
    likes: 5420,
    timeAgo: "2 days ago",
    isVerified: true,
    hasCreatorHeart: true,
  },
];

const PRESET_AVATARS = [
  { id: "indigo", color: "#6366F1", label: "Indigo" },
  { id: "pink", color: "#EC4899", label: "Pink" },
  { id: "amber", color: "#F59E0B", label: "Amber" },
  { id: "emerald", color: "#10B981", label: "Emerald" },
  { id: "teal", color: "#14B8A6", label: "Teal" },
  { id: "purple", color: "#8B5CF6", label: "Purple" },
  { id: "red", color: "#EF4444", label: "Red" },
  { id: "blue", color: "#3B82F6", label: "Blue" },
];

export function FakeYouTubeCommentGenerator() {
  const [author, setAuthor] = React.useState("Alex Rivers");
  const [comment, setComment] = React.useState(
    "This is hands down the best explanation of this topic on YouTube. Deserves way more subscribers! 🔥"
  );
  const [likes, setLikes] = React.useState<string>("4200");
  const [timeAgo, setTimeAgo] = React.useState("2 days ago");
  const [isVerified, setIsVerified] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [hasCreatorHeart, setHasCreatorHeart] = React.useState(true);

  // Avatar 1: Commenter Avatar
  const [commenterAvatarType, setCommenterAvatarType] = React.useState<"preset" | "custom">("preset");
  const [commenterColor, setCommenterColor] = React.useState("#6366F1");
  const [commenterCustomImg, setCommenterCustomImg] = React.useState<string | null>(null);

  // Avatar 2: Creator Avatar (for creator heart context)
  const [creatorAvatarType, setCreatorAvatarType] = React.useState<"preset" | "custom">("preset");
  const [creatorColor, setCreatorColor] = React.useState("#EF4444");
  const [creatorCustomImg, setCreatorCustomImg] = React.useState<string | null>(null);

  // Preview Theme Choice: 'dark' | 'light'
  const [previewTheme, setPreviewTheme] = React.useState<"dark" | "light">("dark");
  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg">("png");

  const [copiedText, setCopiedText] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const commenterFileInputRef = React.useRef<HTMLInputElement>(null);
  const creatorFileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle Commenter Avatar file upload
  const handleCommenterFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCommenterCustomImg(e.target?.result as string);
      setCommenterAvatarType("custom");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Creator Avatar file upload
  const handleCreatorFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCreatorCustomImg(e.target?.result as string);
      setCreatorAvatarType("custom");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * REALISTIC_COMMENT_TEMPLATES.length);
    const template = REALISTIC_COMMENT_TEMPLATES[randomIndex];
    setAuthor(template.author);
    setComment(template.comment);
    setLikes(String(template.likes));
    setTimeAgo(template.timeAgo);
    setIsVerified(!!template.isVerified);
    setIsPinned(!!template.isPinned);
    setHasCreatorHeart(!!template.hasCreatorHeart);

    const randomColor = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].color;
    setCommenterColor(randomColor);
    setCommenterAvatarType("preset");

    const randomCreatorColor = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].color;
    setCreatorColor(randomCreatorColor);
    setError(null);
  };

  const formatLikes = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return num.toLocaleString();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${author}: "${comment}"`);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Helper to load image for Canvas drawing
  const loadCanvasImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  /**
   * High-definition Canvas export to PNG/JPEG matching selected preview theme
   */
  const handleDownloadImage = async () => {
    setError(null);
    setIsDownloading(true);

    try {
      const scale = 2; // 2x Retina sharpness
      const width = 640;
      const height = isPinned ? 195 : 165;

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not initialize canvas context.");
      }

      ctx.scale(scale, scale);

      const isDark = previewTheme === "dark";

      // Palette definition based on YouTube Dark / Light mode
      const bgFill = isDark ? "#0F0F0F" : "#FFFFFF";
      const cardBorder = isDark ? "#272727" : "#E5E5E5";
      const primaryTextColor = isDark ? "#F1F1F1" : "#0F0F0F";
      const secondaryTextColor = isDark ? "#AAAAAA" : "#606060";

      // 1. Draw Background Card
      ctx.fillStyle = bgFill;
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 12);
      ctx.fill();

      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 1;
      ctx.stroke();

      let offsetY = 20;

      // 2. Draw Pinned Badge if enabled
      if (isPinned) {
        ctx.fillStyle = secondaryTextColor;
        ctx.font = "bold 11px Inter, -apple-system, sans-serif";
        ctx.fillText("📌 Pinned by creator", 64, offsetY);
        offsetY += 24;
      }

      // 3. Draw Commenter Avatar
      const avatarRadius = 18;
      const avatarCenterX = 36;
      const avatarCenterY = offsetY + avatarRadius;

      if (commenterAvatarType === "custom" && commenterCustomImg) {
        try {
          const img = await loadCanvasImage(commenterCustomImg);
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            img,
            avatarCenterX - avatarRadius,
            avatarCenterY - avatarRadius,
            avatarRadius * 2,
            avatarRadius * 2
          );
          ctx.restore();
        } catch {
          // Fallback circle
          ctx.fillStyle = commenterColor;
          ctx.beginPath();
          ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = commenterColor;
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(author.charAt(0).toUpperCase() || "Y", avatarCenterX, avatarCenterY);
      }

      // Reset text alignments
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // 4. Draw Author Name + Verified + Time
      const textStartX = 64;
      ctx.fillStyle = primaryTextColor;
      ctx.font = "bold 13px Inter, sans-serif";
      const handleName = `@${author.replace(/\s+/g, "").toLowerCase()}`;
      ctx.fillText(handleName, textStartX, offsetY + 14);

      const nameWidth = ctx.measureText(handleName).width;
      let badgeOffset = textStartX + nameWidth + 6;

      if (isVerified) {
        ctx.fillStyle = secondaryTextColor;
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("✓", badgeOffset, offsetY + 14);
        badgeOffset += 14;
      }

      ctx.fillStyle = secondaryTextColor;
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(timeAgo, badgeOffset, offsetY + 14);

      // 5. Draw Comment Body Text (with line wrap)
      ctx.fillStyle = primaryTextColor;
      ctx.font = "14px Inter, sans-serif";
      const maxLineWidth = width - textStartX - 24;
      const words = comment.split(" ");
      let line = "";
      let currentLineY = offsetY + 36;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxLineWidth && n > 0) {
          ctx.fillText(line, textStartX, currentLineY);
          line = words[n] + " ";
          currentLineY += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, textStartX, currentLineY);

      // 6. Draw Engagement Bar (Likes + Thumbs + Reply + Creator Heart)
      const engagementY = currentLineY + 24;
      ctx.fillStyle = secondaryTextColor;
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`👍  ${formatLikes(likes)}    👎    Reply`, textStartX, engagementY);

      if (hasCreatorHeart) {
        const engWidth = ctx.measureText(`👍  ${formatLikes(likes)}    👎    Reply`).width;
        const creatorAvCenterX = textStartX + engWidth + 14;
        const creatorAvCenterY = engagementY - 4;
        const creatorAvRadius = 9;

        // Draw small creator avatar circle
        if (creatorAvatarType === "custom" && creatorCustomImg) {
          try {
            const cImg = await loadCanvasImage(creatorCustomImg);
            ctx.save();
            ctx.beginPath();
            ctx.arc(creatorAvCenterX, creatorAvCenterY, creatorAvRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(
              cImg,
              creatorAvCenterX - creatorAvRadius,
              creatorAvCenterY - creatorAvRadius,
              creatorAvRadius * 2,
              creatorAvRadius * 2
            );
            ctx.restore();
          } catch {
            ctx.fillStyle = creatorColor;
            ctx.beginPath();
            ctx.arc(creatorAvCenterX, creatorAvCenterY, creatorAvRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = creatorColor;
          ctx.beginPath();
          ctx.arc(creatorAvCenterX, creatorAvCenterY, creatorAvRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 8px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("C", creatorAvCenterX, creatorAvCenterY);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        }

        // Draw tiny red heart badge icon beside creator avatar
        ctx.fillStyle = "#EF4444";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("❤️", creatorAvCenterX + 10, engagementY);
      }

      // Convert to download
      const mimeType = exportFormat === "jpeg" ? "image/jpeg" : "image/png";
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const downloadLink = document.createElement("a");
      downloadLink.download = `youtube-comment-${author.toLowerCase().replace(/\s+/g, "-")}-${previewTheme}.${exportFormat}`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    } catch (err) {
      console.error("Canvas export failed", err);
      setError("Failed to export image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-lg shadow-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Fake YouTube Comment Generator</span>
          </CardTitle>
          <CardDescription>
            Design realistic YouTube comment mockups with custom avatars, verified badges, likes, pinned tags, and creator hearts for video B-roll, thumbnails, or case studies.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Controls Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Author Name
              </label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Alex Rivers"
                className="bg-background/80"
              />
            </div>

            {/* Relative Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Timestamp
              </label>
              <Input
                value={timeAgo}
                onChange={(e) => setTimeAgo(e.target.value)}
                placeholder="e.g. 2 hours ago, 1 day ago"
                className="bg-background/80"
              />
            </div>

            {/* Comment Text */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Comment Text</span>
                <span className="text-xs text-muted-foreground">{comment.length}/500</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Write your custom comment here..."
                className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Likes Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Likes Count
              </label>
              <Input
                type="number"
                min="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="bg-background/80 font-mono"
              />
            </div>

            {/* Badges Toggles */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Verified</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pinned</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasCreatorHeart}
                    onChange={(e) => setHasCreatorHeart(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
                  <span>Creator Heart</span>
                </label>
              </div>
            </div>

            {/* 1. Commenter Avatar Selector */}
            <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  Commenter Avatar
                </span>
                {commenterAvatarType === "custom" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCommenterCustomImg(null);
                      setCommenterAvatarType("preset");
                    }}
                    className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Reset to Preset
                  </button>
                )}
              </div>

              {/* Upload Dropzone & Thumbnail */}
              <div className="flex items-center gap-3">
                <input
                  ref={commenterFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleCommenterFileUpload(e.target.files[0]);
                  }}
                />

                {/* Upload Box */}
                <div
                  onClick={() => commenterFileInputRef.current?.click()}
                  className="flex-1 border border-dashed border-border hover:border-primary/60 bg-background/60 hover:bg-background rounded-lg p-2.5 text-center cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {commenterCustomImg ? "Change custom photo" : "Upload photo (JPG/PNG)"}
                  </span>
                </div>

                {/* Live Preview Thumbnail */}
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-sm overflow-hidden border border-border text-xs"
                  style={{ backgroundColor: commenterColor }}
                >
                  {commenterAvatarType === "custom" && commenterCustomImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={commenterCustomImg}
                      alt="Commenter Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    author.charAt(0).toUpperCase() || "Y"
                  )}
                </div>
              </div>

              {/* Preset Palette Row */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Or pick a color preset:</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setCommenterColor(p.color);
                        setCommenterAvatarType("preset");
                      }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        commenterAvatarType === "preset" && commenterColor === p.color
                          ? "ring-2 ring-primary ring-offset-2 scale-110"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: p.color }}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Creator Avatar Selector (Enabled when Creator Heart is active) */}
            <div
              className={`p-4 rounded-xl border border-border bg-secondary/20 space-y-3 transition-opacity ${
                hasCreatorHeart ? "opacity-100" : "opacity-50 pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
                  Creator Avatar (for Heart Badge)
                </span>
                {creatorAvatarType === "custom" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCreatorCustomImg(null);
                      setCreatorAvatarType("preset");
                    }}
                    className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Upload Dropzone & Thumbnail */}
              <div className="flex items-center gap-3">
                <input
                  ref={creatorFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleCreatorFileUpload(e.target.files[0]);
                  }}
                />

                <div
                  onClick={() => creatorFileInputRef.current?.click()}
                  className="flex-1 border border-dashed border-border hover:border-primary/60 bg-background/60 hover:bg-background rounded-lg p-2.5 text-center cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {creatorCustomImg ? "Change channel logo" : "Upload logo (JPG/PNG)"}
                  </span>
                </div>

                {/* Creator Preview Thumbnail */}
                <div
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-sm overflow-hidden border border-border text-xs relative"
                  style={{ backgroundColor: creatorColor }}
                >
                  {creatorAvatarType === "custom" && creatorCustomImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={creatorCustomImg}
                      alt="Creator Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "C"
                  )}
                </div>
              </div>

              {/* Creator Preset Palette */}
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground font-medium">Or pick a creator color:</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setCreatorColor(p.color);
                        setCreatorAvatarType("preset");
                      }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        creatorAvatarType === "preset" && creatorColor === p.color
                          ? "ring-2 ring-primary ring-offset-2 scale-110"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: p.color }}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRandomize}
              className="gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Randomize / Generate Another</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyText}
              className="gap-2 text-xs sm:text-sm"
            >
              {copiedText ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-success">Copied Text!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as "png" | "jpeg")}
                className="h-9 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
              </select>

              <Button
                type="button"
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="gap-2 text-xs sm:text-sm"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? "Generating Image..." : `Download ${exportFormat.toUpperCase()}`}</span>
              </Button>
            </div>
          </div>

          {/* Live Mockup Preview Section with Theme Toggle */}
          <div className="mt-8 pt-6 border-t border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Live YouTube Comment Mockup:
              </span>

              {/* Preview Theme Selector (Dark / Light) */}
              <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border self-start sm:self-auto">
                <span className="text-xs text-muted-foreground px-1.5 font-medium">Theme:</span>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("dark")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    previewTheme === "dark"
                      ? "bg-neutral-900 text-white shadow-sm border border-neutral-700"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-3 w-3" />
                  <span>YouTube Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTheme("light")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    previewTheme === "light"
                      ? "bg-white text-neutral-900 shadow-sm border border-neutral-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-3 w-3 text-amber-500" />
                  <span>YouTube Light</span>
                </button>
              </div>
            </div>

            {/* Mockup Preview Container styled according to previewTheme */}
            <div
              className={`p-5 sm:p-6 rounded-xl border shadow-md transition-all font-sans ${
                previewTheme === "dark"
                  ? "border-neutral-800 bg-[#0f0f0f] text-neutral-100"
                  : "border-neutral-200 bg-white text-neutral-900 shadow-neutral-200/50"
              }`}
            >
              {/* Pinned Tag */}
              {isPinned && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium mb-3 ml-12 ${
                    previewTheme === "dark" ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  <Pin className="h-3.5 w-3.5 fill-current rotate-45" />
                  <span>Pinned by creator</span>
                </div>
              )}

              <div className="flex items-start gap-3.5">
                {/* Commenter Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm text-sm overflow-hidden"
                  style={{ backgroundColor: commenterColor }}
                >
                  {commenterAvatarType === "custom" && commenterCustomImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={commenterCustomImg}
                      alt={author}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    author.charAt(0).toUpperCase() || "Y"
                  )}
                </div>

                {/* Comment Content Area */}
                <div className="flex-1 space-y-1">
                  {/* Author Handle + Badges + Time */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span
                      className={`font-semibold hover:underline cursor-pointer ${
                        previewTheme === "dark" ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      @{author.replace(/\s+/g, "").toLowerCase()}
                    </span>
                    {isVerified && (
                      <BadgeCheck
                        className={`h-3.5 w-3.5 inline ${
                          previewTheme === "dark"
                            ? "text-neutral-400 fill-neutral-700"
                            : "text-neutral-500 fill-neutral-200"
                        }`}
                      />
                    )}
                    <span className={previewTheme === "dark" ? "text-neutral-400" : "text-neutral-500"}>
                      {timeAgo}
                    </span>
                  </div>

                  {/* Body Text */}
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap pt-0.5 ${
                      previewTheme === "dark" ? "text-neutral-100" : "text-neutral-800"
                    }`}
                  >
                    {comment}
                  </p>

                  {/* Reaction Buttons + Creator Heart Context */}
                  <div
                    className={`flex items-center gap-4 pt-2 text-xs ${
                      previewTheme === "dark" ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    <button
                      type="button"
                      className={`flex items-center gap-1.5 transition-colors ${
                        previewTheme === "dark" ? "hover:text-white" : "hover:text-black"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{formatLikes(likes)}</span>
                    </button>
                    <button
                      type="button"
                      className={`transition-colors ${
                        previewTheme === "dark" ? "hover:text-white" : "hover:text-black"
                      }`}
                      title="Dislike"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Creator Heart with Creator Avatar */}
                    {hasCreatorHeart && (
                      <div
                        className="flex items-center gap-1"
                        title="Loved by creator"
                      >
                        <div
                          className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[8px] font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: creatorColor }}
                        >
                          {creatorAvatarType === "custom" && creatorCustomImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={creatorCustomImg}
                              alt="Creator Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "C"
                          )}
                        </div>
                        <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                      </div>
                    )}

                    <button
                      type="button"
                      className={`font-medium transition-colors ml-1 ${
                        previewTheme === "dark" ? "hover:text-white" : "hover:text-black"
                      }`}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Disclaimer Note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> For entertainment, mockups, and educational use only. Do not use to deceive or manipulate engagement metrics.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
