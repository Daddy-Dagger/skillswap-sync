import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { skillsRouter } from "./skills-router";
import { profileRouter } from "./profile-router";
import { matchingRouter } from "./matching-router";
import { contractRouter } from "./contract-router";
import { workspaceRouter } from "./workspace-router";
import { creditRouter } from "./credit-router";
import { notificationRouter } from "./notification-router";
import { leaderboardRouter } from "./leaderboard-router";
import { contributionRouter } from "./contribution-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  skills: skillsRouter,
  profile: profileRouter,
  matching: matchingRouter,
  contract: contractRouter,
  workspace: workspaceRouter,
  credit: creditRouter,
  notification: notificationRouter,
  leaderboard: leaderboardRouter,
  contribution: contributionRouter,
});

export type AppRouter = typeof appRouter;
