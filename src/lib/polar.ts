import { Polar } from "@polar-sh/sdk";
import { readRequiredEnv } from "@/lib/env";

let polarClient: Polar | null = null;

export type PolarServer = "production" | "sandbox";

export function getPolarServer(): PolarServer {
  const value = String(process.env.POLAR_SERVER || "production").trim().toLowerCase();
  if (value === "production" || value === "sandbox") return value;
  throw new Error("POLAR_SERVER must be either production or sandbox.");
}

export function getPolarApiBaseUrl() {
  return getPolarServer() === "sandbox" ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";
}

export interface CreatePolarCheckoutSessionInput {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string | null;
  externalCustomerId?: string | null;
  discountId?: string | null;
  metadata?: Record<string, string> | null;
}

export function getPolarClient() {
  if (!polarClient) {
    polarClient = new Polar({
      accessToken: readRequiredEnv(process.env.POLAR_ACCESS_TOKEN, "POLAR_ACCESS_TOKEN"),
      server: getPolarServer(),
    });
  }

  return polarClient;
}

export async function createPolarCheckoutSession(input: CreatePolarCheckoutSessionInput) {
  const accessToken = readRequiredEnv(process.env.POLAR_ACCESS_TOKEN, "POLAR_ACCESS_TOKEN");
  const response = await fetch(`${getPolarApiBaseUrl()}/v1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_price_id: input.productPriceId,
      success_url: input.successUrl,
      customer_email: input.customerEmail || undefined,
      external_customer_id: input.externalCustomerId || undefined,
      discount_id: input.discountId || undefined,
      metadata: input.metadata || undefined,
    }),
  });

  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error(`Polar checkout failed with status ${response.status}.`);
  }

  return (await response.json()) as { url?: string | null };
}
