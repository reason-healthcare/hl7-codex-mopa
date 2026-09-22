import { createLogger } from "@mopa/logger";
import { type NextRequest, NextResponse } from "next/server";
import {
  buildPartnerPasBundle,
  inquirePartnerPas,
  summarizePartnerPas,
} from "../../../lib/partner-pas";

const logger = createLogger("ehr");

/** One user-initiated status check for a Claim already submitted by this page. */
export async function POST(request: NextRequest) {
  if (!process.env.PAS_PARTNER_BASE_URL) {
    return NextResponse.json({ error: "Partner PAS inquiry is not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const input = body as {
    patientId?: unknown;
    regimenId?: unknown;
    draftOrders?: unknown;
    claimId?: unknown;
  };
  if (
    !input ||
    typeof input.patientId !== "string" ||
    typeof input.regimenId !== "string" ||
    typeof input.claimId !== "string" ||
    !input.draftOrders
  ) {
    return NextResponse.json(
      { error: "A submitted claim ID, signed regimen, patient and regimen ID are required" },
      { status: 400 }
    );
  }

  try {
    // Rebuild the PAS envelope using the *same* Claim.id; the synthetic payer
    // review desk looks up the saved decision by that identity, not a new case.
    const bundle = await buildPartnerPasBundle({
      patientId: input.patientId,
      regimenId: input.regimenId,
      draftOrders: input.draftOrders,
      claimId: input.claimId,
    });
    const startedAt = Date.now();
    const upstream = await inquirePartnerPas(bundle);
    logger.info("pa.inquire", {
      correlationId: input.claimId,
      patientId: input.patientId,
      method: "POST",
      path: "/Claim/$inquire",
      requestUrl: `${process.env.PAS_PARTNER_BASE_URL?.replace(/\/$/, "")}/Claim/$inquire`,
      status: upstream.status,
      durationMs: Date.now() - startedAt,
      request: bundle,
      response: upstream.payload,
      summary: `PAS inquiry → synthetic partner (${upstream.status})`,
    });
    if (upstream.status < 200 || upstream.status >= 300) {
      return NextResponse.json(
        {
          error: `Partner PAS inquiry failed (HTTP ${upstream.status})`,
          outcome: upstream.payload,
        },
        { status: upstream.status }
      );
    }
    return NextResponse.json({ ...summarizePartnerPas(upstream.payload), canInquire: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Partner PAS inquiry unavailable";
    return NextResponse.json(
      { error: message },
      {
        status:
          /^(Unknown synthetic|Signed |Invalid signed|Duplicate medication|No matching active Coverage|Coverage has no resolvable|Invalid synthetic)/.test(
            message
          )
            ? 400
            : 502,
      }
    );
  }
}
