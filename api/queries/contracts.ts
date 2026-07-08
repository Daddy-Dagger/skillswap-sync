import { getDb } from "./connection";
import { syncContracts, workspaceMessages, workspaceNotes, reviews } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Create a new contract
export async function createContract(data: {
  matchId: number;
  initiatorUserId: number;
  recipientUserId: number;
  title: string;
  description: string;
  requiredSkillId?: number;
  offeredSkillId?: number;
  estimatedHours: number;
  escrowCredits: number;
  complexity: string;
  deadline?: Date;
  deliverables?: string[];
  checklist?: { text: string; completed: boolean }[];
  milestones?: { title: string; description: string; dueDate: string; status: string }[];
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(syncContracts)
    .values({
      matchId: data.matchId,
      initiatorUserId: data.initiatorUserId,
      recipientUserId: data.recipientUserId,
      title: data.title,
      description: data.description,
      requiredSkillId: data.requiredSkillId,
      offeredSkillId: data.offeredSkillId,
      status: "pending_acceptance",
      estimatedHours: data.estimatedHours,
      escrowCredits: data.escrowCredits,
      complexity: data.complexity as any,
      deadline: data.deadline,
      deliverables: data.deliverables ?? [],
      checklist: data.checklist ?? [],
      milestones: data.milestones ?? [],
    })
    .$returningId();
  return id;
}

// Get contract by ID
export async function findContractById(id: number) {
  return getDb().query.syncContracts.findFirst({
    where: eq(syncContracts.id, id),
  });
}

// Get contracts where user is participant
export async function findContractsByParticipant(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(syncContracts)
    .where(
      sql`${syncContracts.initiatorUserId} = ${userId} OR ${syncContracts.recipientUserId} = ${userId}`
    )
    .orderBy(desc(syncContracts.createdAt));
}

// Accept a contract
export async function acceptContract(contractId: number) {
  await getDb()
    .update(syncContracts)
    .set({ status: "active" })
    .where(eq(syncContracts.id, contractId));
}

// Update checklist item
export async function updateChecklist(
  contractId: number,
  checklist: { text: string; completed: boolean }[]
) {
  await getDb()
    .update(syncContracts)
    .set({ checklist })
    .where(eq(syncContracts.id, contractId));
}

// Update milestones
export async function updateMilestones(
  contractId: number,
  milestones: { title: string; description: string; dueDate: string; status: string }[]
) {
  await getDb()
    .update(syncContracts)
    .set({ milestones })
    .where(eq(syncContracts.id, contractId));
}

// Complete contract
export async function completeContract(
  contractId: number,
  rating: number,
  comment?: string
) {
  await getDb()
    .update(syncContracts)
    .set({
      status: "completed",
      finalRating: rating,
      reviewComment: comment,
      completedAt: new Date(),
    })
    .where(eq(syncContracts.id, contractId));
}

// Create workspace message
export async function createWorkspaceMessage(data: {
  contractId: number;
  senderUserId: number;
  content: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(workspaceMessages)
    .values({
      contractId: data.contractId,
      senderUserId: data.senderUserId,
      content: data.content,
      messageType: data.messageType as any ?? "text",
      fileUrl: data.fileUrl,
      fileName: data.fileName,
    })
    .$returningId();
  return id;
}

// Get workspace messages for a contract
export async function findWorkspaceMessages(contractId: number) {
  return getDb().query.workspaceMessages.findMany({
    where: eq(workspaceMessages.contractId, contractId),
    orderBy: workspaceMessages.createdAt,
  });
}

// Get or create workspace notes
export async function getOrCreateWorkspaceNotes(contractId: number) {
  const db = getDb();
  let notes = await db.query.workspaceNotes.findFirst({
    where: eq(workspaceNotes.contractId, contractId),
  });

  if (!notes) {
    await db
      .insert(workspaceNotes)
      .values({
        contractId,
        content: "# Project Notes\n\nStart collaborating here...",
      });
    notes = await db.query.workspaceNotes.findFirst({
      where: eq(workspaceNotes.contractId, contractId),
    });
  }

  return notes;
}

// Update workspace notes
export async function updateWorkspaceNotes(
  contractId: number,
  content: string,
  lastEditedBy: number
) {
  const db = getDb();
  await db
    .update(workspaceNotes)
    .set({ content, lastEditedBy })
    .where(eq(workspaceNotes.contractId, contractId));
}

// Create a review
export async function createReview(data: {
  contractId: number;
  reviewerUserId: number;
  revieweeUserId: number;
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  timelinessRating: number;
  comment?: string;
}) {
  const db = getDb();
  const [{ id }] = await db
    .insert(reviews)
    .values({
      contractId: data.contractId,
      reviewerUserId: data.reviewerUserId,
      revieweeUserId: data.revieweeUserId,
      overallRating: data.overallRating,
      communicationRating: data.communicationRating,
      qualityRating: data.qualityRating,
      timelinessRating: data.timelinessRating,
      comment: data.comment,
    })
    .$returningId();
  return id;
}
