import { type NextRequest, NextResponse } from "next/server";
import { CdsRequestSchema, resolvePrefetch } from "@ogca/cds-hooks";
import { handleOncologyCrd, PREFETCH_TEMPLATES, CRD_SERVICE_ID } from "../../../../src/crd-logic";
import { createLogger } from "@ogca/logger";

const logger = createLogger("crd");
const CORS = { "Access-Control-Allow-Origin": "*" };

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: CORS });
  }

  const parsed = CdsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid CDS Hooks request", issues: parsed.error.flatten() },
      { status: 422, headers: CORS }
    );
  }

  const cdsRequest = parsed.data;
  const correlationId = cdsRequest.hookInstance;
  const patientId = String(cdsRequest.context.patientId ?? "");
  const t0 = Date.now();

  logger.info("cds.request", {
    correlationId,
    patientId,
    hook: cdsRequest.hook,
    path: "/api/cds-services/oncology-crd",
    method: "POST",
    request: body,
    summary: `order-select received for patient ${patientId}`,
  });

  if (!["order-select", "order-sign"].includes(cdsRequest.hook))
    return NextResponse.json(
      { error: `Unsupported hook: ${cdsRequest.hook}. Expected order-select or order-sign.` },
      { status: 400, headers: CORS }
    );

  const fhirBase =
    cdsRequest.fhirServer ?? process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";

  const prefetch = await resolvePrefetch(
    PREFETCH_TEMPLATES,
    fhirBase,
    cdsRequest.context,
    cdsRequest.prefetch ?? {}
  );

  const response = await handleOncologyCrd({ ...cdsRequest, prefetch });
  const outcome =
    response.cards[0]?.source.topic?.code ?? response.cards[0]?.indicator ?? "unknown";
  const durationMs = Date.now() - t0;

  logger.info("cds.response", {
    correlationId,
    patientId,
    hook: cdsRequest.hook,
    path: "/api/cds-services/oncology-crd",
    method: "POST",
    status: 200,
    durationMs,
    outcome,
    response,
    summary: `order-select → ${outcome} (${durationMs}ms)`,
  });

  console.log(
    `[${CRD_SERVICE_ID}] hook=${cdsRequest.hook} patient=${patientId} → ${outcome} (${durationMs}ms)`
  );

  return NextResponse.json(response, { headers: CORS });
}
