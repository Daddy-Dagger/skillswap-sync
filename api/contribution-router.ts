import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contributionRecords } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const contributionRouter = createRouter({
  // Get user's contribution records
  mine: authedQuery.query(async ({ ctx }) => {
    return getDb().query.contributionRecords.findMany({
      where: eq(contributionRecords.userId, ctx.user.id),
      orderBy: desc(contributionRecords.createdAt),
    });
  }),

  // Get contribution by ID
  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const record = await getDb().query.contributionRecords.findFirst({
        where: eq(contributionRecords.id, input.id),
      });
      return record;
    }),

  // Get public contribution records for a user
  byUserId: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return getDb().query.contributionRecords.findMany({
        where: eq(contributionRecords.userId, input.userId),
        orderBy: desc(contributionRecords.createdAt),
      });
    }),

  // Get public portfolio feed
  feed: authedQuery
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(contributionRecords)
        .where(eq(contributionRecords.isPublic, true))
        .orderBy(desc(contributionRecords.createdAt))
        .limit(input?.limit ?? 20);
    }),
});
