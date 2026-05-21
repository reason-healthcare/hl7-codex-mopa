import { type NextRequest, NextResponse } from "next/server";
import { gzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import {
  GUIDELINE_PLAN_DEFINITION,
  PLAN_DEFINITION,
  GUIDELINE_LIBRARY,
  PAYER_POLICY_LIBRARY,
} from "../../../content-data";
import { LIBRARY_RESOURCE } from "../../../content-data";

// ---------------------------------------------------------------------------
// Minimal POSIX ustar tar writer — no external dependencies
// ---------------------------------------------------------------------------

function tarEntry(name: string, content: Buffer): Buffer {
  const header = Buffer.alloc(512, 0);
  // Name (100 bytes)
  header.write(name.slice(0, 99), 0, "utf8");
  // Mode
  header.write("0000644\0", 100, "utf8");
  // UID / GID
  header.write("0000000\0", 108, "utf8");
  header.write("0000000\0", 116, "utf8");
  // Size (octal, 11 digits + null)
  header.write(`${content.length.toString(8).padStart(11, "0")}\0`, 124, "utf8");
  // Modification time
  header.write(
    `${Math.floor(Date.now() / 1000)
      .toString(8)
      .padStart(11, "0")}\0`,
    136,
    "utf8"
  );
  // Type: regular file
  header.write("0", 156, "utf8");
  // Magic + version
  header.write("ustar\0", 257, "utf8");
  header.write("00", 263, "utf8");

  // Checksum: fill field with spaces, sum all bytes, then write back
  header.fill(0x20, 148, 156);
  let sum = 0;
  // biome-ignore lint/style/noNonNullAssertion: fixed-size buffer
  for (let i = 0; i < 512; i++) sum += header[i]!;
  header.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, "utf8");

  // Content padded to 512-byte boundary
  const pad = (512 - (content.length % 512)) % 512;
  return Buffer.concat([header, content, Buffer.alloc(pad, 0)]);
}

function buildTar(files: { name: string; content: Buffer }[]): Buffer {
  return Buffer.concat([
    ...files.map((f) => tarEntry(f.name, f.content)),
    Buffer.alloc(1024, 0), // end-of-archive marker
  ]);
}

// ---------------------------------------------------------------------------
// Package contents per layer
// ---------------------------------------------------------------------------

function readCql(filename: string): Buffer {
  try {
    return fs.readFileSync(path.join(process.cwd(), "..", "..", "cql", filename));
  } catch {
    return Buffer.from(`// ${filename} not found\n`);
  }
}

function json(obj: object): Buffer {
  return Buffer.from(JSON.stringify(obj, null, 2), "utf8");
}

function packageJson(name: string, description: string): Buffer {
  return json({
    name,
    version: "0.1.0",
    description,
    author: "OGCA Reference Application",
    fhirVersions: ["4.0.1"],
    dependencies: { "hl7.fhir.r4.core": "4.0.1" },
  });
}

const LAYERS = {
  "1": {
    filename: "ogca-layer1-guideline-0.1.0.tgz",
    pkgName: "@ogca/layer1-guideline",
    pkgDesc: "OGCA Layer 1 — Breast Cancer Guideline Authority",
    files: () => [
      {
        name: "package/package.json",
        content: packageJson(
          "@ogca/layer1-guideline",
          "OGCA Layer 1 — Breast Cancer Guideline Authority"
        ),
      },
      {
        name: "package/PlanDefinition-BreastCancerGuidelineCDS.json",
        content: json(GUIDELINE_PLAN_DEFINITION),
      },
      { name: "package/Library-BreastCancerGuideline.json", content: json(GUIDELINE_LIBRARY) },
      { name: "package/BreastCancerGuideline.cql", content: readCql("BreastCancerGuideline.cql") },
    ],
  },
  "2": {
    filename: "ogca-layer2-payer-policy-0.1.0.tgz",
    pkgName: "@ogca/layer2-payer-policy",
    pkgDesc: "OGCA Layer 2 — Breast Cancer Payer Policy",
    files: () => [
      {
        name: "package/package.json",
        content: packageJson(
          "@ogca/layer2-payer-policy",
          "OGCA Layer 2 — Breast Cancer Payer Policy"
        ),
      },
      {
        name: "package/PlanDefinition-BreastCancerPAWorkflow.json",
        content: json(PLAN_DEFINITION),
      },
      { name: "package/Library-BreastCancerPayerPolicy.json", content: json(PAYER_POLICY_LIBRARY) },
      {
        name: "package/Library-BreastCancerPADataRequirements.json",
        content: json(LIBRARY_RESOURCE),
      },
      {
        name: "package/BreastCancerPayerPolicy.cql",
        content: readCql("BreastCancerPayerPolicy.cql"),
      },
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export function GET(req: NextRequest) {
  const layer = req.nextUrl.searchParams.get("layer") as "1" | "2" | null;
  const pkg = layer ? LAYERS[layer] : null;
  if (!pkg) {
    return NextResponse.json({ error: "layer must be 1 or 2" }, { status: 400 });
  }

  const tgz = gzipSync(buildTar(pkg.files()));

  return new NextResponse(tgz, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${pkg.filename}"`,
      "Content-Length": String(tgz.length),
    },
  });
}
