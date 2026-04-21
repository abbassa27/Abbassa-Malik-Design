// # NEW FEATURE START - Prisma Client Singleton
// src/lib/prisma.ts
// Prevents multiple Prisma Client instances during hot-reload in dev

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
// # NEW FEATURE END - Prisma Client Singleton
