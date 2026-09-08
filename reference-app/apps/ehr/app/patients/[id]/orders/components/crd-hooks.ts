"use client";

import type { CdsResponse } from "@mopa/cds-hooks";
import { buildDraftBundle, type Regimen } from "@mopa/oncology-policy";

/**
 * Fire a CDS Hooks order-select or order-sign request through the EHR's
 * /api/crd-hooks proxy route. The proxy injects fhirServer and
 * fhirAuthorization server-side.
 *
 * @param hook       - "order-select" or "order-sign"
 * @param patientId  - FHIR patient ID
 * @param regimen    - selected regimen (used to build draftOrders if no override)
 * @param draftOrdersOverride - when provided (e.g. after suggestion acceptance),
 *                              sends the modified Bundle instead of rebuilding
 *                              from the regimen template
 * @param categories          - patient/order-specific RequestGroup categories
 */
export async function fireCdsHook(
  hook: "order-select" | "order-sign",
  patientId: string,
  regimen: Regimen,
  draftOrdersOverride?: object,
  categories?: import("@mopa/oncology-policy").RegimenCategory[]
): Promise<CdsResponse> {
  const draftOrders =
    draftOrdersOverride ?? buildDraftBundle(patientId, regimen, { stage: hook, categories });

  const body = {
    hookInstance: crypto.randomUUID(),
    hook,
    context: {
      userId: "Practitioner/demo-user",
      patientId,
      draftOrders,
      selections: [`urn:uuid:rg-${regimen.id}`],
    },
  };

  const res = await fetch(`/api/crd-hooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`CRD service error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<CdsResponse>;
}
