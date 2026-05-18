import { z } from "zod";

// ---------------------------------------------------------------------------
// CDS Hooks — Service descriptor
// ---------------------------------------------------------------------------

/**
 * OGCA extension on a CDS service descriptor.
 * Carried in the `extension` map of a CdsService.
 */
export interface OgcaServiceExtension {
  /** Canonical URL of the FHIR Library that defines the PA data requirements. */
  libraryUrl: string;
  /** Whether the service may return suggestions that modify draft orders. */
  willUpdateOrders?: boolean;
}

export interface CdsService {
  id: string;
  hook: "order-select" | "order-sign" | string;
  title?: string;
  description: string;
  /** Prefetch templates: key → FHIR query string with {{context.X}} placeholders. */
  prefetch?: Record<string, string>;
  extension?: {
    "ogca-service-extension"?: OgcaServiceExtension;
    [key: string]: unknown;
  };
}

export interface CdsDiscoveryResponse {
  services: CdsService[];
}

// ---------------------------------------------------------------------------
// Hook contexts
// ---------------------------------------------------------------------------

export interface OrderSelectContext {
  userId: string;
  patientId: string;
  encounterId?: string;
  /** Bundle (type = collection) of draft MedicationRequest resources. */
  draftOrders: {
    resourceType: "Bundle";
    type: string;
    entry?: Array<{ resource: unknown }>;
  };
  selections: string[];
}

export interface OrderSignContext {
  userId: string;
  patientId: string;
  encounterId?: string;
  draftOrders: {
    resourceType: "Bundle";
    type: string;
    entry?: Array<{ resource: unknown }>;
  };
}

// ---------------------------------------------------------------------------
// CDS Hooks request
// ---------------------------------------------------------------------------

export interface CdsFhirAuthorization {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  subject: string;
}

export interface CdsRequest<
  TContext = OrderSelectContext | OrderSignContext | Record<string, unknown>,
> {
  hookInstance: string;
  hook: string;
  context: TContext;
  prefetch?: Record<string, unknown>;
  fhirServer?: string;
  fhirAuthorization?: CdsFhirAuthorization;
}

// ---------------------------------------------------------------------------
// CDS Hooks response — cards
// ---------------------------------------------------------------------------

export type CardIndicator = "info" | "warning" | "critical";

export interface CdsAction {
  type: "create" | "update" | "delete";
  description: string;
  resource?: unknown;
}

export interface CdsSuggestion {
  label: string;
  uuid?: string;
  isRecommended?: boolean;
  actions?: CdsAction[];
}

export interface CdsLink {
  label: string;
  url: string;
  type: "absolute" | "smart";
  appContext?: string;
}

export interface CdsCard {
  uuid?: string;
  summary: string;
  detail?: string;
  indicator: CardIndicator;
  source: {
    label: string;
    url?: string;
    icon?: string;
    topic?: { code: string; display?: string; system?: string };
  };
  suggestions?: CdsSuggestion[];
  selectionBehavior?: "at-most-one";
  overrideReasons?: Array<{ code: string; display?: string; system?: string }>;
  links?: CdsLink[];
}

export interface CdsResponse {
  cards: CdsCard[];
  systemActions?: CdsAction[];
}

// ---------------------------------------------------------------------------
// Zod schemas for runtime validation at API boundaries
// ---------------------------------------------------------------------------

const CdsActionSchema = z.object({
  type: z.enum(["create", "update", "delete"]),
  description: z.string(),
  resource: z.unknown().optional(),
});

const CdsSuggestionSchema = z.object({
  label: z.string(),
  uuid: z.string().optional(),
  isRecommended: z.boolean().optional(),
  actions: z.array(CdsActionSchema).optional(),
});

const CdsLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
  type: z.enum(["absolute", "smart"]),
  appContext: z.string().optional(),
});

export const CdsCardSchema = z.object({
  uuid: z.string().optional(),
  summary: z.string(),
  detail: z.string().optional(),
  indicator: z.enum(["info", "warning", "critical"]),
  source: z.object({
    label: z.string(),
    url: z.string().optional(),
    icon: z.string().optional(),
    topic: z
      .object({ code: z.string(), display: z.string().optional(), system: z.string().optional() })
      .optional(),
  }),
  suggestions: z.array(CdsSuggestionSchema).optional(),
  selectionBehavior: z.literal("at-most-one").optional(),
  links: z.array(CdsLinkSchema).optional(),
});

export const CdsResponseSchema = z.object({
  cards: z.array(CdsCardSchema),
  systemActions: z.array(CdsActionSchema).optional(),
});

export const CdsRequestSchema = z.object({
  hookInstance: z.string(),
  hook: z.string(),
  context: z.record(z.unknown()),
  prefetch: z.record(z.unknown()).optional(),
  fhirServer: z.string().optional(),
  fhirAuthorization: z
    .object({
      access_token: z.string(),
      token_type: z.literal("Bearer"),
      expires_in: z.number(),
      scope: z.string(),
      subject: z.string(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// Prefetch resolution
// ---------------------------------------------------------------------------

/**
 * Substitute `{{context.X}}` placeholders in a prefetch template string.
 *
 * @param template - A FHIR query template such as `"Patient/{{context.patientId}}"`
 * @param context  - The hook context object to read values from.
 * @returns The resolved query string.
 */
export function substituteTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\{context\.([^}]+)\}\}/g, (_match, key: string) => {
    const val = context[key];
    return val != null ? String(val) : "";
  });
}

/**
 * Resolve any prefetch templates not already populated by the EHR.
 *
 * Fetches each missing key against `fhirBase` and returns the merged prefetch
 * map. Templates already present in `existing` are kept as-is.
 *
 * @param templates  - The service's declared prefetch template map.
 * @param fhirBase   - FHIR server base URL (no trailing slash).
 * @param context    - The hook's context (provides template variable values).
 * @param existing   - Prefetch already provided by the EHR (may be partial).
 * @returns A prefetch map with all templates resolved.
 */
export async function resolvePrefetch(
  templates: Record<string, string>,
  fhirBase: string,
  context: Record<string, unknown>,
  existing: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const base = fhirBase.replace(/\/$/, "");
  const result: Record<string, unknown> = { ...existing };

  await Promise.all(
    Object.entries(templates).map(async ([key, template]) => {
      if (result[key] != null) return; // already populated by EHR

      const query = substituteTemplate(template, context);
      if (!query) return;

      try {
        const res = await fetch(`${base}/${query}`, {
          headers: { Accept: "application/fhir+json" },
        });
        if (res.ok) result[key] = await res.json();
      } catch {
        // prefetch failure is non-fatal — handler will treat key as missing
      }
    })
  );

  return result;
}

/**
 * Extract the first resource from a prefetch Bundle entry array.
 * Returns `undefined` when the bundle is absent or empty.
 */
export function firstPrefetchResource(prefetch: unknown): Record<string, unknown> | undefined {
  if (!prefetch || typeof prefetch !== "object") return undefined;
  const bundle = prefetch as { entry?: Array<{ resource?: unknown }> };
  const resource = bundle.entry?.[0]?.resource;
  if (!resource || typeof resource !== "object") return undefined;
  return resource as Record<string, unknown>;
}

/**
 * Count the number of entries in a prefetch Bundle.
 */
export function prefetchEntryCount(prefetch: unknown): number {
  if (!prefetch || typeof prefetch !== "object") return 0;
  const bundle = prefetch as { entry?: unknown[] };
  return bundle.entry?.length ?? 0;
}
