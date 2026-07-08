import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { profiles, users } from "@db/schema";
import { desc, sql } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  // Get top users by reputation
  topReputation: publicQuery.query(async () => {
    return getDb()
      .select({
        userId: profiles.userId,
        name: users.name,
        avatar: users.avatar,
        headline: profiles.headline,
        reputationScore: profiles.reputationScore,
        trustScore: profiles.trustScore,
        contributionScore: profiles.contributionScore,
        totalProjects: profiles.totalProjects,
        qualityTier: profiles.qualityTier,
      })
      .from(profiles)
      .innerJoin(users, sql`${users.id} = ${profiles.userId}`)
      .where(sql`${profiles.isPublic} = true`)
      .orderBy(desc(profiles.reputationScore))
      .limit(50);
  }),

  // Get top contributors
  topContributors: publicQuery.query(async () => {
    return getDb()
      .select({
        userId: profiles.userId,
        name: users.name,
        avatar: users.avatar,
        headline: profiles.headline,
        contributionScore: profiles.contributionScore,
        totalProjects: profiles.totalProjects,
        totalHours: profiles.totalHours,
        qualityTier: profiles.qualityTier,
      })
      .from(profiles)
      .innerJoin(users, sql`${users.id} = ${profiles.userId}`)
      .where(sql`${profiles.isPublic} = true`)
      .orderBy(desc(profiles.contributionScore))
      .limit(50);
  }),

  // Get rising stars (new users with good scores)
  risingStars: publicQuery.query(async () => {
    return getDb()
      .select({
        userId: profiles.userId,
        name: users.name,
        avatar: users.avatar,
        headline: profiles.headline,
        reputationScore: profiles.reputationScore,
        completionRate: profiles.completionRate,
        totalProjects: profiles.totalProjects,
        qualityTier: profiles.qualityTier,
      })
      .from(profiles)
      .innerJoin(users, sql`${users.id} = ${profiles.userId}`)
      .where(
        sql`${profiles.isPublic} = true AND ${profiles.totalProjects} > 0 AND ${profiles.totalProjects} <= 3`
      )
      .orderBy(desc(profiles.reputationScore))
      .limit(20);
  }),
});
