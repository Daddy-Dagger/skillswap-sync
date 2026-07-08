import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  findNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./queries/notifications";

export const notificationRouter = createRouter({
  // Get notifications
  list: authedQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return findNotifications(ctx.user.id, input?.limit ?? 50);
    }),

  // Get unread count
  unreadCount: authedQuery.query(async ({ ctx }) => {
    const count = await countUnreadNotifications(ctx.user.id);
    return { count };
  }),

  // Mark as read
  markRead: authedQuery
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markNotificationRead(input.notificationId, ctx.user.id);
      return { success: true };
    }),

  // Mark all as read
  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    await markAllNotificationsRead(ctx.user.id);
    return { success: true };
  }),
});
