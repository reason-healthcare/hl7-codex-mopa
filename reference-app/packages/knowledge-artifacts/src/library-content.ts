/**
 * Embeds CQL source and compiled ELM JSON into a FHIR Library resource,
 * following the Using CQL with FHIR IG specification.
 *
 * content[0]: text/cql            — human-readable CQL source (base64)
 * content[1]: application/elm+json — compiled ELM (base64)
 *
 * The `url` field retains the canonical reference; `data` carries the
 * inline base64-encoded payload as required by the spec.
 */
import fs from "node:fs";
import path from "node:path";

type ContentEntry = { contentType: string; url: string; data?: string };

function readBase64(filePath: string): string {
  try {
    return fs.readFileSync(filePath).toString("base64");
  } catch {
    return "";
  }
}

/**
 * Default CQL root — resolves correctly for any app in apps/*
 * since process.cwd() returns the app directory at runtime.
 */
function defaultCqlRoot(): string {
  return path.join(process.cwd(), "..", "..", "cql");
}

export function withEmbeddedContent<
  T extends { content?: readonly { contentType: string; url: string }[] },
>(
  library: T,
  cqlFilename: string,
  elmFilename: string,
  cqlRoot = defaultCqlRoot()
): Omit<T, "content"> & { content: ContentEntry[] } {
  return {
    ...library,
    content: [
      {
        contentType: "text/cql",
        url: library.content?.[0]?.url ?? "",
        data: readBase64(path.join(cqlRoot, cqlFilename)),
      },
      {
        contentType: "application/elm+json",
        url: library.content?.[1]?.url ?? "",
        data: readBase64(path.join(cqlRoot, "elm", elmFilename)),
      },
    ],
  };
}
