import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RESEND_AUDIENCE_ID = "02a734e0-1463-4a76-b2fe-a7f2ff18c091";

const subscribeSchema = z.object({
  email: z.string().trim().email("Invalid email address format"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = subscribeSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg =
        parseResult.error.issues?.[0]?.message ||
        parseResult.error.message ||
        "Invalid email address";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email } = parseResult.data;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn(
        "[Newsletter] RESEND_API_KEY is not set. Simulating successful subscription in development."
      );
      return NextResponse.json({
        success: true,
        message: "Thanks for subscribing!",
      });
    }

    // Call Resend Audiences Contact Creation endpoint
    const response = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        (data as { message?: string })?.message ||
        (data as { error?: { message?: string } })?.error?.message ||
        "";

      // If the email already exists in audience, treat gracefully as success
      if (
        response.status === 409 ||
        response.status === 422 ||
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("duplicate")
      ) {
        return NextResponse.json({
          success: true,
          message: "Thanks for subscribing!",
        });
      }

      console.error("[Resend Subscription Error]", data);
      return NextResponse.json(
        { error: errorMessage || "Failed to subscribe. Please try again later." },
        { status: response.status >= 400 && response.status < 500 ? response.status : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing!",
      id: (data as { id?: string })?.id,
    });
  } catch (error) {
    console.error("[Newsletter API Route Error]", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
