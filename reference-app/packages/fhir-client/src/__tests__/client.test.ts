import { describe, it, expect } from "vitest";
import { Client } from "../client";

describe("fhir-kit-client re-export", () => {
  it("Client is constructable", () => {
    const client = new Client({ baseUrl: "http://localhost:8080/fhir" });
    expect(client.baseUrl).toBe("http://localhost:8080/fhir");
  });

  it("Client preserves the baseUrl as given", () => {
    const client = new Client({ baseUrl: "http://localhost:8080/fhir/" });
    expect(client.baseUrl).toBe("http://localhost:8080/fhir/");
  });

  it("Client accepts bearerToken", () => {
    const client = new Client({
      baseUrl: "http://localhost:8080/fhir",
      bearerToken: "token-abc",
    });
    // bearerToken is write-only — verify the client constructed without error
    expect(client).toBeDefined();
  });
});
