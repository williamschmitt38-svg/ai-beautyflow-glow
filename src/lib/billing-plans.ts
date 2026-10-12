export const billingPlans = {
  starter: { name: "Starter", amount: 39, priceId: "price_1UPmEc1fxpDtmQQEFC4Ks9uH" },
  pro: { name: "Pro", amount: 79, priceId: "price_1UPmFB1fxpDtmQQEdmwWqHCj" },
  enterprise: { name: "Enterprise", amount: 149, priceId: "price_1UPmFI1fxpDtmQQE3FxBpxYH" },
} as const;
export type BillingPlan = keyof typeof billingPlans;
