import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { bootstrapUserRecord } from "@/lib/user-bootstrap";
import { ALLOWED_COIN_PURCHASE_AMOUNTS } from "@/lib/shop-packs";
import { addCoinsToUser, ShopError } from "@/lib/shop";

type PurchaseRequestBody = {
  amount?: number;
};

export async function POST(request: Request) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await bootstrapUserRecord(session.user);

  let body: PurchaseRequestBody;
  try {
    body = (await request.json()) as PurchaseRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || !ALLOWED_COIN_PURCHASE_AMOUNTS.has(amount)) {
    return NextResponse.json({ error: "Invalid coin pack selected." }, { status: 400 });
  }

  try {
    const updatedCoins = await addCoinsToUser(session.user.sub, amount);
    return NextResponse.json({ addedCoins: amount, coins: updatedCoins });
  } catch (error) {
    if (error instanceof ShopError) {
      if (error.code === "DB_CONFIG_MISSING") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (error.code === "USER_NOT_FOUND") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    console.error("Shop purchase failed", error);
    return NextResponse.json(
      { error: "Purchase failed. Please try again." },
      { status: 500 },
    );
  }
}
