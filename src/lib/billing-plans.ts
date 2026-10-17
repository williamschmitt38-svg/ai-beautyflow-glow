export const billingPlans = {
  starter: { name: "Starter", amount: 39, priceId: "price_1UPmEc1fxpDtmQQEFC4Ks9uH", annualAmount: 444.6, annualPriceId: "price_1URMr91fxpDtmQQEA0vS4q1i", annualDiscount: 5 },
  pro: { name: "Pro", amount: 79, priceId: "price_1UPmFB1fxpDtmQQEdmwWqHCj", annualAmount: 805.8, annualPriceId: "price_1URMrk1fxpDtmQQEC1CmAFpv", annualDiscount: 15 },
  enterprise: { name: "Enterprise", amount: 129.9, priceId: "price_1UQcEw1fxpDtmQQE28zEDVYq", annualAmount: 1169.1, annualPriceId: "price_1URMxQ1fxpDtmQQEaYADRcUc", annualDiscount: 25 },
} as const;
export type BillingPlan = keyof typeof billingPlans;
export type BillingInterval = "month" | "year";
export function planForPrice(priceId: string): { plan: BillingPlan; interval: BillingInterval } | null {
  for (const k of Object.keys(billingPlans) as BillingPlan[]) {
    if (billingPlans[k].priceId === priceId) return { plan: k, interval: "month" };
    if (billingPlans[k].annualPriceId === priceId) return { plan: k, interval: "year" };
  }
  return null;
}
