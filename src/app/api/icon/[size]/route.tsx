import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import React from "react";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { size: string } }
) {
  const size = Math.min(Math.max(parseInt(params.size) || 192, 16), 1024);
  const r = Math.round(size * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #FF8C42 0%, #FFB347 50%, #FF6B35 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: r,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fruit circle */}
        <div
          style={{
            position: "absolute",
            width: size * 0.58,
            height: size * 0.58,
            background: "rgba(255, 107, 53, 0.9)",
            borderRadius: "50%",
            bottom: size * 0.1,
            display: "flex",
          }}
        />
        {/* Highlight */}
        <div
          style={{
            position: "absolute",
            width: size * 0.16,
            height: size * 0.1,
            background: "rgba(255,255,255,0.25)",
            borderRadius: "50%",
            bottom: size * 0.46,
            left: size * 0.28,
            transform: "rotate(-30deg)",
            display: "flex",
          }}
        />
        {/* Leaf */}
        <div
          style={{
            position: "absolute",
            width: size * 0.1,
            height: size * 0.2,
            background: "linear-gradient(180deg, #4CAF50, #2E7D32)",
            borderRadius: "50%",
            top: size * 0.1,
            left: size * 0.44,
            transform: "rotate(-15deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: size * 0.07,
            height: size * 0.16,
            background: "linear-gradient(180deg, #4CAF50, #2E7D32)",
            borderRadius: "50%",
            top: size * 0.1,
            left: size * 0.52,
            transform: "rotate(20deg)",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
