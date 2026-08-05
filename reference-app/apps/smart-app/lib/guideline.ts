/**
 * CQL guideline evaluation for the CDS SMART App.
 *
 * Evaluates BreastCancerGuideline.elm.json against patient resources to
 * determine regimen eligibility.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CqlExecutionEngine } from "@mopa/cql-engine";
import type { ElmJson } from "@mopa/cql-engine";

// Load the compiled ELM JSON at module init time. Using readFileSync +
// JSON.parse avoids `require()` on a JSON file and works in both CJS and
// ESM module resolution modes.
const guidelineElm = JSON.parse(
  readFileSync(resolve(process.cwd(), "cql/elm/BreastCancerGuideline.elm.json"), "utf-8")
) as ElmJson;

const engine = new CqlExecutionEngine();

interface RegimenEligibility {
  thOnGuideline: boolean;
  phdOnGuideline: boolean;
  ddactOnGuideline: boolean;
}

export interface Regimen {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  onGuideline: boolean;
}

export const REGIMENS: Omit<Regimen, "onGuideline">[] = [
  {
    id: "TH",
    shortLabel: "TH",
    label: "TH — Trastuzumab + Paclitaxel",
    description: "Weekly paclitaxel with trastuzumab. First-line for HER2+ early breast cancer.",
  },
  {
    id: "PHD",
    shortLabel: "PHD",
    label: "PHD — Pertuzumab + Trastuzumab + Docetaxel",
    description:
      "Pertuzumab, trastuzumab, and docetaxel. First-line for HER2+ metastatic breast cancer.",
  },
  {
    id: "ddACT",
    shortLabel: "ddAC→T",
    label: "ddAC→T — Dose-dense AC followed by Paclitaxel",
    description:
      "Dose-dense doxorubicin/cyclophosphamide followed by paclitaxel. For HER2-negative disease.",
  },
];

export async function evaluateGuideline(
  patientId: string,
  resources: unknown[]
): Promise<Regimen[]> {
  const results = await engine.evaluate(guidelineElm, patientId, resources);

  const eligibility: RegimenEligibility = {
    thOnGuideline:    (results["TH Eligible"]    as boolean) ?? false,
    phdOnGuideline:   (results["PHD Eligible"]   as boolean) ?? false,
    ddactOnGuideline: (results["ddACT Eligible"] as boolean) ?? false,
  };

  return REGIMENS.map((r) => ({
    ...r,
    onGuideline:
      (
        {
          TH:    eligibility.thOnGuideline,
          PHD:   eligibility.phdOnGuideline,
          ddACT: eligibility.ddactOnGuideline,
        } as Record<string, boolean>
      )[r.id] ?? false,
  }));
}
