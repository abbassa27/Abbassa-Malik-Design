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
  webhook_endpoint?: string;
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

const DEFAULT_BASE_URL = "https://pay.chargily.net/api/v2";

function getBaseUrl(): string {
  return (process.env.CHARGILY_API_URL || DEFAULT_BASE_URL).trim().replace(/\/$/, "");
}

function getSecretKey(): string {
  // .trim() defends against accidental whitespace when the key is pasted into
  // `.env.local` with spaces around `=` (e.g. `CHARGILY_SECRET_KEY = test_sk_...`)
  // which otherwise produces an "Unauthenticated" response from Chargily.
  const raw = process.env.CHARGILY_SECRET_KEY || "";
  const key = raw.trim().replace(/^["']|["']$/g, "");
  if (!key) {
    throw new Error(
      "CHARGILY_SECRET_KEY is not configured. Set it in your environment (.env.local or Vercel Project Settings)."
    );
  }
  if (!/^(test|live)_sk_/.test(key)) {
    throw new Error(
      "CHARGILY_SECRET_KEY looks invalid. It must start with 'test_sk_' (sandbox) or 'live_sk_' (production)."
    );
  }
  return key;
}

async function chargilyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getSecretKey()}`,
      ...(init.headers || {}),
    },
    // Never cache payment API calls
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // leave data as raw text
    data = text;
  }

  if (!res.ok) {
    const baseMessage =
      (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : null) ||
      (typeof data === "string" ? data : null) ||
      `Chargily API error (${res.status})`;
    const hint =
      res.status === 401
        ? " — Check that CHARGILY_SECRET_KEY is set correctly (no quotes or spaces) in your Vercel/Production environment and redeploy."
        : "";
    console.error("[chargily] API error", {
      status: res.status,
      path,
      body: typeof data === "string" ? data.slice(0, 200) : data,
    });
    throw new Error(`${baseMessage}${hint}`);
  }

  return data as T;
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
