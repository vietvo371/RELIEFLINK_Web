import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint để gọi Python AI Service
 * Có thể fallback về heuristic nếu AI service không available
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

interface PredictionRequest {
  tinh_thanh: string;
  loai_thien_tai?: string;
  so_nguoi?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();

    // Validate input
    if (!body.tinh_thanh) {
      return NextResponse.json(
        { error: "tinh_thanh is required" },
        { status: 400 }
      );
    }

    // Try to call Python AI service
    try {
      const response = await fetch(`${AI_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tinh_thanh: body.tinh_thanh,
          loai_thien_tai: body.loai_thien_tai,
          so_nguoi: body.so_nguoi,
        }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const prediction = await response.json();
      return NextResponse.json(prediction);
    } catch (aiError: any) {
      console.error("AI service error:", aiError);

      // Fallback to mock data nếu AI service không available
      const { generateMockPrediction } = await import("@/lib/ai");
      const mockPrediction = generateMockPrediction(body.tinh_thanh);

      return NextResponse.json({
        ...mockPrediction,
        confidence_score: 0.3,
        method: "fallback_mock",
        warning: "AI service unavailable, using mock data",
      });
    }
  } catch (error: any) {
    console.error("AI prediction error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get prediction" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint để check AI service health
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "unavailable", error: "AI service not responding" },
        { status: 503 }
      );
    }

    const health = await response.json();
    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unavailable",
        error: error?.message || "AI service not available",
      },
      { status: 503 }
    );
  }
}

