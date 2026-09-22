import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import OrderEntryPage from "./page";

describe("DTR return page", () => {
  it("renders the selected regimen on the server before browser hydration", async () => {
    const page = await OrderEntryPage({
      params: Promise.resolve({ id: "sandra-chen" }),
      searchParams: Promise.resolve({ "dtr-complete": "true", regimen: "PHD" }),
    });
    const html = renderToString(page);
    expect(html).toContain("PHD");
    expect(html).toContain("Selected");
    expect(html).toContain("bg-blue-50");
  });

  it("does not preselect a regimen on a normal order page", async () => {
    const page = await OrderEntryPage({
      params: Promise.resolve({ id: "sandra-chen" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToString(page);
    expect(html).not.toContain("bg-blue-50");
  });
});
