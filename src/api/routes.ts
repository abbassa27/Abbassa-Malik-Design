// # NEW FEATURE START - API Routes (Next.js App Router / Vite SSR compatible)
// src/api/routes.ts
//
// Usage with Next.js App Router:  copy each handler into app/api/[route]/route.ts
// Usage with Vite SSR:            import and mount in your server entry
//
// All routes follow REST conventions and return JSON.

import prisma from "../lib/prisma";
import { OrderStatus, LogEvent, MessageSender } from "@prisma/client";

// ─── Helper ───────────────────────────────────────────────────────────────────
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function error(msg: string, status = 400) {
  return json({ error: msg }, status);
}

async function writeLog(
  event: LogEvent,
  extras: { orderId?: string; clientId?: string; meta?: object } = {}
) {
  await prisma.log.create({ data: { event, ...extras } }).catch(console.error);
}

// ─── POST /api/clients/register ───────────────────────────────────────────────
// Body: { email, name }
export async function registerClient(req: Request) {
  const { email, name } = await req.json();
  if (!email || !name) return error("email and name required");

  const client = await prisma.client.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  await writeLog(LogEvent.CLIENT_REGISTERED, { clientId: client.id });
  return json(client);
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Body: { clientEmail, bookTitle, plan, instructions, files: [{name,size,mimeType,url}] }
export async function createOrder(req: Request) {
  const { clientEmail, bookTitle, plan, instructions, files = [] } = await req.json();
  if (!clientEmail || !bookTitle || !plan) return error("clientEmail, bookTitle and plan required");

  const client = await prisma.client.findUnique({ where: { email: clientEmail } });
  if (!client) return error("Client not found — register first", 404);

  const order = await prisma.order.create({
    data: {
      clientId: client.id,
      bookTitle,
      plan,
      instructions,
      files: {
        create: files.map((f: { name: string; size: number; mimeType: string; url: string }) => ({
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
          url: f.url,
        })),
      },
    },
    include: { files: true, deliverables: true },
  });

  await writeLog(LogEvent.ORDER_CREATED, { orderId: order.id, clientId: client.id });
  if (files.length > 0) {
    await writeLog(LogEvent.CLIENT_UPLOADED, {
      orderId: order.id,
      clientId: client.id,
      meta: { fileCount: files.length },
    });
  }

  return json(order, 201);
}

// ─── GET /api/orders?email=xxx ────────────────────────────────────────────────
// Returns orders for a specific client
export async function getClientOrders(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) return error("email param required");

  const client = await prisma.client.findUnique({ where: { email } });
  if (!client) return json([]);

  const orders = await prisma.order.findMany({
    where: { clientId: client.id },
    include: { files: true, deliverables: true, messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return json(orders);
}

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
// Returns all orders for admin. Header: x-admin-secret
export async function getAllOrders(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return error("Unauthorized", 401);

  const orders = await prisma.order.findMany({
    include: {
      client: true,
      files: true,
      deliverables: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return json(orders);
}

// ─── PATCH /api/admin/orders/:id ──────────────────────────────────────────────
// Body: { status, deliverables?: [{name,size,url}] }
// Header: x-admin-secret
export async function updateOrder(req: Request, orderId: string) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return error("Unauthorized", 401);

  const { status, deliverables = [] } = await req.json();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as OrderStatus,
      deliverables: {
        create: deliverables.map((d: { name: string; size: number; url: string }) => ({
          name: d.name,
          size: d.size,
          url: d.url,
        })),
      },
    },
    include: { deliverables: true, client: true },
  });

  await writeLog(LogEvent.STATUS_CHANGED, {
    orderId: order.id,
    clientId: order.clientId,
    meta: { newStatus: status },
  });

  if (deliverables.length > 0) {
    await writeLog(LogEvent.ADMIN_UPLOADED, {
      orderId: order.id,
      clientId: order.clientId,
      meta: { fileCount: deliverables.length },
    });
  }

  return json(order);
}

// ─── POST /api/messages ───────────────────────────────────────────────────────
// Body: { orderId, clientEmail, sender: "CLIENT"|"ADMIN", content }
// Admin messages require header: x-admin-secret
export async function sendMessage(req: Request) {
  const { orderId, clientEmail, sender, content } = await req.json();
  if (!orderId || !clientEmail || !sender || !content) {
    return error("orderId, clientEmail, sender and content required");
  }

  if (sender === MessageSender.ADMIN) {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== process.env.ADMIN_SECRET) return error("Unauthorized", 401);
  }

  const client = await prisma.client.findUnique({ where: { email: clientEmail } });
  if (!client) return error("Client not found", 404);

  const message = await prisma.message.create({
    data: { orderId, clientId: client.id, sender: sender as MessageSender, content },
  });

  await writeLog(LogEvent.MESSAGE_SENT, {
    orderId,
    clientId: client.id,
    meta: { sender, messageId: message.id },
  });

  return json(message, 201);
}

// ─── GET /api/messages?orderId=xxx&email=xxx ──────────────────────────────────
export async function getMessages(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const email = url.searchParams.get("email");
  if (!orderId) return error("orderId required");

  // Mark client messages as read if admin is fetching (has admin secret)
  const isAdmin = req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;

  if (isAdmin) {
    await prisma.message.updateMany({
      where: { orderId, sender: MessageSender.CLIENT, read: false },
      data: { read: true },
    });
  } else if (email) {
    await prisma.message.updateMany({
      where: { orderId, sender: MessageSender.ADMIN, read: false },
      data: { read: true },
    });
  }

  const messages = await prisma.message.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return json(messages);
}

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
// Returns analytics for admin dashboard
export async function getStats(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return error("Unauthorized", 401);

  const [
    totalClients,
    totalOrders,
    ordersByStatus,
    ordersByPlan,
    recentLogs,
    revenue,
    messagesUnread,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { client: true, order: true },
    }),
    // Revenue: extract price from plan name (e.g., "Starter — $29")
    prisma.order.findMany({ select: { plan: true } }),
    prisma.message.count({ where: { sender: MessageSender.CLIENT, read: false } }),
  ]);

  // Parse revenue from plan strings
  const totalRevenue = revenue.reduce((sum, o) => {
    const match = o.plan.match(/\$(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  // Orders per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const ordersPerMonth = await prisma.order.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, plan: true },
    orderBy: { createdAt: "asc" },
  });

  const monthlyData: Record<string, { orders: number; revenue: number }> = {};
  ordersPerMonth.forEach(o => {
    const key = o.createdAt.toISOString().slice(0, 7); // "2025-04"
    if (!monthlyData[key]) monthlyData[key] = { orders: 0, revenue: 0 };
    monthlyData[key].orders++;
    const match = o.plan.match(/\$(\d+)/);
    if (match) monthlyData[key].revenue += parseInt(match[1]);
  });

  return json({
    totalClients,
    totalOrders,
    totalRevenue,
    messagesUnread,
    ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count._all })),
    ordersByPlan: ordersByPlan.map(p => ({ plan: p.plan, count: p._count._all })),
    monthlyData: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
    recentLogs: recentLogs.map(l => ({
      id: l.id,
      event: l.event,
      createdAt: l.createdAt,
      clientEmail: l.client?.email,
      orderTitle: l.order?.bookTitle,
      meta: l.meta,
    })),
  });
}

// ─── GET /api/admin/logs ──────────────────────────────────────────────────────
export async function getLogs(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) return error("Unauthorized", 401);

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const event = url.searchParams.get("event") as LogEvent | null;

  const logs = await prisma.log.findMany({
    where: event ? { event } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { client: true, order: { select: { bookTitle: true } } },
  });

  return json(logs);
}

// # NEW FEATURE END - API Routes
