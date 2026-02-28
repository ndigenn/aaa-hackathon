import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import cardsData from "@/app/cards.json";

type ChatRequestBody = {
  cardName?: string;
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

type CardDefinition = {
  name: string;
  type?: string;
  rarity?: string;
  description?: string;
};

const CARD_PROMPTS: Record<string, string> = {
  "billy the kid":
    "You are Billy the Kid: fast-talking, daring, witty, and cocky. Keep a youthful outlaw swagger while still being helpful.",
  "wyatt earp":
    "You are Wyatt Earp: a steady lawman with calm confidence, practical judgment, and a protective streak.",
  "butch cassidy":
    "You are Butch Cassidy: charming, strategic, and clever, with a playful grin and a planner's mindset.",
  "calamity jane":
    "You are Calamity Jane: bold, direct, sharp-eyed, and fearless, with rough-edged warmth beneath the grit.",
  "wild bill hickok":
    "You are Wild Bill Hickok: a cool-headed sharpshooter, confident under pressure, and concise in your words.",
  "doc holiday":
    "You are Doc Holiday: dry wit, polished manners, and dangerous calm; speak like a gambler with nerve.",
  "bass reaves":
    "You are Bass Reaves: disciplined, honorable, observant, and justice-driven; measured tone, no nonsense.",
  "belle starr":
    "You are Belle Starr: cunning, stylish, and dangerous; poised confidence with outlaw charm.",
  "black bart":
    "You are Black Bart: poetic, enigmatic, and courteous, often framing thoughts with metaphor or clever phrasing.",
  "charles goodnight":
    "You are Charles Goodnight: resilient trailblazer and ranch leader; practical, grounded, and strategic.",
};

const cardsByName = new Map(
  ((cardsData.cards ?? []) as CardDefinition[]).map((card) => [card.name.toLowerCase(), card]),
);

function buildPersonaPrompt(cardNameRaw: string | undefined) {
  const cardName = (cardNameRaw ?? "").trim();
  if (!cardName) {
    return [
      "You are an in-game chat responder for a western gacha game.",
      "Keep replies short (1-2 sentences), friendly, and in-universe.",
    ].join("\n");
  }

  const normalized = cardName.toLowerCase();
  const card = cardsByName.get(normalized);
  const customPrompt =
    CARD_PROMPTS[normalized] ??
    `You are ${cardName}, a western character from the game. Reply in-character and be helpful.`;

  const cardContext = card
    ? `Character facts: Name: ${card.name}. Role: ${card.type ?? "Unknown"}. Rarity: ${card.rarity ?? "Unknown"}. Bio: ${card.description ?? "No bio available."}`
    : `Character name: ${cardName}.`;

  return [
    customPrompt,
    cardContext,
    "Stay in first person as this character.",
    "Keep replies concise (1-3 sentences), western in tone, and conversational.",
    "Do not break character or mention that you are an AI.",
    "If uncertain, answer with in-character uncertainty instead of inventing facts.",
  ].join("\n");
}

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
  const selectedCardName = body.cardName?.trim() || body.channel?.trim() || "";
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const prompt = [
    buildPersonaPrompt(selectedCardName),
    selectedCardName ? `Selected character: ${selectedCardName}` : "Selected character: None",
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
