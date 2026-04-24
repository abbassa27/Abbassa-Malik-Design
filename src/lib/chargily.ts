// # NEW FEATURE START - Chargily Pay V2 server-side client
// Lightweight helper for Chargily Pay V2 API (https://dev.chargily.com/pay-v2)
// Uses fetch() so it works out of the box on Vercel Serverless Functions and
// the Next.js App Router runtime without adding any extra dependency.

export type ChargilyItem = {
  price: string;   // price object id from dashboard (optional if using amount)
  quantity: number;
};

export type ChargilyCheckoutInput = {
  amount: number;           // integer, in the smallest unit of the currency
  currency?: string;        // "dzd" by default (required for Edahabia / CIB)
  payment_method?: "edahabia" | "cib";
  success_url: string;
  failure_url?: string;
  webhook_url?: string;
  description?: string;
  locale?: "ar" | "en" | "fr";
  // Customer info — either a pre-created customer_id, or inline customer fields
  customer_id?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type ChargilyCheckout = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  checkout_url: string;
  success_url: string;
  failure_url?: string;
  customer_id?: string;
  payment_method?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at?: number;
};

export type ChargilyCustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    country?: string;
    state?: string;
    address?: string;
  };
  metadata?: Record<string, string | number | boolean>;
};

export type ChargilyCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

const DEFAULT_BASE_URL = "https://api.chargily.com/v2";

function getBaseUrl(): string {
  return "https://api.chargily.com/v2";
}


function getSecretKey(): string {
  const key = process.env.CHARGILY_SECRET_KEY;
  if (!key) {
    throw new Error(
      "CHARGILY_SECRET_KEY is not configured. Set it in your environment (.env.local or Vercel Project Settings)."
    );
  }
  return key;
}

async function chargilyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`https://api.chargily.com/v2${path}`, {
    method: init.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getSecretKey()}`,
    },
    body: init.body,
  });

  const text = await res.text();
  console.log("CHARGILY RESPONSE:", text);

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON: " + text);
  }

  if (!res.ok) {
    console.error("❌ Chargily error FULL:", json);

    const errorMessage =
      json?.error?.message ||
      json?.message ||
      JSON.stringify(json);

    throw new Error(errorMessage);
  }

  return json;
}

export async function createCustomer(input: ChargilyCustomerInput): Promise<ChargilyCustomer> {
  return chargilyFetch<ChargilyCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createCheckout(input: ChargilyCheckoutInput): Promise<ChargilyCheckout> {
  return chargilyFetch<ChargilyCheckout>("/checkouts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCheckout(id: string): Promise<ChargilyCheckout> {
  return chargilyFetch<ChargilyCheckout>(`/checkouts/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

// Constant-time string comparison to protect against timing attacks.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
// # NEW FEATURE END - Chargily Pay V2 server-side client
