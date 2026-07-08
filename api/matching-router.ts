import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  recordSwipe,
  checkMutualMatch,
  createMatch,
  acceptMatch,
  declineMatch,
  findUserMatches,
  calculateCompatibilityScore,
} from "./queries/matching";
import { createNotification } from "./queries/notifications";

export const matchingRouter = createRouter({
  // Record a swipe and check for mutual match
  swipe: authedQuery
    .input(
      z.object({
        swipedUserId: z.number(),
        action: z.enum(["like", "pass", "superlike"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const swiperUserId = ctx.user.id;

      if (swiperUserId === input.swipedUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot swipe on yourself",
        });
      }

      // Calculate compatibility score
      const score = await calculateCompatibilityScore(
        swiperUserId,
        input.swipedUserId
      );

      // Record the swipe
      await recordSwipe({
        swiperUserId,
        swipedUserId: input.swipedUserId,
        action: input.action,
        compatibilityScore: score,
      });

      // Check for mutual match if it's a like/superlike
      let match = null;
      if (input.action === "like" || input.action === "superlike") {
        const isMutual = await checkMutualMatch(
          swiperUserId,
          input.swipedUserId
        );

        if (isMutual) {
          // Create match - ensure userAId < userBId for consistency
          const [userA, userB] =
            swiperUserId < input.swipedUserId
              ? [swiperUserId, input.swipedUserId]
              : [input.swipedUserId, swiperUserId];

          const matchId = await createMatch({
            userAId: userA,
            userBId: userB,
            compatibilityScore: score,
          });

          // Create notifications for both users
          await createNotification({
            userId: swiperUserId,
            type: "match",
            title: "It's a match!",
            message: "You matched with a new collaborator!",
            relatedId: matchId,
            relatedType: "match",
            actionUrl: `/matches`,
          });

          await createNotification({
            userId: input.swipedUserId,
            type: "match",
            title: "It's a match!",
            message: "Someone wants to collaborate with you!",
            relatedId: matchId,
            relatedType: "match",
            actionUrl: `/matches`,
          });

          match = { matchId, score };
        }
      }

      return {
        success: true,
        score,
        match,
      };
    }),

  // Get user's matches
  myMatches: authedQuery.query(async ({ ctx }) => {
    return findUserMatches(ctx.user.id);
  }),

  // Accept a match
  accept: authedQuery
    .input(z.object({ matchId: z.number() }))
    .mutation(async ({ input }) => {
      await acceptMatch(input.matchId);
      return { success: true };
    }),

  // Decline a match
  decline: authedQuery
    .input(z.object({ matchId: z.number() }))
    .mutation(async ({ input }) => {
      await declineMatch(input.matchId);
      return { success: true };
    }),

  // Calculate compatibility (preview)
  compatibility: authedQuery
    .input(z.object({ targetUserId: z.number() }))
    .query(async ({ ctx, input }) => {
      const score = await calculateCompatibilityScore(
        ctx.user.id,
        input.targetUserId
      );
      return { score };
    }),
});
