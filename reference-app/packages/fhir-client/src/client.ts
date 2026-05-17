import { z } from "zod";
import {
  PatientSchema,
  ConditionSchema,
  ObservationSchema,
  BundleSchema,
} from "./schemas";
import type { Patient, Condition, Observation, Bundle, Resource } from "./schemas";

export type { Patient, Condition, Observation, Bundle, Resource };
export { PatientSchema, ConditionSchema, ObservationSchema, BundleSchema };
export * from "./schemas";

// ---------------------------------------------------------------------------
// Typed FHIR fetch client
// ---------------------------------------------------------------------------

export interface FhirClientConfig {
  baseUrl: string;
  /** Bearer token — omit for unauthenticated requests */
  accessToken?: string;
}

export class FhirClient {
  private baseUrl: string;
  private accessToken?: string;

  constructor(config: FhirClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.accessToken = config.accessToken;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
    };
    if (this.accessToken) {
      h["Authorization"] = `Bearer ${this.accessToken}`;
    }
    return h;
  }

  async read<S extends z.ZodTypeAny>(
    resourceType: string,
    id: string,
    schema: S
  ): Promise<z.infer<S>> {
    const res = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new Error(
        `FHIR read failed: ${res.status} ${res.statusText} — ${resourceType}/${id}`
      );
    }
    const json = await res.json();
    return schema.parse(json);
  }

  async search<S extends z.ZodTypeAny>(
    resourceType: string,
    params: Record<string, string>,
    schema: S
  ): Promise<z.infer<S>> {
    const qs = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/${resourceType}${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      throw new Error(
        `FHIR search failed: ${res.status} ${res.statusText} — ${resourceType}`
      );
    }
    const json = await res.json();
    return schema.parse(json);
  }

  async create<S extends z.ZodTypeAny>(
    resource: unknown,
    schema: S
  ): Promise<z.infer<S>> {
    const body = resource as { resourceType: string };
    const res = await fetch(`${this.baseUrl}/${body.resourceType}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(resource),
    });
    if (!res.ok) {
      throw new Error(`FHIR create failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return schema.parse(json);
  }

  async transaction(bundle: Bundle): Promise<Bundle> {
    const res = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(bundle),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `FHIR transaction failed: ${res.status} ${res.statusText}\n${text}`
      );
    }
    const json = await res.json();
    return BundleSchema.parse(json);
  }
}

// ---------------------------------------------------------------------------
// Patient convenience helpers
// ---------------------------------------------------------------------------

export function getPatientDisplayName(patient: Patient): string {
  const name = patient.name?.[0];
  if (!name) return patient.id ?? "Unknown";
  if (name.text) return name.text;
  const given = name.given?.join(" ") ?? "";
  const family = name.family ?? "";
  // Parentheses required: don't mix || and ?? without them
  return [given, family].filter(Boolean).join(" ") || (patient.id ?? "Unknown");
}

export function getPatientDOB(patient: Patient): string {
  return patient.birthDate ?? "Unknown";
}

export function getPatientGender(patient: Patient): string {
  return patient.gender ?? "unknown";
}

export function getPatientMRN(patient: Patient): string | undefined {
  return patient.identifier?.find(
    (i) => i.type?.coding?.some((c: { code?: string }) => c.code === "MR")
  )?.value;
}
