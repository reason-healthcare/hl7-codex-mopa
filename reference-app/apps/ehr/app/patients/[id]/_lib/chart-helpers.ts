import type { Condition, Observation } from "@mopa/fhir-client";

const SYS_ICD10 = "http://hl7.org/fhir/sid/icd-10-cm";
const SYS_SNOMED = "http://snomed.info/sct";
const SYS_LOINC = "http://loinc.org";

type Coding = { system?: string; code?: string; display?: string };

function pickCoding(codings: Coding[] | undefined, ...priority: string[]): Coding | undefined {
  if (!codings?.length) return undefined;
  for (const sys of priority) {
    const match = codings.find((c) => c.system === sys);
    if (match) return match;
  }
  return codings[0];
}

export function conditionDisplay(cond: Condition): string {
  const c = pickCoding(cond.code?.coding, SYS_ICD10, SYS_SNOMED);
  return c?.display ?? cond.code?.text ?? "Unknown";
}

export function obsDisplay(obs: Observation): string {
  const c = pickCoding(obs.code?.coding, SYS_LOINC, SYS_SNOMED);
  return obs.code?.text ?? c?.display ?? "Unknown";
}

export function formatObsValue(obs: Observation): string {
  if (obs.valueCodeableConcept) {
    const c = pickCoding(obs.valueCodeableConcept.coding, SYS_SNOMED, SYS_LOINC);
    return c?.display ?? c?.code ?? obs.valueCodeableConcept.text ?? "—";
  }
  if (obs.valueQuantity) {
    return `${obs.valueQuantity.value ?? ""} ${obs.valueQuantity.unit ?? ""}`.trim();
  }
  if (obs.valueInteger !== undefined) return String(obs.valueInteger);
  if (obs.valueString) return obs.valueString;
  return "—";
}

export function shortSystem(system: string | undefined): string {
  if (!system) return "";
  if (system === SYS_ICD10) return "ICD-10-CM";
  if (system.includes("icd-10")) return "ICD-10";
  if (system.includes("loinc")) return "LOINC";
  if (system.includes("snomed")) return "SNOMED CT";
  if (system.includes("unitsofmeasure")) return "UCUM";
  if (system.includes("rxnorm")) return "RxNorm";
  return system.split("/").filter(Boolean).pop() ?? system;
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ── Categorize observations into clinical groups ─────────────────────────

export interface CategorizedObs {
  obs: Observation;
  code: string;
  system: string;
  label: string;
  value: string;
  valueCode?: string;
  date: string;
  /** For staging observations: the Condition reference from Observation.focus
   *  (e.g. "Condition/maria-garcia-breast-cancer"). Undefined for non-staging. */
  conditionRef?: string;
}

/** LOINC codes for breast cancer biomarkers (ER, PR, HER2). */
const BIOMARKER_CODES = ["85337-4", "85339-0", "85319-2"];

/**
 * Categorize observations using FHIR relationships per mCODE:
 *
 * - **Staging**: Observations that have `Observation.focus` pointing to a
 *   Condition resource. These are clinical assessments (stage group, ECOG,
 *   Oncotype DX, menopausal status) associated with the cancer diagnosis.
 *   The `conditionRef` field carries the Condition reference so the UI can
 *   group staging with its condition.
 *
 * - **Biomarkers**: Observations with known biomarker LOINC codes (ER, PR,
 *   HER2). These are receptor status results, not linked to a specific
 *   condition via focus.
 *
 * - **Labs**: Everything else.
 */
export function categorizeObservations(observations: Observation[]): {
  biomarkers: CategorizedObs[];
  staging: CategorizedObs[];
  labs: CategorizedObs[];
} {
  const biomarkers: CategorizedObs[] = [];
  const staging: CategorizedObs[] = [];
  const labs: CategorizedObs[] = [];

  for (const obs of observations) {
    const coding = pickCoding(obs.code?.coding, SYS_LOINC, SYS_SNOMED);
    const code = coding?.code ?? "";
    const system = coding?.system ?? "";
    const valCoding = obs.valueCodeableConcept?.coding?.[0];

    const entry: CategorizedObs = {
      obs,
      code,
      system,
      label: obs.code?.text ?? coding?.display ?? "Unknown",
      value: formatObsValue(obs),
      valueCode: valCoding?.code,
      date: obs.effectiveDateTime?.slice(0, 10) ?? "—",
    };

    // Staging: Observation.focus references a Condition (mCODE pattern).
    // In FHIR R4, Observation.focus is 0..* (an array of References).
    const focusArr = (obs as { focus?: Array<{ reference?: string }> | { reference?: string } })
      .focus;
    const focusRef = Array.isArray(focusArr) ? focusArr?.[0]?.reference : focusArr?.reference;
    if (focusRef?.startsWith("Condition/")) {
      entry.conditionRef = focusRef;
      staging.push(entry);
    }
    // Biomarkers: ER/PR/HER2 by LOINC code
    else if (BIOMARKER_CODES.includes(code)) {
      biomarkers.push(entry);
    }
    // Everything else → labs
    else {
      labs.push(entry);
    }
  }

  return { biomarkers, staging, labs };
}
