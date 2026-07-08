import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  findCreditTransactions,
  getCreditBalance,
  addCredits,
  hasClaimedSignupBonus,
} from "./queries/credits";

export const creditRouter = createRouter({
  // Get credit balance
  balance: authedQuery.query(async ({ ctx }) => {
    const balance = await getCreditBalance(ctx.user.id);
    return { balance };
  }),

  // Get transaction history
  transactions: authedQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return findCreditTransactions(ctx.user.id, input?.limit ?? 50);
    }),

  // Award signup bonus (idempotent - can only be claimed once)
  claimSignupBonus: authedQuery.mutation(async ({ ctx }) => {
    const hasClaimed = await hasClaimedSignupBonus(ctx.user.id);
    if (hasClaimed) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Signup bonus has already been claimed",
      });
    }

    await addCredits({
      userId: ctx.user.id,
      amount: 50,
      type: "signup_bonus",
      description: "Welcome bonus for joining SkillSwap Sync!",
    });
    return { awarded: true, amount: 50 };
  }),
});
