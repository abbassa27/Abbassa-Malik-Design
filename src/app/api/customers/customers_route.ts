// NEW FEATURE START (v7 — Customers API Route)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all orders + invoices grouped by email
    const [orders, invoices] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, email: true, authorName: true, plan: true,
          amount: true, status: true, createdAt: true, bookTitle: true,
        },
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, invoiceNumber: true, clientEmail: true, clientName: true,
          total: true, currency: true, status: true, createdAt: true,
        },
      }),
    ]);

    // Group by email
    const customerMap = new Map<
      string,
      {
        email:        string;
        name:         string;
        firstSeen:    Date;
        lastSeen:     Date;
        totalSpent:   number;
        orders:       typeof orders;
        invoices:     typeof invoices;
        services:     Set<string>;
      }
    >();

    for (const order of orders) {
      const email = order.email.toLowerCase().trim();
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name:       order.authorName,
          firstSeen:  order.createdAt,
          lastSeen:   order.createdAt,
          totalSpent: 0,
          orders:     [],
          invoices:   [],
          services:   new Set(),
        });
      }
      const c = customerMap.get(email)!;
      c.orders.push(order);
      c.totalSpent += parseFloat(order.amount as unknown as string) || 0;
      c.services.add(order.plan);
      if (order.createdAt < c.firstSeen) c.firstSeen = order.createdAt;
      if (order.createdAt > c.lastSeen)  c.lastSeen  = order.createdAt;
    }

    for (const inv of invoices) {
      const email = inv.clientEmail.toLowerCase().trim();
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          name:       inv.clientName,
          firstSeen:  inv.createdAt,
          lastSeen:   inv.createdAt,
          totalSpent: 0,
          orders:     [],
          invoices:   [],
          services:   new Set(),
        });
      }
      customerMap.get(email)!.invoices.push(inv);
    }

    const customers = Array.from(customerMap.values()).map((c) => ({
      email:        c.email,
      name:         c.name,
      firstSeen:    c.firstSeen,
      lastSeen:     c.lastSeen,
      totalSpent:   c.totalSpent,
      orderCount:   c.orders.length,
      invoiceCount: c.invoices.length,
      services:     Array.from(c.services),
      orders:       c.orders,
      invoices:     c.invoices,
    }));

    return NextResponse.json({ customers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// NEW FEATURE END (v7)
