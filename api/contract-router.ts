import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  createContract,
  findContractById,
  findContractsByParticipant,
  acceptContract,
  updateChecklist,
  updateMilestones,
  completeContract,
} from "./queries/contracts";
import { createNotification } from "./queries/notifications";
import { addCredits, deductCredits } from "./queries/credits";

export const contractRouter = createRouter({
  // Create a new contract
  create: authedQuery
    .input(
      z.object({
        matchId: z.number(),
        recipientUserId: z.number(),
        title: z.string().min(3).max(200),
        description: z.string().min(10).max(5000),
        requiredSkillId: z.number().optional(),
        offeredSkillId: z.number().optional(),
        estimatedHours: z.number().min(1).max(500),
        escrowCredits: z.number().min(1),
        complexity: z.enum(["simple", "moderate", "complex"]),
        deadline: z.string().datetime().optional(),
        deliverables: z.array(z.string()).optional(),
        checklist: z
          .array(
            z.object({
              text: z.string(),
              completed: z.boolean().default(false),
            })
          )
          .optional(),
        milestones: z
          .array(
            z.object({
              title: z.string(),
              description: z.string().default(""),
              dueDate: z.string(),
              status: z.string().default("pending"),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Deduct escrow credits
      const result = await deductCredits({
        userId: ctx.user.id,
        amount: input.escrowCredits,
        type: "escrow_lock",
        description: `Escrow for contract: ${input.title}`,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits for escrow",
        });
      }

      const contractId = await createContract({
        matchId: input.matchId,
        initiatorUserId: ctx.user.id,
        recipientUserId: input.recipientUserId,
        title: input.title,
        description: input.description,
        requiredSkillId: input.requiredSkillId,
        offeredSkillId: input.offeredSkillId,
        estimatedHours: input.estimatedHours,
        escrowCredits: input.escrowCredits,
        complexity: input.complexity,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
        deliverables: input.deliverables,
        checklist: input.checklist,
        milestones: input.milestones,
      });

      // Notify recipient
      await createNotification({
        userId: input.recipientUserId,
        type: "contract_request",
        title: "New Collaboration Request",
        message: `You received a collaboration request: ${input.title}`,
        relatedId: contractId,
        relatedType: "contract",
        actionUrl: `/workspace/${contractId}`,
      });

      return { id: contractId, success: true };
    }),

  // Get contract by ID
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await findContractById(input.id);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      // Verify user is participant
      if (
        contract.initiatorUserId !== ctx.user.id &&
        contract.recipientUserId !== ctx.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }
      return contract;
    }),

  // Get user's contracts
  myContracts: authedQuery.query(async ({ ctx }) => {
    return findContractsByParticipant(ctx.user.id);
  }),

  // Accept a contract
  accept: authedQuery
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const contract = await findContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (contract.recipientUserId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the recipient can accept",
        });
      }

      await acceptContract(input.contractId);

      // Notify initiator
      await createNotification({
        userId: contract.initiatorUserId,
        type: "contract_accepted",
        title: "Contract Accepted!",
        message: `Your contract "${contract.title}" has been accepted!`,
        relatedId: contract.id,
        relatedType: "contract",
        actionUrl: `/workspace/${contract.id}`,
      });

      return { success: true };
    }),

  // Update checklist
  updateChecklist: authedQuery
    .input(
      z.object({
        contractId: z.number(),
        checklist: z.array(
          z.object({ text: z.string(), completed: z.boolean() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await updateChecklist(input.contractId, input.checklist);
      return { success: true };
    }),

  // Update milestones
  updateMilestones: authedQuery
    .input(
      z.object({
        contractId: z.number(),
        milestones: z.array(
          z.object({
            title: z.string(),
            description: z.string().default(""),
            dueDate: z.string(),
            status: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await updateMilestones(input.contractId, input.milestones);
      return { success: true };
    }),

  // Complete a contract
  complete: authedQuery
    .input(
      z.object({
        contractId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contract = await findContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      await completeContract(input.contractId, input.rating, input.comment);

      // Release escrow credits to recipient
      if (contract.escrowCredits > 0) {
        const otherUserId =
          contract.initiatorUserId === ctx.user.id
            ? contract.recipientUserId
            : contract.initiatorUserId;

        await addCredits({
          userId: otherUserId,
          amount: contract.escrowCredits,
          type: "escrow_release",
          description: `Completed: ${contract.title}`,
          contractId: contract.id,
          relatedUserId: ctx.user.id,
        });

        // Add completion bonus to both
        await addCredits({
          userId: ctx.user.id,
          amount: Math.ceil(contract.escrowCredits * 0.1), // 10% bonus
          type: "task_completion",
          description: `Completion bonus for: ${contract.title}`,
          contractId: contract.id,
        });
      }

      // Notify the other party
      const otherUserId =
        contract.initiatorUserId === ctx.user.id
          ? contract.recipientUserId
          : contract.initiatorUserId;

      await createNotification({
        userId: otherUserId,
        type: "contract_completed",
        title: "Contract Completed!",
        message: `"${contract.title}" has been completed!`,
        relatedId: contract.id,
        relatedType: "contract",
        actionUrl: `/workspace/${contract.id}`,
      });

      return { success: true };
    }),
});
