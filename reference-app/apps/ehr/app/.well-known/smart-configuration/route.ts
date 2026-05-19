import { NextResponse } from "next/server";
import { buildSmartConfiguration } from "@ogca/smart-auth";

export function GET() {
  const issuer = process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000";
  return NextResponse.json(buildSmartConfiguration(issuer), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
