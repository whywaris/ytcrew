import { NextRequest, NextResponse } from "next/server";
import {
  extractYouTubeVideoId,
  fetchYouTubeComments,
  YouTubeApiError,
} from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url") || searchParams.get("videoId");
    const order = searchParams.get("order") === "relevance" ? "relevance" : "time";
    const includeReplies = searchParams.get("includeReplies") === "true";
    const maxPages = parseInt(searchParams.get("maxPages") || "5", 10);

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

    const result = await fetchYouTubeComments(videoId, {
      order,
      includeReplies,
      maxPages,
    });

    return NextResponse.json({
      success: true,
      videoId,
      data: result.comments,
      totalFetched: result.totalFetched,
      isPartial: result.isPartial,
    });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: error.isQuotaError },
        { status: error.statusCode }
      );
    }

    console.error("[API/YouTube/comments] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching comments." },
      { status: 500 }
    );
  }
}
