import { NextRequest, NextResponse } from "next/server";
import {
  extractYouTubeVideoId,
  fetchFirstYouTubeComment,
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

    // Fetch video details (for thumbnail/title context) and first comment concurrently
    const [videoDetails, firstComment] = await Promise.all([
      fetchYouTubeVideoDetails(videoId).catch(() => null),
      fetchFirstYouTubeComment(videoId),
    ]);

    return NextResponse.json({
      success: true,
      videoId,
      video: videoDetails,
      firstComment,
    });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: error.isQuotaError },
        { status: error.statusCode }
      );
    }

    console.error("[API/YouTube/first-comment] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while locating the first comment." },
      { status: 500 }
    );
  }
}
