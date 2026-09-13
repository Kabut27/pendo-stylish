// app/api/reports/summary/route.js
// Ripoti ya jumla ya biashara kwa Dashibodi ya Mmiliki: mauzo ya leo/wiki/mwezi,
// ripoti kwa kila mfanyakazi, na P&L (Mapato - Matumizi = Faida Halisi).
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function periodToStartDate(period) {
  const now = new Date();
  if (period === "today") return now.toISOString().slice(0, 10);
  if (period === "month") {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return d.toISOString().slice(0, 10);
  }
  if (period === "year") {
    const d = new Date(now.getFullYear(), 0, 1);
    return d.toISOString().slice(0, 10);
  }
  // wiki (week) - siku 7 zilizopita ikiwemo leo
  const d = new Date(now);
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

export async function GET(req) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const period = ["today", "week", "month", "year"].includes(searchParams.get("period"))
    ? searchParams.get("period")
    : "week";
  const startDate = periodToStartDate(period);

  const [{ rows: totals }, { rows: byStaff }, { rows: expenseRows }, { rows: counts }, { rows: trend }] =
    await Promise.all([
      query(
        `SELECT COALESCE(SUM(revenue),0) AS revenue, COALESCE(SUM(cost),0) AS cost,
                COALESCE(SUM(profit),0) AS profit, COUNT(*)::int AS count
         FROM sales WHERE sale_date >= $1`,
        [startDate]
      ),
      query(
        `SELECT u.id AS staff_id, u.full_name,
                COALESCE(SUM(s.revenue),0) AS revenue,
                COALESCE(SUM(s.cost),0) AS cost,
                COALESCE(SUM(s.profit),0) AS profit,
                COUNT(s.id)::int AS count
         FROM users u
         LEFT JOIN sales s ON s.staff_id = u.id AND s.sale_date >= $1
         WHERE u.role = 'staff' AND u.active = true
         GROUP BY u.id, u.full_name
         ORDER BY revenue DESC`,
        [startDate]
      ),
      query(`SELECT COALESCE(SUM(amount),0) AS total FROM business_expenses WHERE expense_date >= $1`, [startDate]),
      query(
        `SELECT
           (SELECT COUNT(*)::int FROM users WHERE role = 'staff' AND active = true) AS staff_count,
           (SELECT COUNT(*)::int FROM products WHERE active = true) AS product_count`
      ),
      query(
        `SELECT sale_date::text AS day, COALESCE(SUM(revenue),0) AS revenue, COALESCE(SUM(profit),0) AS profit
         FROM sales
         WHERE sale_date >= (CURRENT_DATE - INTERVAL '13 days')
         GROUP BY sale_date
         ORDER BY sale_date ASC`
      ),
    ]);

  const totalExpenses = Number(expenseRows[0]?.total || 0);
  const totalRevenue = Number(totals[0]?.revenue || 0);
  const totalCost = Number(totals[0]?.cost || 0);
  const totalProfit = Number(totals[0]?.profit || 0);

  return NextResponse.json({
    period,
    startDate,
    totalRevenue,
    totalCost,
    totalProfit,
    totalExpenses,
    netProfit: totalProfit - totalExpenses,
    salesCount: totals[0]?.count || 0,
    staffCount: counts[0]?.staff_count || 0,
    productCount: counts[0]?.product_count || 0,
    byStaff,
    trend,
  });
}
