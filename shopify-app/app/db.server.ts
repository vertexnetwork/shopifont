import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client. Remix dev hot-reload would otherwise
 * spin up a new connection pool on every reload and exhaust the
 * Postgres connection limit within minutes. Cached on globalThis
 * for dev only; production gets a fresh instance per cold start.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

const prisma =
  globalThis.__prismaClient ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient = prisma;
}

export default prisma;
