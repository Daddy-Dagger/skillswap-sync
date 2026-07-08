import { getDb } from "./connection";
import { notifications } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Get notifications for a user
export async function findNotifications(userId: number, limit: number = 50) {
  return getDb().query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: desc(notifications.createdAt),
    limit,
  });
}

// Get unread notifications count
export async function countUnreadNotifications(userId: number): Promise<number> {
  const results = await getDb()
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );
  return results[0]?.count ?? 0;
}

// Create a notification
export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  message?: string;
  relatedId?: number;
  relatedType?: string;
  actionUrl?: string;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      type: data.type as any,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
      actionUrl: data.actionUrl,
    })
    .$returningId();
  return id;
}

// Mark notification as read
export async function markNotificationRead(notificationId: number) {
  await getDb()
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(userId: number) {
  await getDb()
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}
