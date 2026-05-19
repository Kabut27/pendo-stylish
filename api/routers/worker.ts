import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { workers } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode("pendo-stylish-secret-key-2026");

export const workerRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().select().from(workers).where(eq(workers.isActive, true));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [worker] = await getDb()
        .select()
        .from(workers)
        .where(eq(workers.id, input.id))
        .limit(1);
      return worker || null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        role: z.enum(["admin", "fundi"]).default("fundi"),
        pin: z.string().length(4),
      })
    )
    .mutation(async ({ input }) => {
      const hashedPin = await bcrypt.hash(input.pin, 10);
      const result = await getDb()
        .insert(workers)
        .values({ ...input, pin: hashedPin })
        .returning();
      return result[0];
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "fundi"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await getDb()
        .update(workers)
        .set(data)
        .where(eq(workers.id, id))
        .returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(workers)
        .set({ isActive: false })
        .where(eq(workers.id, input.id));
      return { success: true };
    }),

  login: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        pin: z.string().length(4),
      })
    )
    .mutation(async ({ input }) => {
      const [worker] = await getDb()
        .select()
        .from(workers)
        .where(eq(workers.name, input.name))
        .limit(1);

      if (!worker) {
        throw new Error("Jina sio sahihi");
      }

      const validPin = await bcrypt.compare(input.pin, worker.pin);
      if (!validPin) {
        throw new Error("PIN sio sahihi");
      }

      const token = await new SignJWT({ workerId: worker.id, role: worker.role })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("8h")
        .sign(secret);

      return { token, worker: { id: worker.id, name: worker.name, role: worker.role } };
    }),

  verifyToken: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        const { payload } = await jwtVerify(input.token, secret, { clockTolerance: 60 });
        const workerId = payload.workerId as number;
        const [worker] = await getDb()
          .select()
          .from(workers)
          .where(eq(workers.id, workerId))
          .limit(1);
        if (!worker || !worker.isActive) return null;
        return { id: worker.id, name: worker.name, role: worker.role };
      } catch {
        return null;
      }
    }),
});
