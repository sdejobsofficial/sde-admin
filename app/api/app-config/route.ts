import { NextResponse } from "next/server";

export async function GET() {
  const activationEmail = process.env.PREMIUM_PLUS_ACTIVATION_EMAIL ?? null;
  return NextResponse.json({ activationEmail });
}
