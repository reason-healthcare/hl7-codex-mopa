/**
 * Canonical demo patient case definitions.
 *
 * Single source of truth for the patient metadata shown on the Hub Demo
 * Patient Cases tab and the EHR patient list. Both UIs import from here
 * rather than maintaining separate hardcoded arrays.
 */

export type DemoOutcome =
  | "Approvable"
  | "PA Required"
  | "DTR Required"
  | "Step Therapy";

export interface DemoCase {
  /** FHIR Patient.id — matches the fixture bundle and HAPI resource id. */
  patientId: string;
  /** Display name (kept in sync with the fixture bundle). */
  name: string;
  /** Date of birth (kept in sync with the fixture bundle). */
  dob: string;
  /** Medical record number shown in the UI. */
  mrn: string;
  /** Expected CDS outcome label for the demo card badge. */
  outcome: DemoOutcome;
  /** Short description of why this outcome occurs. */
  outcomeNote: string;
}

export const DEMO_CASES: DemoCase[] = [
  {
    patientId: "jane-smith",
    name: "Jane Smith",
    dob: "1972-04-15",
    mrn: "MRN-001",
    outcome: "Approvable",
    outcomeNote: "ECOG 0 — PA not required",
  },
  {
    patientId: "maria-garcia",
    name: "Maria Garcia",
    dob: "1975-08-22",
    mrn: "MRN-002",
    outcome: "PA Required",
    outcomeNote: "ECOG 1 — submit PA to payer",
  },
  {
    patientId: "sandra-chen",
    name: "Sandra Chen",
    dob: "1963-11-05",
    mrn: "MRN-003",
    outcome: "DTR Required",
    outcomeNote: "HER2 absent — collect via DTR",
  },
  {
    patientId: "katherine-johnson",
    name: "Katherine Johnson",
    dob: "1974-03-15",
    mrn: "MRN-004",
    outcome: "Step Therapy",
    outcomeNote: "ER+, HER2-, OncotypeDX 28 — ddAC→T + Udenyca step therapy",
  },
];
