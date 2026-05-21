import { type NextRequest, NextResponse } from "next/server";
import { handleOncologyCrd } from "../../../../src/crd-logic";
import type { CdsRequest } from "@ogca/cds-hooks";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CdsRequest<Record<string, unknown>>;
  const response = await handleOncologyCrd(body);
  return NextResponse.json(response, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
