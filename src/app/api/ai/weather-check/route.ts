import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * GET /api/ai/weather-check - Check thời tiết cho một tỉnh thành
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tinh_thanh = searchParams.get("tinh_thanh");

    if (!tinh_thanh) {
      return NextResponse.json(
        { error: "tinh_thanh parameter is required" },
        { status: 400 }
      );
    }

    // Call AI service weather check endpoint
    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/weather/check/${encodeURIComponent(tinh_thanh)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000), // 15s timeout
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service returned ${response.status}: ${errorText}`);
      }

      const weatherData = await response.json();
      return NextResponse.json(weatherData);
    } catch (aiError: any) {
      console.error("AI service weather check error:", aiError);
      return NextResponse.json(
        {
          error: "AI service không khả dụng",
          message: aiError?.message,
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Weather check error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check weather" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/weather-check - Check thời tiết cho nhiều tỉnh thành
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provinces } = body;

    if (!provinces || !Array.isArray(provinces)) {
      return NextResponse.json(
        { error: "provinces must be an array" },
        { status: 400 }
      );
    }

    // Call AI service batch check endpoint
    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/weather/check-batch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(provinces),
          signal: AbortSignal.timeout(30000), // 30s timeout for batch
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service returned ${response.status}: ${errorText}`);
      }

      const weatherData = await response.json();
      return NextResponse.json(weatherData);
    } catch (aiError: any) {
      console.error("AI service weather batch check error:", aiError);
      return NextResponse.json(
        {
          error: "AI service không khả dụng",
          message: aiError?.message,
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Weather batch check error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check weather batch" },
      { status: 500 }
    );
  }
}

