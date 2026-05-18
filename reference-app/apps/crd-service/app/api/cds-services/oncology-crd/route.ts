import { type NextRequest, NextResponse } from "next/server";
import { CdsRequestSchema, resolvePrefetch } from "@ogca/cds-hooks";
import { handleOncologyCrd, PREFETCH_TEMPLATES, CRD_SERVICE_ID } from "../../../../src/crd-logic";
import type { OrderSelectContext } from "@ogca/cds-hooks";

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

  if (!["order-select", "order-sign"].includes(cdsRequest.hook)) {
    return NextResponse.json(
      { error: `Unsupported hook: ${cdsRequest.hook}. Expected order-select or order-sign.` },
      { status: 400, headers: CORS }
    );
  }

  // Resolve any prefetch keys the EHR did not populate
  const fhirBase =
    cdsRequest.fhirServer ?? process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";

  const prefetch = await resolvePrefetch(
    PREFETCH_TEMPLATES,
    fhirBase,
    cdsRequest.context as Record<string, unknown>,
    (cdsRequest.prefetch ?? {}) as Record<string, unknown>
  );

  const response = handleOncologyCrd({
    ...cdsRequest,
    prefetch,
  } as unknown as Parameters<typeof handleOncologyCrd>[0]);

  console.log(
    `[${CRD_SERVICE_ID}] hook=${cdsRequest.hook} patient=${
      (cdsRequest.context as unknown as OrderSelectContext).patientId
    } → ${response.cards[0]?.indicator} "${response.cards[0]?.summary}"`
  );

  return NextResponse.json(response, { headers: CORS });
}
