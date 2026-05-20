/**
 * CQL guideline evaluation for the CDS SMART App.
 *
 * Evaluates BreastCancerGuideline.elm.json against patient resources to
 * determine regimen eligibility.
 */
import { CqlExecutionEngine } from "@ogca/cql-engine";
import type { ElmJson } from "@ogca/cql-engine";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const guidelineElm = require("../../../cql/elm/BreastCancerGuideline.elm.json") as ElmJson;

const engine = new CqlExecutionEngine();

interface RegimenEligibility {
  thEligible: boolean;
  phdEligible: boolean;
  ddactEligible: boolean;
}

export interface Regimen {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  eligible: boolean;
}

export const REGIMENS: Omit<Regimen, "eligible">[] = [
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
    thEligible: (results["TH Eligible"] as boolean) ?? false,
    phdEligible: (results["PHD Eligible"] as boolean) ?? false,
    ddactEligible: (results["ddACT Eligible"] as boolean) ?? false,
  };

  return REGIMENS.map((r) => ({
    ...r,
    eligible:
      (
        {
          TH: eligibility.thEligible,
          PHD: eligibility.phdEligible,
          ddACT: eligibility.ddactEligible,
        } as Record<string, boolean>
      )[r.id] ?? false,
  }));
}
