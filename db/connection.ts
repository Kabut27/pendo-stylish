import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// D1 database instance - injected from Cloudflare Worker environment
let db: ReturnType<typeof createDb> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDb(d1: any) {
  return drizzle(d1, { schema });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(d1?: any) {
  if (d1) {
    // Always create fresh db with D1 binding from Worker env
    return createDb(d1);
  }
  if (!db) {
    throw new Error("D1 binding not provided. Pass env.DB when calling getDb().");
  }
  return db;
}