import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findAllCategories,
  findAllSkills,
  findSkillsByCategory,
  findUserSkills,
  findWantedSkills,
  addUserSkill,
  addWantedSkill,
  removeUserSkill,
  removeWantedSkill,
} from "./queries/skills";

export const skillsRouter = createRouter({
  // Get all skill categories
  categories: publicQuery.query(async () => {
    return findAllCategories();
  }),

  // Get all skills
  list: publicQuery.query(async () => {
    return findAllSkills();
  }),

  // Get skills by category
  byCategory: publicQuery
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      return findSkillsByCategory(input.categoryId);
    }),

  // Get current user's skills
  mySkills: authedQuery.query(async ({ ctx }) => {
    return findUserSkills(ctx.user.id);
  }),

  // Get current user's wanted skills
  myWantedSkills: authedQuery.query(async ({ ctx }) => {
    return findWantedSkills(ctx.user.id);
  }),

  // Add a skill to user
  addSkill: authedQuery
    .input(
      z.object({
        skillId: z.number(),
        proficiencyLevel: z.enum([
          "learning",
          "beginner",
          "intermediate",
          "advanced",
          "expert",
        ]),
        yearsExperience: z.number().min(0).max(50),
        portfolioUrl: z.string().url().optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await addUserSkill({
        userId: ctx.user.id,
        skillId: input.skillId,
        proficiencyLevel: input.proficiencyLevel,
        yearsExperience: input.yearsExperience,
        portfolioUrl: input.portfolioUrl,
        description: input.description,
      });
      return { id, success: true };
    }),

  // Add a wanted skill
  addWantedSkill: authedQuery
    .input(
      z.object({
        skillId: z.number(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        note: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await addWantedSkill({
        userId: ctx.user.id,
        skillId: input.skillId,
        priority: input.priority,
        note: input.note,
      });
      return { id, success: true };
    }),

  // Remove a user skill
  removeSkill: authedQuery
    .input(z.object({ skillId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeUserSkill(ctx.user.id, input.skillId);
      return { success: true };
    }),

  // Remove a wanted skill
  removeWantedSkill: authedQuery
    .input(z.object({ skillId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeWantedSkill(ctx.user.id, input.skillId);
      return { success: true };
    }),
});
