import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { sales, expenses, todos, loans, workers, services } from "../../db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";

export const dashboardRouter = createRouter({
  dailySummary: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const { date } = input;

      const [salesResult] = await getDb()
        .select({ total: sql<number>`COALESCE(SUM(${sales.amount}), 0)` })
        .from(sales)
        .where(eq(sales.date, date));

      const [expensesResult] = await getDb()
        .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
        .from(expenses)
        .where(eq(expenses.date, date));

      const salesCount = await getDb()
        .select({ count: sql<number>`COUNT(*)` })
        .from(sales)
        .where(eq(sales.date, date));

      const activeWorkers = await getDb()
        .select({ count: sql<number>`COUNT(*)` })
        .from(workers)
        .where(eq(workers.isActive, true));

      const pendingTodos = await getDb()
        .select({ count: sql<number>`COUNT(*)` })
        .from(todos)
        .where(eq(todos.isCompleted, false));

      const [loanSummary] = await getDb()
        .select({
          totalLoaned: sql<number>`COALESCE(SUM(${loans.amount}), 0)`,
          totalPaid: sql<number>`COALESCE(SUM(${loans.amountPaid}), 0)`,
        })
        .from(loans);

      return {
        date,
        totalSales: salesResult.total || 0,
        totalExpenses: expensesResult.total || 0,
        netProfit: (salesResult.total || 0) - (expensesResult.total || 0),
        salesCount: salesCount[0]?.count || 0,
        activeWorkers: activeWorkers[0]?.count || 0,
        pendingTodos: pendingTodos[0]?.count || 0,
        totalLoaned: loanSummary.totalLoaned || 0,
        totalLoanPaid: loanSummary.totalPaid || 0,
        loanBalance: (loanSummary.totalLoaned || 0) - (loanSummary.totalPaid || 0),
      };
    }),

  monthlySummary: publicQuery
    .input(z.object({ year: z.number(), month: z.number() }))
    .query(async ({ input }) => {
      const { year, month } = input;
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

      const [salesResult] = await getDb()
        .select({ total: sql<number>`COALESCE(SUM(${sales.amount}), 0)` })
        .from(sales)
        .where(and(gte(sales.date, startDate), lte(sales.date, endDate)));

      const [expensesResult] = await getDb()
        .select({ total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)` })
        .from(expenses)
        .where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)));

      return {
        year,
        month,
        totalSales: salesResult.total || 0,
        totalExpenses: expensesResult.total || 0,
        netProfit: (salesResult.total || 0) - (expensesResult.total || 0),
      };
    }),

  recentSales: publicQuery.query(async () => {
    return getDb()
      .select()
      .from(sales)
      .orderBy(desc(sales.createdAt))
      .limit(10);
  }),

  topWorkers: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          workerId: sales.workerId,
          workerName: workers.name,
          totalSales: sql<number>`SUM(${sales.amount})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(sales)
        .leftJoin(workers, eq(sales.workerId, workers.id))
        .where(eq(sales.date, input.date))
        .groupBy(sales.workerId)
        .orderBy(sql`SUM(${sales.amount}) DESC`);
    }),

  paymentMethodBreakdown: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          method: sales.paymentMethod,
          total: sql<number>`SUM(${sales.amount})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(sales)
        .where(eq(sales.date, input.date))
        .groupBy(sales.paymentMethod);
    }),

  expenseCategoryBreakdown: publicQuery
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      return getDb()
        .select({
          category: expenses.category,
          total: sql<number>`SUM(${expenses.amount})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(expenses)
        .where(eq(expenses.date, input.date))
        .groupBy(expenses.category);
    }),

  exportAll: publicQuery.query(async () => {
    const allSales = await getDb().select().from(sales).orderBy(desc(sales.createdAt));
    const allExpenses = await getDb().select().from(expenses).orderBy(desc(expenses.createdAt));
    const allTodos = await getDb().select().from(todos).orderBy(desc(todos.createdAt));
    const allLoans = await getDb().select().from(loans).orderBy(desc(loans.createdAt));
    const allWorkers = await getDb().select().from(workers);
    const allServices = await getDb().select().from(services);

    return {
      sales: allSales,
      expenses: allExpenses,
      todos: allTodos,
      loans: allLoans,
      workers: allWorkers,
      services: allServices,
    };
  }),
});
