import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  createWorkspaceMessage,
  findWorkspaceMessages,
  getOrCreateWorkspaceNotes,
  updateWorkspaceNotes,
  findContractById,
} from "./queries/contracts";

export const workspaceRouter = createRouter({
  // Send a message in workspace
  sendMessage: authedQuery
    .input(
      z.object({
        contractId: z.number(),
        content: z.string().min(1).max(2000),
        messageType: z
          .enum(["text", "file", "milestone", "system", "activity"])
          .default("text"),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is a participant
      const contract = await findContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (
        contract.initiatorUserId !== ctx.user.id &&
        contract.recipientUserId !== ctx.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }

      const messageId = await createWorkspaceMessage({
        contractId: input.contractId,
        senderUserId: ctx.user.id,
        content: input.content,
        messageType: input.messageType,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
      });

      return { id: messageId, success: true };
    }),

  // Get workspace messages
  messages: authedQuery
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await findContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (
        contract.initiatorUserId !== ctx.user.id &&
        contract.recipientUserId !== ctx.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }

      return findWorkspaceMessages(input.contractId);
    }),

  // Get workspace notes
  notes: authedQuery
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await findContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (
        contract.initiatorUserId !== ctx.user.id &&
        contract.recipientUserId !== ctx.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }

      return getOrCreateWorkspaceNotes(input.contractId);
    }),

  // Update workspace notes
  updateNotes: authedQuery
    .input(
      z.object({
        contractId: z.number(),
        content: z.string().max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contract = await findContractById(input.contractId);
      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }
      if (
        contract.initiatorUserId !== ctx.user.id &&
        contract.recipientUserId !== ctx.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a participant" });
      }

      await updateWorkspaceNotes(input.contractId, input.content, ctx.user.id);
      return { success: true };
    }),
});
