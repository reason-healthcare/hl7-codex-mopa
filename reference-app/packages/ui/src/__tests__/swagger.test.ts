import { describe, it, expect } from "vitest";
import { swaggerHtml } from "../swagger";

describe("swaggerHtml", () => {
  it("returns an HTML document with the given title", () => {
    const html = swaggerHtml("My API");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>My API — API Docs</title>");
  });

  it("references the default spec path", () => {
    const html = swaggerHtml("My API");
    expect(html).toContain("/openapi.json");
  });

  it("references a custom spec path", () => {
    const html = swaggerHtml("My API", "/custom-spec.json");
    expect(html).toContain("/custom-spec.json");
  });

  it("loads Swagger UI from CDN", () => {
    const html = swaggerHtml("My API");
    expect(html).toContain("swagger-ui-dist");
    expect(html).toContain("SwaggerUIBundle");
  });
});
