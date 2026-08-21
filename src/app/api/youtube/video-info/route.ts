import { NextRequest, NextResponse } from "next/server";
import {
  extractYouTubeVideoId,
  fetchYouTubeVideoDetails,
  YouTubeApiError,
} from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url") || searchParams.get("videoId");

    if (!urlParam) {
      return NextResponse.json(
        { error: "Please provide a YouTube video URL or Video ID." },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(urlParam);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube video URL or Video ID format." },
        { status: 400 }
      );
    }

    const details = await fetchYouTubeVideoDetails(videoId);
    return NextResponse.json({ success: true, data: details });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: error.isQuotaError },
        { status: error.statusCode }
      );
    }

    console.error("[API/YouTube/video-info] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching video details." },
      { status: 500 }
    );
  }
}
