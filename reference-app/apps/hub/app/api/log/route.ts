import { type NextRequest, NextResponse } from "next/server";
import type { LogEntry } from "@ogca/logger";
import { push, recent } from "./store";

/** POST /api/log — ingest a single log entry from any service. */
export async function POST(request: NextRequest) {
  let entry: LogEntry;
  try {
    entry = (await request.json()) as LogEntry;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!entry.service || !entry.type) {
    return NextResponse.json({ error: "Missing required fields: service, type" }, { status: 422 });
  }
  push(entry);
  return NextResponse.json({ ok: true }, { status: 201 });
}

/** GET /api/log — return recent log entries as JSON. */
export function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "200");
  const correlationId = request.nextUrl.searchParams.get("correlation") ?? undefined;
  let entries = recent(limit);
  if (correlationId) entries = entries.filter((e) => e.correlationId === correlationId);
  return NextResponse.json({ entries });
}
