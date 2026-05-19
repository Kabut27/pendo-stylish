import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { loans } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const loanRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().select().from(loans).orderBy(desc(loans.createdAt));
  }),

  listActive: publicQuery.query(async () => {
    return getDb()
      .select()
      .from(loans)
      .where(eq(loans.isPaidOff, false))
      .orderBy(desc(loans.createdAt));
  }),

  create: publicQuery
    .input(
      z.object({
        lenderName: z.string().min(1),
        amount: z.number().positive(),
        interestRate: z.number().default(0),
        startDate: z.string(),
        dueDate: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(loans).values(input).returning();
      return result[0];
    }),

  makePayment: publicQuery
    .input(z.object({ id: z.number(), amount: z.number().positive() }))
    .mutation(async ({ input }) => {
      const [loan] = await getDb()
        .select()
        .from(loans)
        .where(eq(loans.id, input.id))
        .limit(1);
      if (!loan) throw new Error("Mkopo haujapatikana");

      const newPaid = (loan.amountPaid || 0) + input.amount;
      const isPaidOff = newPaid >= loan.amount;

      const result = await getDb()
        .update(loans)
        .set({ amountPaid: newPaid, isPaidOff })
        .where(eq(loans.id, input.id))
        .returning();
      return result[0];
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        lenderName: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        amountPaid: z.number().optional(),
        interestRate: z.number().optional(),
        startDate: z.string().optional(),
        dueDate: z.string().optional(),
        isPaidOff: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await getDb()
        .update(loans)
        .set(data)
        .where(eq(loans.id, id))
        .returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(loans).where(eq(loans.id, input.id));
      return { success: true };
    }),

  summary: publicQuery.query(async () => {
    const result = await getDb()
      .select({
        totalLoaned: sql<number>`COALESCE(SUM(${loans.amount}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${loans.amountPaid}), 0)`,
        activeCount: sql<number>`SUM(CASE WHEN ${loans.isPaidOff} = 0 THEN 1 ELSE 0 END)`,
        paidCount: sql<number>`SUM(CASE WHEN ${loans.isPaidOff} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(loans);
    return result[0];
  }),
});
