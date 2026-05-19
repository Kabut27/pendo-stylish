import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { sales, services, workers } from "../../db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export const saleRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb()
      .select({
        id: sales.id,
        workerId: sales.workerId,
        serviceId: sales.serviceId,
        amount: sales.amount,
        paymentMethod: sales.paymentMethod,
        customerName: sales.customerName,
        notes: sales.notes,
        date: sales.date,
        createdAt: sales.createdAt,
        workerName: workers.name,
        serviceName: services.name,
      })
      .from(sales)
      .leftJoin(workers, eq(sales.workerId, workers.id))
      .leftJoin(services, eq(sales.serviceId, services.id))
      .orderBy(desc(sales.createdAt))
      .limit(200);
  }),

  listByDate: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          id: sales.id,
          workerId: sales.workerId,
          serviceId: sales.serviceId,
          amount: sales.amount,
          paymentMethod: sales.paymentMethod,
          customerName: sales.customerName,
          notes: sales.notes,
          date: sales.date,
          createdAt: sales.createdAt,
          workerName: workers.name,
          serviceName: services.name,
        })
        .from(sales)
        .leftJoin(workers, eq(sales.workerId, workers.id))
        .leftJoin(services, eq(sales.serviceId, services.id))
        .where(eq(sales.date, input.date))
        .orderBy(desc(sales.createdAt));
    }),

  listByDateRange: publicQuery
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          id: sales.id,
          workerId: sales.workerId,
          serviceId: sales.serviceId,
          amount: sales.amount,
          paymentMethod: sales.paymentMethod,
          customerName: sales.customerName,
          notes: sales.notes,
          date: sales.date,
          createdAt: sales.createdAt,
          workerName: workers.name,
          serviceName: services.name,
        })
        .from(sales)
        .leftJoin(workers, eq(sales.workerId, workers.id))
        .leftJoin(services, eq(sales.serviceId, services.id))
        .where(and(gte(sales.date, input.startDate), lte(sales.date, input.endDate)))
        .orderBy(desc(sales.createdAt));
    }),

  listByWorker: publicQuery
    .input(z.object({ workerId: z.number() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(sales)
        .where(eq(sales.workerId, input.workerId))
        .orderBy(desc(sales.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        workerId: z.number(),
        serviceId: z.number(),
        amount: z.number().positive(),
        paymentMethod: z.enum(["cash", "tigo_pesa", "m_pesa", "airtel_money"]),
        customerName: z.string().optional(),
        notes: z.string().optional(),
        date: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(sales).values(input).returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(sales).where(eq(sales.id, input.id));
      return { success: true };
    }),

  summaryByDate: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const result = await getDb()
        .select({
          total: sql<number>`COALESCE(SUM(${sales.amount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(sales)
        .where(eq(sales.date, input.date));
      return result[0];
    }),

  summaryByPaymentMethod: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          method: sales.paymentMethod,
          total: sql<number>`SUM(${sales.amount})`,
        })
        .from(sales)
        .where(eq(sales.date, input.date))
        .groupBy(sales.paymentMethod);
    }),
});
