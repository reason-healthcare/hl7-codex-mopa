import { createLogger } from "@mopa/logger";
import { type NextRequest, NextResponse } from "next/server";
import {
  buildPartnerPasBundle,
  submitPartnerPas,
  summarizePartnerPas,
} from "../../../lib/partner-pas";

const PAS_SERVICE_URL = process.env.PAS_SERVICE_URL ?? "http://localhost:4005";
const logger = createLogger("ehr");

/**
 * POST /api/pa-submit
 *
 * Server-side proxy from the EHR order entry UI to the PAS Service.
 * Forwards { patientId, regimenId, regimenLabel } and returns the
 * FHIR ClaimResponse from the PAS Service.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (process.env.PAS_PARTNER_BASE_URL) {
      const input = body as {
        patientId?: string;
        regimenId?: string;
        draftOrders?: unknown;
        claimId?: string;
      };
      if (!input?.patientId || !input.regimenId || !input.draftOrders) {
        return NextResponse.json(
          { error: "Signed regimen, patient and regimen ID are required" },
          { status: 400 }
        );
      }
      const bundle = await buildPartnerPasBundle({
        patientId: input.patientId,
        regimenId: input.regimenId,
        draftOrders: input.draftOrders,
        claimId: input.claimId,
      });
      const startedAt = Date.now();
      const upstream = await submitPartnerPas(bundle);
      logger.info("pa.submit", {
        correlationId: input.claimId,
        patientId: input.patientId,
        method: "POST",
        path: "/Claim/$submit",
        requestUrl: `${process.env.PAS_PARTNER_BASE_URL.replace(/\/$/, "")}/Claim/$submit`,
        status: upstream.status,
        durationMs: Date.now() - startedAt,
        request: bundle,
        response: upstream.payload,
        summary: `PAS submit → synthetic partner (${upstream.status})`,
      });
      if (upstream.status < 200 || upstream.status >= 300) {
        return NextResponse.json(
          {
            error: `Partner PAS rejected request (HTTP ${upstream.status})`,
            outcome: upstream.payload,
          },
          { status: upstream.status }
        );
      }
      return NextResponse.json({ ...summarizePartnerPas(upstream.payload), canInquire: true });
    }
    const res = await fetch(`${PAS_SERVICE_URL}/api/fhir/$submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PAS Service unreachable";
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
