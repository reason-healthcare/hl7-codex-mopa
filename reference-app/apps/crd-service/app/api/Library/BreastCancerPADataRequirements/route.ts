import { NextResponse } from "next/server";
import { LIBRARY_RESOURCE } from "@ogca/knowledge-artifacts";

export function GET() {
  return NextResponse.json(LIBRARY_RESOURCE, {
    headers: {
      "Content-Type": "application/fhir+json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
