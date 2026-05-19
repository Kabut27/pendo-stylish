import { createRouter } from "./middleware";
import { workerRouter } from "./routers/worker";
import { serviceRouter } from "./routers/service";
import { saleRouter } from "./routers/sale";
import { expenseRouter } from "./routers/expense";
import { todoRouter } from "./routers/todo";
import { loanRouter } from "./routers/loan";
import { vaultRouter } from "./routers/vault";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = createRouter({
  worker: workerRouter,
  service: serviceRouter,
  sale: saleRouter,
  expense: expenseRouter,
  todo: todoRouter,
  loan: loanRouter,
  vault: vaultRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
