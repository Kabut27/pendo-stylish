import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { expenses } from "../../db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export const expenseRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().select().from(expenses).orderBy(desc(expenses.createdAt)).limit(200);
  }),

  listByDate: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(expenses)
        .where(eq(expenses.date, input.date))
        .orderBy(desc(expenses.createdAt));
    }),

  listByDateRange: publicQuery
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(expenses)
        .where(and(gte(expenses.date, input.startDate), lte(expenses.date, input.endDate)))
        .orderBy(desc(expenses.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        description: z.string().min(1),
        amount: z.number().positive(),
        category: z.enum(["bidhaa", "kodi", "meme", "maji", "mshahara", "mikopo", "nyingine"]),
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(expenses).values(input).returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(expenses).where(eq(expenses.id, input.id));
      return { success: true };
    }),

  summaryByDate: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const result = await getDb()
        .select({
          total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(expenses)
        .where(eq(expenses.date, input.date));
      return result[0];
    }),

  summaryByCategory: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          category: expenses.category,
          total: sql<number>`SUM(${expenses.amount})`,
        })
        .from(expenses)
        .where(eq(expenses.date, input.date))
        .groupBy(expenses.category);
    }),
});
