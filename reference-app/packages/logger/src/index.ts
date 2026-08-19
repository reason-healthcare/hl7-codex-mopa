/**
 * @mopa/logger
 *
 * Structured NDJSON logger for all MOPA reference services.
 *
 * Each service creates a logger with createLogger("service-name").
 * Every entry is written unbuffered to process.stdout (12-factor).
 * When LOG_HUB_URL is set in the environment the same entry is also
 * fire-and-forget POSTed to the Hub ingest endpoint — the service
 * never awaits or retries this call, so Hub availability never
 * affects request handling.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ServiceName = "crd" | "dtr" | "pas" | "payer" | "hub" | "ehr";

export type LogLevel = "info" | "warn" | "error";

/** All possible structured log entry types across MOPA services. */
export type LogType =
  | "cds.request"   // Incoming CDS Hooks request received
  | "cds.response"  // CDS Hooks response sent
  | "fhir.read"     // Outgoing FHIR GET against clinical patient data
  | "fhir.write"    // Outgoing FHIR POST/PUT (write-back)
  | "crmi.read"     // Outgoing read against a knowledge artifact repository (Hub / CRMI)
  | "dtr.launch"    // DTR SMART launch initiated
  | "dtr.submit"    // DTR questionnaire submitted
  | "pa.submit"     // PA $submit received by PAS
  | "pa.evaluate"   // Payer policy evaluation invoked
  | "pa.result"     // PA determination returned
  | "smart.launch"  // SMART App launch initiated
  | "smart.token"   // SMART access token issued
  | "error";        // Any service-level error

export interface LogEntry {
  /** ISO 8601 timestamp — set automatically by log(). */
  ts: string;
  service: ServiceName;
  level: LogLevel;
  type: LogType;

  /** CDS Hooks hookInstance, threaded as X-Correlation-ID through all
   *  downstream calls triggered by the same interaction. */
  correlationId?: string;

  /** FHIR Patient.id for the current patient context. */
  patientId?: string;

  // HTTP fields
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;

  // CDS Hooks fields
  hook?: string;
  outcome?: string;

  // DTR fields
  missingElements?: string[];

  // PA fields
  paResult?: string;

  /** Full request payload — expandable in the Hub Activity viewer. */
  request?: unknown;
  /** Full response payload — expandable in the Hub Activity viewer. */
  response?: unknown;

  /** Human-readable one-liner shown in the Activity feed. */
  summary: string;

  /** Any additional service-specific fields. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Ingest URL (set once at module load — env var reads are cheap but static)
// ---------------------------------------------------------------------------

const HUB_LOG_URL: string | undefined =
  typeof process !== "undefined" ? process.env.LOG_HUB_URL : undefined;

// ---------------------------------------------------------------------------
// Core write function
// ---------------------------------------------------------------------------

export function log(entry: Omit<LogEntry, "ts">): void {
  const full = { ts: new Date().toISOString(), ...entry } as LogEntry;

  // 12-factor: always write to stdout first, unbuffered
  if (typeof process !== "undefined" && process.stdout) {
    process.stdout.write(`${JSON.stringify(full)}\n`);
  }

  // Optional: forward to Hub — fire and forget, never throws
  if (HUB_LOG_URL) {
    fetch(HUB_LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(full),
    }).catch(() => {
      // Intentionally swallowed — Hub unavailability must never affect services
    });
  }
}

// ---------------------------------------------------------------------------
// Service logger factory
// ---------------------------------------------------------------------------

type LogData = Omit<LogEntry, "ts" | "service" | "level" | "type">;

export interface ServiceLogger {
  info(type: LogType, data: LogData): void;
  warn(type: LogType, data: LogData): void;
  error(type: LogType, data: LogData): void;
}

export function createLogger(service: ServiceName): ServiceLogger {
  return {
    info: (type, data) => log({ ...data, service, level: "info", type }),
    warn: (type, data) => log({ ...data, service, level: "warn", type }),
    error: (type, data) => log({ ...data, service, level: "error", type }),
  };
}
