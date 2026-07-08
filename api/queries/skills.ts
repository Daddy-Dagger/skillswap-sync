import { getDb } from "./connection";
import { skills, skillCategories, userSkills, wantedSkills } from "@db/schema";
import { eq, and } from "drizzle-orm";

// Get all skill categories
export async function findAllCategories() {
  return getDb().query.skillCategories.findMany({
    where: eq(skillCategories.isActive, true),
    orderBy: skillCategories.sortOrder,
  });
}

// Get all skills
export async function findAllSkills() {
  return getDb().query.skills.findMany({
    where: eq(skills.isActive, true),
    with: { category: true },
  });
}

// Get skills by category
export async function findSkillsByCategory(categoryId: number) {
  return getDb().query.skills.findMany({
    where: and(eq(skills.categoryId, categoryId), eq(skills.isActive, true)),
  });
}

// Get a skill by ID
export async function findSkillById(id: number) {
  return getDb().query.skills.findFirst({
    where: eq(skills.id, id),
    with: { category: true },
  });
}

// Get user skills with skill details
export async function findUserSkills(userId: number) {
  return getDb().query.userSkills.findMany({
    where: eq(userSkills.userId, userId),
    with: { skill: { with: { category: true } } },
  });
}

// Get wanted skills for a user
export async function findWantedSkills(userId: number) {
  return getDb().query.wantedSkills.findMany({
    where: eq(wantedSkills.userId, userId),
    with: { skill: { with: { category: true } } },
  });
}

// Add a skill to user
export async function addUserSkill(data: {
  userId: number;
  skillId: number;
  proficiencyLevel: string;
  yearsExperience: number;
  portfolioUrl?: string;
  description?: string;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(userSkills)
    .values({
      userId: data.userId,
      skillId: data.skillId,
      proficiencyLevel: data.proficiencyLevel as any,
      yearsExperience: data.yearsExperience,
      portfolioUrl: data.portfolioUrl,
      description: data.description,
    })
    .$returningId();
  return id;
}

// Add a wanted skill
export async function addWantedSkill(data: {
  userId: number;
  skillId: number;
  priority: string;
  note?: string;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(wantedSkills)
    .values({
      userId: data.userId,
      skillId: data.skillId,
      priority: data.priority as any,
      note: data.note,
    })
    .$returningId();
  return id;
}

// Remove a user skill
export async function removeUserSkill(userId: number, skillId: number) {
  await getDb()
    .delete(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));
}

// Remove a wanted skill
export async function removeWantedSkill(userId: number, skillId: number) {
  await getDb()
    .delete(wantedSkills)
    .where(
      and(eq(wantedSkills.userId, userId), eq(wantedSkills.skillId, skillId))
    );
}
