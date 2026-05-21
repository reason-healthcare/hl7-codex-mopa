import { NextResponse } from "next/server";
import janeSmith from "../../../../../../fixtures/jane-smith-bundle.json";
import mariaGarcia from "../../../../../../fixtures/maria-garcia-bundle.json";
import sandraChen from "../../../../../../fixtures/sandra-chen-bundle.json";

const PATIENTS = [
  { id: "jane-smith", bundle: janeSmith },
  { id: "maria-garcia", bundle: mariaGarcia },
  { id: "sandra-chen", bundle: sandraChen },
] as const;

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

/**
 * POST /api/fixtures/reset
 *
 * Purges all existing OGCA demo patient data from HAPI FHIR and
 * reloads all three fixture bundles. Equivalent to running
 * bash fixtures/load-fixtures.sh but callable from the browser.
 */
export async function POST() {
  const fhirBase = process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const { id, bundle } of PATIENTS) {
    // Purge existing data (referencing resources first)
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
      results.push({ id, ok: res.ok, error: res.ok ? undefined : `HTTP ${res.status}` });
    } catch (e) {
      results.push({ id, ok: false, error: e instanceof Error ? e.message : "fetch failed" });
    }
  }

  const allOk = results.every((r) => r.ok);
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 502 });
}
