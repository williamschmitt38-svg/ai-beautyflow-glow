import { describe, expect, it } from "vitest";
import { billingPlans } from "./billing-plans";

describe("planos anuais", () => {
  it("Starter anual tem 5% de desconto", () => expect(billingPlans.starter.annualAmount).toBeCloseTo(39 * 12 * 0.95, 2));
  it("Pro anual tem 15% de desconto", () => expect(billingPlans.pro.annualAmount).toBeCloseTo(79 * 12 * 0.85, 2));
  it("Enterprise anual tem 25% de desconto", () => expect(billingPlans.enterprise.annualAmount).toBeCloseTo(129.9 * 12 * 0.75, 2));
});
