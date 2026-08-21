import { NextRequest, NextResponse } from "next/server";
import { resolveYouTubeChannelId, YouTubeApiError } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input") || searchParams.get("handle") || searchParams.get("channelId");

    if (!input) {
      return NextResponse.json(
        { error: "Please provide a YouTube channel URL, @handle, or Channel ID." },
        { status: 400 }
      );
    }

    const resolution = await resolveYouTubeChannelId(input);
    return NextResponse.json({ success: true, data: resolution });
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      return NextResponse.json(
        { error: error.message, isQuotaError: error.isQuotaError },
        { status: error.statusCode }
      );
    }

    console.error("[API/YouTube/channel-id] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resolving the channel." },
      { status: 500 }
    );
  }
}
