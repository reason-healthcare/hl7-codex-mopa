import { NextResponse } from "next/server";
import janeSmith from "../../../../../../fixtures/jane-smith-bundle.json";
import katherineJohnson from "../../../../../../fixtures/katherine-johnson-bundle.json";
import mariaGarcia from "../../../../../../fixtures/maria-garcia-bundle.json";
import sandraChen from "../../../../../../fixtures/sandra-chen-bundle.json";

const PATIENTS = [
  { id: "jane-smith", bundle: janeSmith },
  { id: "maria-garcia", bundle: mariaGarcia },
  { id: "sandra-chen", bundle: sandraChen },
  { id: "katherine-johnson", bundle: katherineJohnson },
] as const;

const PAYER_ID = "mopa-reference-payer";
const coverageId = (patientId: string) => `mopa-reference-coverage-${patientId}`;

async function del(fhirBase: string, path: string) {
  try {
    await fetch(`${fhirBase}/${path}`, {
      method: "DELETE",
      headers: { Accept: "application/fhir+json" },
    });
  } catch {
    /* non-fatal */
  }
}

async function deleteOwnedCoverage(fhirBase: string, patientId: string) {
  const path = `Coverage/${coverageId(patientId)}`;
  const res = await fetch(`${fhirBase}/${path}`, {
    method: "DELETE",
    headers: { Accept: "application/fhir+json" },
  });
  if (!res.ok && res.status !== 404) throw new Error(`${path}: HTTP ${res.status}`);
}

async function put(fhirBase: string, path: string, resource: object) {
  const res = await fetch(`${fhirBase}/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/fhir+json", Accept: "application/fhir+json" },
    body: JSON.stringify(resource),
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
}

/**
 * POST /api/fixtures/reset
 *
 * Reloads all four MOPA fixture patients. The partner DTR path needs an active
 * Coverage for each recreated Patient, so reset also recreates only this app's
 * synthetic Coverage resources. Other Coverage records are left untouched.
 */
export async function POST() {
  const fhirBase = process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  try {
    await put(fhirBase, `Organization/${PAYER_ID}`, {
      resourceType: "Organization",
      id: PAYER_ID,
      active: true,
      name: "MOPA Reference Synthetic Payer",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "payer setup failed" },
      { status: 502 }
    );
  }

  for (const { id, bundle } of PATIENTS) {
    // Purge existing data (referencing resources first)
    try {
      await deleteOwnedCoverage(fhirBase, id);
    } catch (e) {
      results.push({
        id,
        ok: false,
        error: e instanceof Error ? e.message : "Coverage reset failed",
      });
      continue;
    }
    await del(fhirBase, `Observation?patient=${id}`);
    await del(fhirBase, `Condition?patient=${id}`);
    await del(fhirBase, `QuestionnaireResponse?patient=${id}`);
    await del(fhirBase, `Patient/${id}`);

    // Load bundle as a FHIR transaction
    try {
      const res = await fetch(fhirBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/fhir+json",
          Accept: "application/fhir+json",
        },
        body: JSON.stringify(bundle),
      });
      if (!res.ok) {
        results.push({ id, ok: false, error: `Fixture bundle: HTTP ${res.status}` });
        continue;
      }
      await put(fhirBase, `Coverage/${coverageId(id)}`, {
        resourceType: "Coverage",
        id: coverageId(id),
        status: "active",
        beneficiary: { reference: `Patient/${id}` },
        payor: [{ reference: `Organization/${PAYER_ID}` }],
      });
      results.push({ id, ok: true });
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : "fetch failed" });
    }
  }

  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 502 });
}
