import { NextResponse } from "next/server";
import { buildSmartConfiguration } from "@mopa/smart-auth";

const EHR_ISSUER = process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001";

export function GET() {
  return NextResponse.json(buildSmartConfiguration(EHR_ISSUER), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
