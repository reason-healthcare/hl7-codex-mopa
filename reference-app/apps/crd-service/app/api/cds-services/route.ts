import { NextResponse } from "next/server";
import { buildDiscoveryResponse } from "../../../src/crd-logic";

export function GET() {
  return NextResponse.json(buildDiscoveryResponse(), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
