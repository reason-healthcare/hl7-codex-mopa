import { NextResponse } from "next/server";
import { LIBRARY_RESOURCE } from "../../../../src/library-resource";

export function GET() {
  return NextResponse.json(LIBRARY_RESOURCE, {
    headers: {
      "Content-Type": "application/fhir+json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
