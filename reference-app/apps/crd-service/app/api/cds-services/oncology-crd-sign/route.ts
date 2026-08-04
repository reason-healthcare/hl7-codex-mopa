import { type NextRequest, NextResponse } from "next/server";
import { handleOncologyCrd } from "../../../../src/crd-logic";
import type { CdsRequest } from "@mopa/cds-hooks";
import { createLogger } from "@mopa/logger";

const logger = createLogger("crd");

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CdsRequest<Record<string, unknown>>;
  const correlationId = body.hookInstance;
  const patientId = String(body.context.patientId ?? "");
  const t0 = Date.now();

  const response = await handleOncologyCrd(body);
  const outcome =
    response.cards[0]?.source.topic?.code ?? response.cards[0]?.indicator ?? "unknown";
  const durationMs = Date.now() - t0;

  logger.info("cds.response", {
    correlationId,
    patientId,
    hook: "order-sign",
    path: "/api/cds-services/oncology-crd-sign",
    method: "POST",
    status: 200,
    durationMs,
    outcome,
    request: body,
    response,
    summary: `order-sign → ${outcome} (${durationMs}ms)`,
  });

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
