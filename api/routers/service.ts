import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { services } from "../../db/schema";
import { eq } from "drizzle-orm";

export const serviceRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().select().from(services).where(eq(services.isActive, true));
  }),

  listByCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(services)
        .where(eq(services.category, input.category as "nywele" | "nails" | "nyuso" | "mwili" | "engine"));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [service] = await getDb()
        .select()
        .from(services)
        .where(eq(services.id, input.id))
        .limit(1);
      return service || null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        category: z.enum(["nywele", "nails", "nyuso", "mwili", "engine"]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(services).values(input).returning();
      return result[0];
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        category: z.enum(["nywele", "nails", "nyuso", "mwili", "engine"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await getDb()
        .update(services)
        .set(data)
        .where(eq(services.id, id))
        .returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(services)
        .set({ isActive: false })
        .where(eq(services.id, input.id));
      return { success: true };
    }),
});
