import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../../db/connection";
import { vault } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const vaultRouter = createRouter({
  get: publicQuery
    .input(z.object({ pin: z.string().length(4) }))
    .query(async ({ input }) => {
      const [vaultData] = await getDb().select().from(vault).limit(1);
      if (!vaultData) return null;

      const validPin = await bcrypt.compare(input.pin, vaultData.pin);
      if (!validPin) throw new Error("PIN sio sahihi");

      return {
        bankBalance: vaultData.bankBalance,
        cashBalance: vaultData.cashBalance,
        mobileBalance: vaultData.mobileBalance,
        lastUpdated: vaultData.lastUpdated,
      };
    }),

  verifyPin: publicQuery
    .input(z.object({ pin: z.string().length(4) }))
    .query(async ({ input }) => {
      const [vaultData] = await getDb().select().from(vault).limit(1);
      if (!vaultData) return false;
      return await bcrypt.compare(input.pin, vaultData.pin);
    }),

  update: publicQuery
    .input(
      z.object({
        pin: z.string().length(4),
        bankBalance: z.number().optional(),
        cashBalance: z.number().optional(),
        mobileBalance: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { pin, ...data } = input;
      const [vaultData] = await getDb().select().from(vault).limit(1);
      if (!vaultData) {
        const hashedPin = await bcrypt.hash(pin, 10);
        const result = await getDb()
          .insert(vault)
          .values({
            bankBalance: data.bankBalance || 0,
            cashBalance: data.cashBalance || 0,
            mobileBalance: data.mobileBalance || 0,
            pin: hashedPin,
          })
          .returning();
        return result[0];
      }

      const validPin = await bcrypt.compare(pin, vaultData.pin);
      if (!validPin) throw new Error("PIN sio sahihi");

      const result = await getDb()
        .update(vault)
        .set({ ...data, lastUpdated: new Date() })
        .where(eq(vault.id, vaultData.id))
        .returning();
      return result[0];
    }),

  changePin: publicQuery
    .input(
      z.object({
        oldPin: z.string().length(4),
        newPin: z.string().length(4),
      })
    )
    .mutation(async ({ input }) => {
      const [vaultData] = await getDb().select().from(vault).limit(1);
      if (!vaultData) throw new Error("Vault haujapatikana");

      const validPin = await bcrypt.compare(input.oldPin, vaultData.pin);
      if (!validPin) throw new Error("PIN ya zamani sio sahihi");

      const hashedPin = await bcrypt.hash(input.newPin, 10);
      const result = await getDb()
        .update(vault)
        .set({ pin: hashedPin, lastUpdated: new Date() })
        .where(eq(vault.id, vaultData.id))
        .returning();
      return result[0];
    }),

  setup: publicQuery
    .input(
      z.object({
        pin: z.string().length(4),
        bankBalance: z.number().default(0),
        cashBalance: z.number().default(0),
        mobileBalance: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await getDb().select().from(vault).limit(1);
      if (existing.length > 0) throw new Error("Vault tayari umesetup");

      const hashedPin = await bcrypt.hash(input.pin, 10);
      const result = await getDb()
        .insert(vault)
        .values({
          pin: hashedPin,
          bankBalance: input.bankBalance,
          cashBalance: input.cashBalance,
          mobileBalance: input.mobileBalance,
        })
        .returning();
      return result[0];
    }),

  getTotals: publicQuery.query(async () => {
    const result = await getDb()
      .select({
        totalBank: sql<number>`COALESCE(SUM(${vault.bankBalance}), 0)`,
        totalCash: sql<number>`COALESCE(SUM(${vault.cashBalance}), 0)`,
        totalMobile: sql<number>`COALESCE(SUM(${vault.mobileBalance}), 0)`,
        total: sql<number>`COALESCE(SUM(${vault.bankBalance} + ${vault.cashBalance} + ${vault.mobileBalance}), 0)`,
      })
      .from(vault);
    return result[0];
  }),
});
