// Type stub for @ogca/fhir-client used by PatientBanner.
// The full types live in packages/fhir-client; this stub keeps
// the @ogca/ui typecheck self-contained.
declare module "@ogca/fhir-client" {
  export interface HumanName {
    use?: string;
    family?: string;
    given?: string[];
  }
  export interface Patient {
    id?: string;
    resourceType: "Patient";
    name?: HumanName[];
    birthDate?: string;
    gender?: string;
  }
}
