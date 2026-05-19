import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DB: any;
  JWT_SECRET: string;
}

export async function createContext(
  opts: FetchCreateContextFnOptions & { env?: Env }
) {
  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    db: opts.env?.DB ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;