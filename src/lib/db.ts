/* ─── Database Client ──────────────────────────────────────────────────────
   Singleton Prisma client instance with PrismaPg adapter (Prisma 7.5).
   
   Usage:
     import { db } from "@/lib/db";
     const clients = await db.client.findMany({ where: { organizationId } });
   
   Connection:
   - Railway voice server → DATABASE_URL (internal, private network)
   - Vercel serverless    → DATABASE_URL (public, TCP proxy)
   - Both point to the same Railway PostgreSQL instance.
   ──────────────────────────────────────────────────────────────────────── */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
