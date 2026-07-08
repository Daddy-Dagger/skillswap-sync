import { getDb } from "./connection";
import { swipeActions, matches, profiles, users, userSkills, wantedSkills } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

// Record a swipe action
export async function recordSwipe(data: {
  swiperUserId: number;
  swipedUserId: number;
  action: "like" | "pass" | "superlike";
  compatibilityScore?: number;
}) {
  const db = getDb();
  await db
    .insert(swipeActions)
    .values({
      swiperUserId: data.swiperUserId,
      swipedUserId: data.swipedUserId,
      action: data.action,
      compatibilityScore: data.compatibilityScore ?? 0,
    })
    .onDuplicateKeyUpdate({
      set: {
        action: data.action,
        compatibilityScore: data.compatibilityScore ?? 0,
      },
    });
}

// Check for mutual match (both users liked each other)
export async function checkMutualMatch(
  userAId: number,
  userBId: number
): Promise<boolean> {
  const db = getDb();
  // Check if userB liked userA
  const mutualLike = await db.query.swipeActions.findFirst({
    where: and(
      eq(swipeActions.swiperUserId, userBId),
      eq(swipeActions.swipedUserId, userAId),
      eq(swipeActions.action, "like")
    ),
  });
  return !!mutualLike;
}

// Create a match
export async function createMatch(data: {
  userAId: number;
  userBId: number;
  compatibilityScore?: number;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(matches)
    .values({
      userAId: data.userAId,
      userBId: data.userBId,
      compatibilityScore: data.compatibilityScore ?? 0,
      status: "pending",
    })
    .$returningId();
  return id;
}

// Accept a match
export async function acceptMatch(matchId: number) {
  await getDb()
    .update(matches)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(matches.id, matchId));
}

// Decline a match
export async function declineMatch(matchId: number) {
  await getDb()
    .update(matches)
    .set({ status: "declined" })
    .where(eq(matches.id, matchId));
}

// Get user's matches
export async function findUserMatches(userId: number) {
  const db = getDb();
  return db
    .select({
      id: matches.id,
      status: matches.status,
      compatibilityScore: matches.compatibilityScore,
      matchedAt: matches.matchedAt,
      createdContract: matches.createdContract,
      matchUserId: sql<number>`CASE WHEN ${matches.userAId} = ${userId} THEN ${matches.userBId} ELSE ${matches.userAId} END`,
      matchName: users.name,
      matchAvatar: users.avatar,
      matchHeadline: profiles.headline,
      matchQualityTier: profiles.qualityTier,
    })
    .from(matches)
    .innerJoin(
      users,
      sql`${users.id} = CASE WHEN ${matches.userAId} = ${userId} THEN ${matches.userBId} ELSE ${matches.userAId} END`
    )
    .innerJoin(
      profiles,
      sql`${profiles.userId} = CASE WHEN ${matches.userAId} = ${userId} THEN ${matches.userBId} ELSE ${matches.userAId} END`
    )
    .where(
      and(
        sql`(${matches.userAId} = ${userId} OR ${matches.userBId} = ${userId})`,
        sql`${matches.status} IN ('accepted', 'pending')`
      )
    )
    .orderBy(desc(matches.matchedAt));
}

// Get swipe history for a user
export async function findSwipeHistory(userId: number) {
  return getDb().query.swipeActions.findMany({
    where: eq(swipeActions.swiperUserId, userId),
    orderBy: desc(swipeActions.createdAt),
  });
}

// Calculate compatibility score between two users
export async function calculateCompatibilityScore(
  userAId: number,
  userBId: number
): Promise<number> {
  const db = getDb();

  // Get user A's offered skills
  const aSkills = await db.query.userSkills.findMany({
    where: eq(userSkills.userId, userAId),
  });
  const aSkillIds = aSkills.map((s) => s.skillId);

  // Get user A's wanted skills
  const aWanted = await db.query.wantedSkills.findMany({
    where: eq(wantedSkills.userId, userAId),
  });
  const aWantedIds = aWanted.map((s) => s.skillId);

  // Get user B's offered skills
  const bSkills = await db.query.userSkills.findMany({
    where: eq(userSkills.userId, userBId),
  });
  const bSkillIds = bSkills.map((s) => s.skillId);

  // Get user B's wanted skills
  const bWanted = await db.query.wantedSkills.findMany({
    where: eq(wantedSkills.userId, userBId),
  });
  const bWantedIds = bWanted.map((s) => s.skillId);

  // Calculate skill complementarity
  // A wants what B has AND B wants what A has = good match
  const aWantsBHas = aWantedIds.filter((id) => bSkillIds.includes(id)).length;
  const bWantsAHas = bWantedIds.filter((id) => aSkillIds.includes(id)).length;

  const maxWanted = Math.max(aWantedIds.length, 1);
  const maxOffered = Math.max(bSkillIds.length, 1);

  const complementScore =
    ((aWantsBHas / maxWanted) * 50) + ((bWantsAHas / maxOffered) * 50);

  return Math.round(Math.min(100, Math.max(0, complementScore)));
}
