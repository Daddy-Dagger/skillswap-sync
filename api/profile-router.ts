import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  findCompleteProfile,
  upsertProfile,
  markUserOnboarded,
  findProfilesForDiscovery,
} from "./queries/profiles";

export const profileRouter = createRouter({
  // Get current user's complete profile
  me: authedQuery.query(async ({ ctx }) => {
    return findCompleteProfile(ctx.user.id);
  }),

  // Get profile by user ID
  byUserId: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return findCompleteProfile(input.userId);
    }),

  // Upsert profile
  update: authedQuery
    .input(
      z.object({
        headline: z.string().max(160).optional(),
        bio: z.string().max(2000).optional(),
        location: z.string().max(100).optional(),
        timezone: z.string().max(50).optional(),
        githubUrl: z.string().url().max(255).optional(),
        linkedinUrl: z.string().url().max(255).optional(),
        portfolioUrl: z.string().url().max(255).optional(),
        figmaUrl: z.string().url().max(255).optional(),
        availability: z
          .enum(["full_time", "part_time", "weekends", "limited", "unavailable"])
          .optional(),
        yearsOfExperience: z
          .enum(["0-1", "1-2", "2-3", "3-5", "5+"])
          .optional(),
        educationLevel: z
          .enum([
            "self_taught",
            "bootcamp",
            "associate",
            "bachelor",
            "master",
            "phd",
          ])
          .optional(),
        isStudent: z.boolean().optional(),
        institution: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await upsertProfile({
        userId: ctx.user.id,
        ...input,
      });
      return { id, success: true };
    }),

  // Mark onboarding complete
  completeOnboarding: authedQuery.mutation(async ({ ctx }) => {
    await markUserOnboarded(ctx.user.id);
    return { success: true };
  }),

  // Get profiles for discovery (swipe feed)
  discover: authedQuery
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      return findProfilesForDiscovery(ctx.user.id, input?.limit ?? 20);
    }),
});
