import { getDb } from "./connection";
import { profiles, users, userSkills, wantedSkills } from "@db/schema";
import { eq, sql } from "drizzle-orm";

// Find profile by user ID
export async function findProfileByUserId(userId: number) {
  return getDb().query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
}

// Find complete profile with user data
export async function findCompleteProfile(userId: number) {
  const db = getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  const userSkillList = await db.query.userSkills.findMany({
    where: eq(userSkills.userId, userId),
    with: { skill: { with: { category: true } } },
  });
  const wantedSkillList = await db.query.wantedSkills.findMany({
    where: eq(wantedSkills.userId, userId),
    with: { skill: { with: { category: true } } },
  });

  return { profile, user, userSkills: userSkillList, wantedSkills: wantedSkillList };
}

// Upsert profile (create or update)
export async function upsertProfile(data: {
  userId: number;
  headline?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  figmaUrl?: string;
  availability?: "full_time" | "part_time" | "weekends" | "limited" | "unavailable";
  yearsOfExperience?: "0-1" | "1-2" | "2-3" | "3-5" | "5+";
  educationLevel?: "self_taught" | "bootcamp" | "associate" | "bachelor" | "master" | "phd";
  isStudent?: boolean;
  institution?: string;
}) {
  const db = getDb();
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, data.userId),
  });

  if (existing) {
    await db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, data.userId));
    return existing.id;
  } else {
    const [{ id }] = await db
      .insert(profiles)
      .values({
        userId: data.userId,
        headline: data.headline,
        bio: data.bio,
        location: data.location,
        timezone: data.timezone,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        figmaUrl: data.figmaUrl,
        availability: data.availability,
        yearsOfExperience: data.yearsOfExperience,
        educationLevel: data.educationLevel,
        isStudent: data.isStudent ?? false,
        institution: data.institution,
        creditBalance: 50, // Starting bonus
      })
      .$returningId();
    return id;
  }
}

// Update user's onboarded status
export async function markUserOnboarded(userId: number) {
  await getDb()
    .update(users)
    .set({ isOnboarded: true })
    .where(eq(users.id, userId));
}

// Find profiles for discovery/swipe (excluding current user)
export async function findProfilesForDiscovery(userId: number, limit: number = 20) {
  const db = getDb();

  const results = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      headline: profiles.headline,
      bio: profiles.bio,
      location: profiles.location,
      qualityTier: profiles.qualityTier,
      reputationScore: profiles.reputationScore,
      contributionScore: profiles.contributionScore,
      completionRate: profiles.completionRate,
      availability: profiles.availability,
      name: users.name,
      avatar: users.avatar,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(sql`${profiles.userId} != ${userId} AND ${profiles.isPublic} = true`)
    .limit(limit);

  return results;
}

// Update reputation score
export async function updateReputationScore(userId: number, delta: number) {
  await getDb()
    .update(profiles)
    .set({
      reputationScore: sql`${profiles.reputationScore} + ${delta}`,
    })
    .where(eq(profiles.userId, userId));
}

// Update credit balance
export async function updateCreditBalance(userId: number, delta: number) {
  await getDb()
    .update(profiles)
    .set({
      creditBalance: sql`${profiles.creditBalance} + ${delta}`,
    })
    .where(eq(profiles.userId, userId));
}
