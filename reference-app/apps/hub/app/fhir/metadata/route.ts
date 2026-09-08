export function GET() {
  const cap = {
    resourceType: "CapabilityStatement",
    status: "active",
    date: new Date().toISOString().slice(0, 10),
    kind: "instance",
    software: { name: "MOPA Reference Hub", version: "0.1.1-snapshot-080926" },
    fhirVersion: "4.0.1",
    format: ["application/fhir+json"],
    implementationGuide: ["http://hl7.org/fhir/us/codex-mopa"],
    description:
      "FHIR Knowledge Artifact Repository. Hosts Library and PlanDefinition " +
      "resources for the MOPA two-layer CDS architecture.",
    rest: [
      {
        mode: "server",
        documentation:
          "Read and search Library and PlanDefinition knowledge artifacts. " +
          "Logic Libraries include embedded CQL source and compiled ELM (base64).",
        resource: [
          {
            type: "Library",
            interaction: [{ code: "read" }, { code: "search-type" }],
            searchParam: [
              { name: "url", type: "uri", documentation: "Canonical URL" },
              { name: "name", type: "string", documentation: "Computed name" },
              { name: "title", type: "string", documentation: "Human-friendly title" },
            ],
          },
          {
            type: "PlanDefinition",
            interaction: [{ code: "read" }, { code: "search-type" }],
            searchParam: [
              { name: "url", type: "uri", documentation: "Canonical URL" },
              { name: "name", type: "string", documentation: "Computed name" },
            ],
          },
        ],
      },
    ],
  };

  return Response.json(cap, {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
