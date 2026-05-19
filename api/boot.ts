import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "./router";
import { createContext } from "./context";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { serveStatic } from "hono/deno";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/*", async (_c, next) => {
  await next();
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.use("/*", serveStatic({ root: "./dist" }));
app.get("*", serveStatic({ path: "./dist/index.html" }));

export default app;

if (import.meta.main) {
  const port = 3000;
  console.log(`Pendo Stylish server running on port ${port}`);
}
