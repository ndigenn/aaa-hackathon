import { NextResponse } from "next/server";

type ForgotPasswordRequestBody = {
  email?: string;
};

const auth0Domain = process.env.AUTH0_DOMAIN;
const auth0ClientId = process.env.AUTH0_CLIENT_ID;
const auth0Connection =
  process.env.AUTH0_PASSWORD_CONNECTION ?? "Username-Password-Authentication";

export async function POST(request: Request) {
  let body: ForgotPasswordRequestBody;
  try {
    body = (await request.json()) as ForgotPasswordRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (!auth0Domain || !auth0ClientId) {
    return NextResponse.json(
      { error: "Auth is not configured for password reset." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`https://${auth0Domain}/dbconnections/change_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: auth0ClientId,
        email,
        connection: auth0Connection,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not start password reset. Please try again." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch {
    return NextResponse.json(
      { error: "Network error while starting password reset." },
      { status: 500 },
    );
  }
}
