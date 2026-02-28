import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

type ChatRequestBody = {
  channel?: string;
  message?: string;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const GEMINI_MODELS = [
  "gemma-3-27b-it",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b"
];

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini is not configured. Missing GEMINI_API_KEY." },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = body.message?.trim();
  const channel = body.channel?.trim() || "Global";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const prompt = [
    "You are an in-game chat responder for a western gacha game.",
    `Channel: ${channel}`,
    "Keep replies short (1-2 sentences), friendly, and in-universe.",
    `Player message: ${message}`,
  ].join("\n");

  try {
    let lastErrorText = "";

    for (const model of GEMINI_MODELS) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        lastErrorText = errorText;
        console.error("Gemini API error", { model, status: response.status, errorText });

        if (response.status === 400 || response.status === 404) {
          continue;
        }

        return NextResponse.json(
          { error: "Chat service unavailable. Please try again." },
          { status: 502 },
        );
      }

      const data = (await response.json()) as GeminiGenerateResponse;
      const reply = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim();

      if (reply) {
        return NextResponse.json({ reply });
      }
    }

    console.error("Gemini API failed for all models", lastErrorText);
    return NextResponse.json(
      { error: "No compatible Gemini model is enabled for this API key." },
      { status: 502 },
    );
  } catch (error) {
    console.error("Gemini request failed", error);
    return NextResponse.json(
      { error: "Chat service unavailable. Please try again." },
      { status: 502 },
    );
  }
}
