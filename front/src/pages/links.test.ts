import { describe, expect, it } from "vitest";
import { formatLink, LINKS } from "./links";

describe("formatLink", () => {
  it("returns static links unchanged", () => {
    expect(formatLink(LINKS.MAILING_LIST)).toBe(LINKS.MAILING_LIST);
  });

  it("fills a path parameter", () => {
    expect(formatLink(LINKS.WCA.PROFILE, { wcaId: "2020FOO01" })).toBe(
      "https://www.worldcubeassociation.org/persons/2020FOO01",
    );
  });

  it("URL-encodes reserved characters", () => {
    expect(formatLink(LINKS.WCA.API.PERSON, { wcaId: "a/b c" })).toBe(
      "https://www.worldcubeassociation.org/api/v0/persons/a%2Fb%20c",
    );
  });

  it("fills and encodes query parameters", () => {
    expect(
      formatLink(LINKS.WCA.API.SEARCH_USERS, { query: "Émile & co" }),
    ).toBe(
      "https://www.worldcubeassociation.org/api/v0/search/users?persons_table=true&q=%C3%89mile%20%26%20co",
    );
  });

  it("fills multiple placeholders", () => {
    expect(
      formatLink("https://example.com/{first}/{second}", {
        first: "1",
        second: "two words",
      }),
    ).toBe("https://example.com/1/two%20words");
  });

  it("throws at runtime when a parameter is missing", () => {
    // @ts-expect-error -- wcaId is required by the template
    expect(() => formatLink(LINKS.WCA.PROFILE)).toThrow(/wcaId/);
  });

  it("rejects extra parameters at compile time", () => {
    // @ts-expect-error -- "extra" is not a placeholder in the template
    formatLink(LINKS.WCA.PROFILE, { wcaId: "2020FOO01", extra: "nope" });
  });
});
