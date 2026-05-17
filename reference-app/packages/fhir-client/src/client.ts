import type { z } from "zod";
import { BundleSchema } from "./schemas";
import type { Bundle } from "./schemas";

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
    if (this.accessToken) h.Authorization = `Bearer ${this.accessToken}`;
    return h;
  }

  /** Assert response is OK then parse the JSON body through a Zod schema. */
  private async parseResponse<S extends z.ZodTypeAny>(
    res: Response,
    schema: S,
    label: string
  ): Promise<z.infer<S>> {
    if (!res.ok) {
      throw new Error(`FHIR ${label} failed: ${res.status} ${res.statusText}`);
    }
    return schema.parse(await res.json());
  }

  async read<S extends z.ZodTypeAny>(
    resourceType: string,
    id: string,
    schema: S
  ): Promise<z.infer<S>> {
    const res = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
      headers: this.headers(),
    });
    return this.parseResponse(res, schema, `read ${resourceType}/${id}`);
  }

  async search<S extends z.ZodTypeAny>(
    resourceType: string,
    params: Record<string, string>,
    schema: S
  ): Promise<z.infer<S>> {
    const qs = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/${resourceType}${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, { headers: this.headers() });
    return this.parseResponse(res, schema, `search ${resourceType}`);
  }

  async create<S extends z.ZodTypeAny>(resource: unknown, schema: S): Promise<z.infer<S>> {
    const { resourceType } = resource as { resourceType: string };
    const res = await fetch(`${this.baseUrl}/${resourceType}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(resource),
    });
    return this.parseResponse(res, schema, `create ${resourceType}`);
  }

  async transaction(bundle: Bundle): Promise<Bundle> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(bundle),
    });
    return this.parseResponse(res, BundleSchema, "transaction");
  }
}

// ---------------------------------------------------------------------------
// Patient convenience helpers
// ---------------------------------------------------------------------------

export {
  getPatientDisplayName,
  getPatientDOB,
  getPatientGender,
  getPatientMRN,
} from "./patient-helpers";
