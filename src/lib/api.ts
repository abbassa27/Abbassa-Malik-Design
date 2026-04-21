// # NEW FEATURE START - Frontend API Client
// src/lib/api.ts
// Thin wrapper around fetch that talks to the API routes.
// Falls back to localStorage when API is unavailable (offline / Vite dev without SSR).

const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function req<T>(
  path: string,
  options: RequestInit = {},
  adminSecret?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(adminSecret ? { "x-admin-secret": adminSecret } : {}),
    ...((options.headers as object) ?? {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Client API ───────────────────────────────────────────────────────────────
export const clientApi = {
  register: (email: string, name: string) =>
    req("/clients/register", { method: "POST", body: JSON.stringify({ email, name }) }),

  getOrders: (email: string) =>
    req<Order[]>(`/orders?email=${encodeURIComponent(email)}`),

  createOrder: (data: {
    clientEmail: string;
    bookTitle: string;
    plan: string;
    instructions?: string;
    files?: { name: string; size: number; mimeType: string; url: string }[];
  }) => req<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),

  getMessages: (orderId: string, email: string) =>
    req<Message[]>(`/messages?orderId=${orderId}&email=${encodeURIComponent(email)}`),

  sendMessage: (orderId: string, clientEmail: string, content: string) =>
    req<Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ orderId, clientEmail, sender: "CLIENT", content }),
    }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  getAllOrders: (secret: string) =>
    req<AdminOrder[]>("/admin/orders", {}, secret),

  updateOrder: (
    secret: string,
    orderId: string,
    data: {
      status?: string;
      deliverables?: { name: string; size: number; url: string }[];
    }
  ) =>
    req<AdminOrder>(`/admin/orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, secret),

  getStats: (secret: string) =>
    req<Stats>("/admin/stats", {}, secret),

  getLogs: (secret: string, limit = 50, event?: string) =>
    req<LogEntry[]>(`/admin/logs?limit=${limit}${event ? `&event=${event}` : ""}`, {}, secret),

  sendMessage: (secret: string, orderId: string, clientEmail: string, content: string) =>
    req<Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ orderId, clientEmail, sender: "ADMIN", content }),
    }, secret),

  getMessages: (secret: string, orderId: string) =>
    req<Message[]>(`/messages?orderId=${orderId}`, { headers: { "x-admin-secret": secret } }),
};

// ─── Shared Types ─────────────────────────────────────────────────────────────
export interface OrderFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface Deliverable {
  id: string;
  name: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  clientId: string;
  sender: "CLIENT" | "ADMIN";
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  bookTitle: string;
  plan: string;
  instructions?: string;
  status: "PENDING" | "IN_PROGRESS" | "REVISION" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  files: OrderFile[];
  deliverables: Deliverable[];
  messages: Message[];
}

export interface AdminOrder extends Order {
  client: { id: string; email: string; name: string };
}

export interface Stats {
  totalClients: number;
  totalOrders: number;
  totalRevenue: number;
  messagesUnread: number;
  ordersByStatus: { status: string; count: number }[];
  ordersByPlan: { plan: string; count: number }[];
  monthlyData: { month: string; orders: number; revenue: number }[];
  recentLogs: LogEntry[];
}

export interface LogEntry {
  id: string;
  event: string;
  createdAt: string;
  clientEmail?: string;
  orderTitle?: string;
  meta?: Record<string, unknown>;
}
// # NEW FEATURE END - Frontend API Client
