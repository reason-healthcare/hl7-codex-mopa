// CDS Hooks types stub — Phase 2 will flesh these out

export interface CdsService {
  id: string;
  hook: string;
  title?: string;
  description: string;
  prefetch?: Record<string, string>;
}

export interface CdsDiscoveryResponse {
  services: CdsService[];
}

export interface CdsRequest {
  hookInstance: string;
  hook: string;
  context: Record<string, unknown>;
  prefetch?: Record<string, unknown>;
  fhirServer?: string;
  fhirAuthorization?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    subject: string;
  };
}

export interface CdsCard {
  summary: string;
  detail?: string;
  indicator: "info" | "warning" | "critical";
  source: {
    label: string;
    url?: string;
  };
  suggestions?: CdsSuggestion[];
  links?: CdsLink[];
}

export interface CdsSuggestion {
  label: string;
  uuid?: string;
  actions?: CdsAction[];
}

export interface CdsAction {
  type: "create" | "update" | "delete";
  description: string;
  resource?: unknown;
}

export interface CdsLink {
  label: string;
  url: string;
  type: "absolute" | "smart";
  appContext?: string;
}

export interface CdsResponse {
  cards: CdsCard[];
}
