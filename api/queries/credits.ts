import { getDb } from "./connection";
import { creditTransactions, profiles } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Get credit transactions for a user
export async function findCreditTransactions(userId: number, limit: number = 50) {
  return getDb().query.creditTransactions.findMany({
    where: eq(creditTransactions.userId, userId),
    orderBy: desc(creditTransactions.createdAt),
    limit,
  });
}

// Get user's credit balance
export async function getCreditBalance(userId: number): Promise<number> {
  const profile = await getDb().query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  return profile?.creditBalance ?? 0;
}

// Add credits to user
export async function addCredits(data: {
  userId: number;
  amount: number;
  type: string;
  description?: string;
  contractId?: number;
  relatedUserId?: number;
}) {
  const db = getDb();

  return db.transaction(async (tx) => {
    // Get current balance
    const profile = await tx.query.profiles.findFirst({
      where: eq(profiles.userId, data.userId),
    });
    const currentBalance = profile?.creditBalance ?? 0;
    const newBalance = currentBalance + data.amount;

    // Update balance
    await tx
      .update(profiles)
      .set({ creditBalance: newBalance })
      .where(eq(profiles.userId, data.userId));

    // Record transaction
    await tx.insert(creditTransactions).values({
      userId: data.userId,
      amount: data.amount,
      type: data.type as any,
      balanceAfter: newBalance,
      description: data.description,
      contractId: data.contractId,
      relatedUserId: data.relatedUserId,
    });

    return newBalance;
  });
}

// Deduct credits from user
export async function deductCredits(data: {
  userId: number;
  amount: number;
  type: string;
  description?: string;
  contractId?: number;
  relatedUserId?: number;
}): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const db = getDb();

  return db.transaction(async (tx) => {
    // Get current balance
    const profile = await tx.query.profiles.findFirst({
      where: eq(profiles.userId, data.userId),
    });
    const currentBalance = profile?.creditBalance ?? 0;

    if (currentBalance < data.amount) {
      return { success: false, error: "Insufficient credits" };
    }

    const newBalance = currentBalance - data.amount;

    // Update balance
    await tx
      .update(profiles)
      .set({ creditBalance: newBalance })
      .where(eq(profiles.userId, data.userId));

    // Record transaction
    await tx.insert(creditTransactions).values({
      userId: data.userId,
      amount: -data.amount,
      type: data.type as any,
      balanceAfter: newBalance,
      description: data.description,
      contractId: data.contractId,
      relatedUserId: data.relatedUserId,
    });

    return { success: true, newBalance };
  });
}
