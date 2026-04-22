// NEW FEATURE START (v4 — DB Helpers over Prisma)
import { prisma } from "./prisma";
import type {
  Order, OrderFile, EventLog, Message, Lead,
  OrderStatus,
  // NEW FEATURE START (v6)
  InvoiceStatus, SubscriptionStatus,
  // NEW FEATURE END (v6)
} from "@prisma/client";

export type { Order, OrderFile, EventLog, Message, Lead };

export async function createLead(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return prisma.lead.create({ data });
}

// ════════════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════════════

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      files:        true,
      deliverables: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      files:        true,
      deliverables: true,
      messages: { orderBy: { createdAt: "asc" } },
      logs:     { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createOrder(data: {
  plan: string; amount: string; authorName: string; bookTitle: string;
  genre: string; email: string; synopsis: string; instructions: string;
}) {
  return prisma.order.create({ data });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  adminNotes?: string
) {
  const data: { status: OrderStatus; adminNotes?: string } = { status };
  if (adminNotes !== undefined) data.adminNotes = adminNotes;
  return prisma.order.update({ where: { id }, data });
}

// ════════════════════════════════════════════════════════════════════
// FILES  ← FIXED: clientOrderId / adminOrderId (schema v2)
// ════════════════════════════════════════════════════════════════════

export async function addClientFile(
  orderId: string,
  file: { filename: string; storedAs: string; size: number; mimeType: string }
) {
  return prisma.orderFile.create({
    // NEW FEATURE START (schema-fix — use clientOrderId)
    data: { ...file, clientOrderId: orderId, uploadedBy: "client" },
    // NEW FEATURE END (schema-fix)
  });
}

export async function addAdminFile(
  orderId: string,
  file: { filename: string; storedAs: string; size: number; mimeType: string }
) {
  return prisma.orderFile.create({
    // NEW FEATURE START (schema-fix — use adminOrderId)
    data: { ...file, adminOrderId: orderId, uploadedBy: "admin" },
    // NEW FEATURE END (schema-fix)
  });
}

// ════════════════════════════════════════════════════════════════════
// EVENT LOGS
// ════════════════════════════════════════════════════════════════════

export async function logEvent(
  orderId: string,
  event:   string,
  actor:   "client" | "admin",
  meta?:   Record<string, unknown>
) {
  return prisma.eventLog.create({
    data: {
      orderId,
      event,
      actor,
      meta: meta ? JSON.stringify(meta) : "",
    },
  });
}

export async function getOrderLogs(orderId: string) {
  return prisma.eventLog.findMany({
    where:   { orderId },
    orderBy: { createdAt: "desc" },
  });
}

// ════════════════════════════════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════════════════════════════════

export async function getMessages(orderId: string) {
  return prisma.message.findMany({
    where:   { orderId },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(
  orderId: string,
  sender:  "client" | "admin",
  body:    string
) {
  return prisma.message.create({ data: { orderId, sender, body } });
}

export async function markMessagesRead(
  orderId: string,
  reader:  "client" | "admin"
) {
  const senderToMark = reader === "admin" ? "client" : "admin";
  return prisma.message.updateMany({
    where: { orderId, sender: senderToMark, readAt: null },
    data:  { readAt: new Date() },
  });
}

export async function countUnreadMessages(
  orderId: string,
  reader:  "admin" | "client"
) {
  const senderToMark = reader === "admin" ? "client" : "admin";
  return prisma.message.count({
    where: { orderId, sender: senderToMark, readAt: null },
  });
}

// ════════════════════════════════════════════════════════════════════
// ANALYTICS (v4)
// ════════════════════════════════════════════════════════════════════

export async function getAnalytics() {
  const [
    totalOrders,
    statusCounts,
    revenueAgg,
    recentLogs,
    ordersByDay,
    topPlans,
    messageCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.$queryRaw<{ total: unknown }[]>`
      SELECT COALESCE(SUM(CAST("amount" AS NUMERIC)), 0) AS total FROM "Order"
    `,
    prisma.eventLog.findMany({
      orderBy: { createdAt: "desc" },
      take:    20,
      include: { order: { select: { bookTitle: true } } },
    }),
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT DATE("createdAt") as day, COUNT(*) as count
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
    prisma.order.groupBy({
      by:      ["plan"],
      _count:  { id: true },
      orderBy: { _count: { id: "desc" } },
      take:    5,
    }),
    prisma.message.count(),
  ]);

  const totalRevenue = Number(revenueAgg[0]?.total) || 0;

  return {
    totalOrders,
    totalRevenue,
    statusCounts: statusCounts.map((r) => ({ status: r.status, count: r._count.id })),
    recentLogs,
    ordersByDay:  ordersByDay.map((r) => ({ day: r.day, count: Number(r.count) })),
    topPlans:     topPlans.map((r) => ({ plan: r.plan, count: r._count.id })),
    messageCount,
  };
}
// NEW FEATURE END (v4)

// NEW FEATURE START (v5 — Business Analytics DB helpers)

export async function getMonthlyRevenue(year: number) {
  const rows = await prisma.$queryRaw<
    { month: number; revenue: number; orders: bigint }[]
  >`
    SELECT
      EXTRACT(MONTH FROM "createdAt")::int AS month,
      SUM(CAST(amount AS NUMERIC))         AS revenue,
      COUNT(*)                              AS orders
    FROM "Order"
    WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
    GROUP BY EXTRACT(MONTH FROM "createdAt")
    ORDER BY month ASC
  `;
  return rows.map((r) => ({
    month:   r.month,
    revenue: Number(r.revenue) || 0,
    orders:  Number(r.orders),
  }));
}

export async function getQuarterlyRevenue(year: number) {
  const rows = await prisma.$queryRaw<
    { quarter: number; revenue: number; orders: bigint }[]
  >`
    SELECT
      CEIL(EXTRACT(MONTH FROM "createdAt") / 3.0)::int AS quarter,
      SUM(CAST(amount AS NUMERIC))                      AS revenue,
      COUNT(*)                                           AS orders
    FROM "Order"
    WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
    GROUP BY CEIL(EXTRACT(MONTH FROM "createdAt") / 3.0)
    ORDER BY quarter ASC
  `;
  return rows.map((r) => ({
    quarter: r.quarter,
    revenue: Number(r.revenue) || 0,
    orders:  Number(r.orders),
  }));
}

export async function getYearlyRevenue() {
  const rows = await prisma.$queryRaw<
    { year: number; revenue: number; orders: bigint }[]
  >`
    SELECT
      EXTRACT(YEAR FROM "createdAt")::int AS year,
      SUM(CAST(amount AS NUMERIC))        AS revenue,
      COUNT(*)                             AS orders
    FROM "Order"
    GROUP BY EXTRACT(YEAR FROM "createdAt")
    ORDER BY year ASC
  `;
  return rows.map((r) => ({
    year:    r.year,
    revenue: Number(r.revenue) || 0,
    orders:  Number(r.orders),
  }));
}

export async function getServiceBreakdown() {
  const rows = await prisma.$queryRaw<
    { plan: string; count: bigint; revenue: unknown }[]
  >`
    SELECT "plan" as plan, COUNT(*)::bigint as count,
           COALESCE(SUM(CAST("amount" AS NUMERIC)), 0) as revenue
    FROM "Order"
    GROUP BY "plan"
    ORDER BY COUNT(*) DESC
  `;
  return rows.map((r) => {
    const count = Number(r.count);
    const revenue = Number(r.revenue) || 0;
    return {
      plan:    r.plan,
      count,
      revenue,
      avg:     count > 0 ? revenue / count : 0,
    };
  });
}

export async function getProfitabilityStats() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth() + 1;
  const lm  = m === 1 ? 12 : m - 1;
  const ly  = m === 1 ? y - 1 : y;

  const monthStart = new Date(`${y}-${String(m).padStart(2, "0")}-01`);
  const lastMonthStart = new Date(`${ly}-${String(lm).padStart(2, "0")}-01`);

  const [thisMonth, lastMonth, allTime] = await Promise.all([
    prisma.$queryRaw<{ revenue: unknown; orders: bigint }[]>`
      SELECT COALESCE(SUM(CAST("amount" AS NUMERIC)), 0) as revenue, COUNT(*)::bigint as orders
      FROM "Order" WHERE "createdAt" >= ${monthStart}
    `,
    prisma.$queryRaw<{ revenue: unknown; orders: bigint }[]>`
      SELECT COALESCE(SUM(CAST("amount" AS NUMERIC)), 0) as revenue, COUNT(*)::bigint as orders
      FROM "Order"
      WHERE "createdAt" >= ${lastMonthStart} AND "createdAt" < ${monthStart}
    `,
    prisma.$queryRaw<{ revenue: unknown; orders: bigint }[]>`
      SELECT COALESCE(SUM(CAST("amount" AS NUMERIC)), 0) as revenue, COUNT(*)::bigint as orders
      FROM "Order"
    `,
  ]);

  const thisMonthRev = Number(thisMonth[0]?.revenue) || 0;
  const lastMonthRev = Number(lastMonth[0]?.revenue) || 0;
  const allTimeRev   = Number(allTime[0]?.revenue) || 0;
  const allTimeCount = Number(allTime[0]?.orders) || 0;
  const avgPerOrder  = allTimeCount > 0 ? allTimeRev / allTimeCount : 0;
  const momGrowth    = lastMonthRev > 0
    ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100
    : 0;

  return {
    thisMonthRevenue: thisMonthRev,
    thisMonthOrders:  Number(thisMonth[0]?.orders) || 0,
    lastMonthRevenue: lastMonthRev,
    lastMonthOrders:  Number(lastMonth[0]?.orders) || 0,
    allTimeRevenue:   allTimeRev,
    allTimeOrders:    allTimeCount,
    avgPerOrder,
    momGrowth,
  };
}

export async function getBusinessAnalytics(year?: number) {
  const targetYear = year || new Date().getFullYear();
  const [monthly, quarterly, yearly, services, profitability] = await Promise.all([
    getMonthlyRevenue(targetYear),
    getQuarterlyRevenue(targetYear),
    getYearlyRevenue(),
    getServiceBreakdown(),
    getProfitabilityStats(),
  ]);
  return { monthly, quarterly, yearly, services, profitability, year: targetYear };
}
// NEW FEATURE END (v5)

// NEW FEATURE START (v6 — Invoice & Subscription DB helpers)

// ════════════════════════════════════════════════════════════════════
// INVOICES
// ════════════════════════════════════════════════════════════════════

export async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const num   = String(count + 1).padStart(4, "0");
  const y     = new Date().getFullYear();
  return `INV-${y}-${num}`;
}

export async function getAllInvoices() {
  return prisma.invoice.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({ where: { id } });
}

export async function createInvoice(data: {
  clientName:  string;
  clientEmail: string;
  items:       string;
  subtotal:    number;
  tax:         number;
  total:       number;
  currency?:   string;
  dueDate?:    Date;
  notes?:      string;
  orderId?:    string;
}) {
  const invoiceNumber = await generateInvoiceNumber();
  return prisma.invoice.create({
    data: {
      ...data,
      invoiceNumber,
      currency: data.currency || "USD",
      notes:    data.notes    || "",
    },
  });
}

export async function updateInvoice(
  id:   string,
  data: Partial<{
    clientName:  string;
    clientEmail: string;
    items:       string;
    subtotal:    number;
    tax:         number;
    total:       number;
    currency:    string;
    status:      InvoiceStatus;
    dueDate:     Date;
    notes:       string;
    sentAt:      Date;
    paidAt:      Date;
  }>
) {
  return prisma.invoice.update({ where: { id }, data });
}

export async function markInvoiceSent(id: string) {
  return prisma.invoice.update({
    where: { id },
    data:  { status: "sent", sentAt: new Date() },
  });
}

export async function markInvoicePaid(id: string) {
  return prisma.invoice.update({
    where: { id },
    data:  { status: "paid", paidAt: new Date() },
  });
}

export async function getInvoiceStats() {
  const [total, byStatus, revenueSum] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.groupBy({
      by:     ["status"],
      _count: { id: true },
      _sum:   { total: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "paid" },
      _sum:  { total: true },
    }),
  ]);
  return {
    total,
    collected: Number(revenueSum._sum.total) || 0,
    byStatus:  byStatus.map((r) => ({
      status: r.status,
      count:  r._count.id,
      sum:    Number(r._sum.total) || 0,
    })),
  };
}

// ════════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ════════════════════════════════════════════════════════════════════

export async function getAllSubscriptions() {
  return prisma.subscription.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getSubscriptionById(id: string) {
  return prisma.subscription.findUnique({ where: { id } });
}

export async function getSubscriptionByPaypalId(paypalSubId: string) {
  return prisma.subscription.findUnique({ where: { paypalSubId } });
}

export async function createSubscription(data: {
  clientName:       string;
  clientEmail:      string;
  plan:             string;
  amount:           number;
  currency?:        string;
  billingCycle?:    string;
  paypalSubId?:     string;
  nextBillingDate?: Date;
  notes?:           string;
}) {
  return prisma.subscription.create({
    data: {
      ...data,
      currency:     data.currency     || "USD",
      billingCycle: data.billingCycle || "monthly",
      notes:        data.notes        || "",
    },
  });
}

export async function updateSubscription(
  id:   string,
  data: Partial<{
    status:          SubscriptionStatus;
    nextBillingDate: Date;
    cancelledAt:     Date;
    notes:           string;
    paypalSubId:     string;
  }>
) {
  return prisma.subscription.update({ where: { id }, data });
}

export async function cancelSubscription(id: string) {
  return prisma.subscription.update({
    where: { id },
    data:  { status: "cancelled", cancelledAt: new Date() },
  });
}

export async function getSubscriptionStats() {
  const [total, active, byPlan, mrr] = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.groupBy({
      by:      ["plan"],
      where:   { status: "active" },
      _count:  { id: true },
      _sum:    { amount: true },
    }),
    prisma.subscription.aggregate({
      where: { status: "active" },
      _sum:  { amount: true },
    }),
  ]);
  return {
    total,
    active,
    mrr:    Number(mrr._sum.amount) || 0,
    byPlan: byPlan.map((r) => ({
      plan:  r.plan,
      count: r._count.id,
      mrr:   Number(r._sum.amount) || 0,
    })),
  };
}
// NEW FEATURE END (v6)
