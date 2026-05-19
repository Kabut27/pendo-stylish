import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { todos } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

export const todoRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().select().from(todos).orderBy(desc(todos.createdAt));
  }),

  listPending: publicQuery.query(async () => {
    return getDb()
      .select()
      .from(todos)
      .where(eq(todos.isCompleted, false))
      .orderBy(desc(todos.createdAt));
  }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["kodi", "mikopo", "mahitaji", "mengine"]),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await getDb().insert(todos).values(input).returning();
      return result[0];
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.enum(["kodi", "mikopo", "mahitaji", "mengine"]).optional(),
        dueDate: z.string().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const result = await getDb()
        .update(todos)
        .set(data)
        .where(eq(todos.id, id))
        .returning();
      return result[0];
    }),

  toggleComplete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [todo] = await getDb()
        .select()
        .from(todos)
        .where(eq(todos.id, input.id))
        .limit(1);
      if (!todo) return null;
      const result = await getDb()
        .update(todos)
        .set({ isCompleted: !todo.isCompleted })
        .where(eq(todos.id, input.id))
        .returning();
      return result[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(todos).where(eq(todos.id, input.id));
      return { success: true };
    }),
});
