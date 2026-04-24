// # NEW FEATURE START - Chargily Pay V2 server-side client
// Lightweight helper for Chargily Pay V2 API
// Works on Next.js App Router and Vercel Serverless

export type ChargilyItem = {
  price: string;
  quantity: number;
};

export type ChargilyCheckoutInput = {
  amount: number;
  currency?: string;
  payment_method?: "edahabia" | "cib";
  success_url: string;
  failure_url?: string;
  webhook_endpoint?: string;
  webhook_url?: string;
  description?: string;
  locale?: "ar" | "en" | "fr";
  customer_id?: string;
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
};

export type ChargilyCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

const DEFAULT_BASE_URL = "https://api.chargily.com/v2";

function getSecretKey(): string {
  const key = process.env.CHARGILY_SECRET_KEY;
  if (!key) {
    throw new Error(
      "CHARGILY_SECRET_KEY is not configured. Set it in your environment (.env.local or Vercel Project Settings)."
    );
  }
  return key;
}

async function chargilyFetch(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${DEFAULT_BASE_URL}${path}`, {
    method: init.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getSecretKey()}`,
    },
    body: init.body,
  });

  const text = await res.text();

  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid JSON response from Chargily: ${text}`);
  }

  if (!res.ok) {
    const errorMessage =
      json?.error?.message ||
      json?.message ||
      json?.error ||
      JSON.stringify(json) ||
      `Chargily request failed with status ${res.status}`;

    throw new Error(errorMessage);
  }

  return json;
}

export async function createCustomer(input: ChargilyCustomerInput): Promise<ChargilyCustomer> {
  return chargilyFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createCheckout(input: ChargilyCheckoutInput): Promise<ChargilyCheckout> {
  const payload: any = {
    amount: input.amount,
    currency: input.currency || "dzd",
    payment_method: input.payment_method || "edahabia",
    success_url: input.success_url,
    description: input.description,
    locale: input.locale,
    customer_id: input.customer_id,
    metadata: input.metadata,
  };

  if (input.failure_url) payload.failure_url = input.failure_url;

  if (input.webhook_endpoint) {
    payload.webhook_endpoint = input.webhook_endpoint;
  } else if (input.webhook_url) {
    payload.webhook_endpoint = input.webhook_url;
  }

  return chargilyFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCheckout(id: string): Promise<ChargilyCheckout> {
  return chargilyFetch(`/checkouts/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
// # NEW FEATURE END - Chargily Pay V2 server-side client