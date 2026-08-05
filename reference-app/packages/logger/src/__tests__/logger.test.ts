import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log, createLogger } from "../index";

function getLastWritten(): Record<string, unknown> | undefined {
  const calls = vi.mocked(process.stdout.write).mock.calls;
  if (calls.length === 0) return undefined;
  const last = calls[calls.length - 1]?.[0] as string;
  return JSON.parse(last.trim());
}

describe("log", () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes a JSON line to stdout with timestamp added", () => {
    log({
      service: "crd",
      level: "info",
      type: "cds.request",
      summary: "test message",
    });
    const parsed = getLastWritten();
    expect(parsed?.ts).toBeDefined();
    expect(parsed?.service).toBe("crd");
    expect(parsed?.level).toBe("info");
    expect(parsed?.type).toBe("cds.request");
    expect(parsed?.summary).toBe("test message");
  });

  it("preserves all extra fields from the entry", () => {
    log({
      service: "payer",
      level: "warn",
      type: "pa.evaluate",
      patientId: "jane",
      status: 200,
      summary: "eval",
    });
    const parsed = getLastWritten();
    expect(parsed?.patientId).toBe("jane");
    expect(parsed?.status).toBe(200);
  });
});

describe("createLogger", () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a logger that writes with the service name and level", () => {
    const logger = createLogger("pas");
    logger.info("pa.submit", { summary: "submit" });
    const parsed = getLastWritten();
    expect(parsed?.service).toBe("pas");
    expect(parsed?.level).toBe("info");
  });

  it("warn() sets level to warn", () => {
    const logger = createLogger("hub");
    logger.warn("error", { summary: "warn test" });
    const parsed = getLastWritten();
    expect(parsed?.level).toBe("warn");
  });

  it("error() sets level to error", () => {
    const logger = createLogger("ehr");
    logger.error("error", { summary: "err test" });
    const parsed = getLastWritten();
    expect(parsed?.level).toBe("error");
  });
});
