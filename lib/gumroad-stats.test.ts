import { describe, it, expect } from "vitest";
import {
  computeFoundingOffer,
  FOUNDER_CAP,
  FOUNDER_CODE,
  FOUNDER_DISCOUNT_USD,
  FOUNDER_DISCOUNT_PCT,
} from "./gumroad-stats";

describe("computeFoundingOffer", () => {
  it("is active with the full cap remaining at zero sales", () => {
    const offer = computeFoundingOffer(0);
    expect(offer.active).toBe(true);
    expect(offer.remaining).toBe(FOUNDER_CAP);
    expect(offer.code).toBe(FOUNDER_CODE);
    expect(offer.discountUsd).toBe(FOUNDER_DISCOUNT_USD);
    expect(offer.discountPct).toBe(FOUNDER_DISCOUNT_PCT);
  });

  it("counts down remaining as sales accrue", () => {
    expect(computeFoundingOffer(1).remaining).toBe(FOUNDER_CAP - 1);
    expect(computeFoundingOffer(10).remaining).toBe(FOUNDER_CAP - 10);
    expect(computeFoundingOffer(FOUNDER_CAP - 1).remaining).toBe(1);
  });

  it("deactivates the moment the cap is hit", () => {
    const offer = computeFoundingOffer(FOUNDER_CAP);
    expect(offer.active).toBe(false);
    expect(offer.remaining).toBe(0);
  });

  it("never reports negative remaining past the cap", () => {
    const offer = computeFoundingOffer(FOUNDER_CAP + 50);
    expect(offer.active).toBe(false);
    expect(offer.remaining).toBe(0);
  });

  it("fails closed (inactive, full price) when the count is unknown", () => {
    const offer = computeFoundingOffer(null);
    expect(offer.active).toBe(false);
    expect(offer.remaining).toBe(0);
    // Constants still surface so callers can render the label if they want,
    // but active=false means the discount is never applied.
    expect(offer.code).toBe(FOUNDER_CODE);
  });

  it("advertises 37% but discounts a flat $7 → a clean $12 on $19", () => {
    expect(FOUNDER_DISCOUNT_PCT).toBe(37);
    expect(FOUNDER_DISCOUNT_USD).toBe(7);
    expect(19 - FOUNDER_DISCOUNT_USD).toBe(12);
    // $7/$19 = 36.8% → rounds to the advertised 37%, so the claim is honest.
    expect(Math.round((FOUNDER_DISCOUNT_USD / 19) * 100)).toBe(FOUNDER_DISCOUNT_PCT);
  });
});
