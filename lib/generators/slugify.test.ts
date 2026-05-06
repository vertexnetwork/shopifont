import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and joins with hyphens", () => {
    expect(slugify("My Brand Sans")).toBe("my-brand-sans");
  });

  it("strips combining diacritics", () => {
    expect(slugify("Café Noir")).toBe("cafe-noir");
  });

  it("collapses runs of non-alphanumeric characters", () => {
    expect(slugify("Foo___Bar !! Baz")).toBe("foo-bar-baz");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
  });

  it("returns empty string for input with no alphanumeric characters", () => {
    expect(slugify("$$$ !!! ###")).toBe("");
  });
});
