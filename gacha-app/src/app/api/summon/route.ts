import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { bootstrapUserRecord } from "@/lib/user-bootstrap";
import {
  isBannerId,
  runSingleSummonForUser,
  SummonError,
} from "@/lib/summon";

type SummonRequestBody = {
  bannerId?: string;
};

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await bootstrapUserRecord(session.user);

  let body: SummonRequestBody;
  try {
    body = (await request.json()) as SummonRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.bannerId || !isBannerId(body.bannerId)) {
    return NextResponse.json({ error: "Unknown banner selected." }, { status: 400 });
  }

  try {
    const result = await runSingleSummonForUser(session.user.sub, body.bannerId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SummonError) {
      if (error.code === "INSUFFICIENT_COINS") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.code === "DB_CONFIG_MISSING") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (error.code === "USER_NOT_FOUND") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    console.error("Summon request failed", error);
    return NextResponse.json(
      { error: "Summon failed. Please try again." },
      { status: 500 },
    );
  }
}
