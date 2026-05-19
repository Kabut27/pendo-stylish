// Cloudflare Worker entry point for D1
// This replaces boot.ts when deploying to Cloudflare Workers

import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "./router";
import { createContext } from "./context";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DB: any;
  JWT_SECRET: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ASSETS?: any;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Serve static files from Cloudflare Pages
app.use("/assets/*", async (c) => {
  return c.env.ASSETS ? c.env.ASSETS.fetch(c.req.raw) : c.text("Not found", 404);
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext(opts),
  });
});

// Serve SPA for all other routes
app.get("*", async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text("Pendo Stylish API", 200);
});

export default app;
