import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  skills,
  skillCategories,
  userSkills,
  wantedSkills,
  swipeActions,
  matches,
  syncContracts,
  workspaceMessages,
  workspaceNotes,
  creditTransactions,
  reviews,
  endorsements,
  contributionRecords,
  notifications,
  disputes,
  activityFeed,
  bookmarks,
} from "./schema";

// Users -> Profile (1:1)
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  userSkills: many(userSkills),
  wantedSkills: many(wantedSkills),
  swipeActions: many(swipeActions),
  matchesAsA: many(matches, { relationName: "userA" }),
  matchesAsB: many(matches, { relationName: "userB" }),
  creditTransactions: many(creditTransactions),
  notifications: many(notifications),
  bookmarks: many(bookmarks),
  activityFeed: many(activityFeed),
}));

// Profile -> User (1:1)
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

// Skill Category -> Skills (1:N)
export const skillCategoriesRelations = relations(
  skillCategories,
  ({ many }) => ({
    skills: many(skills),
  })
);

// Skill -> Category (N:1), UserSkills (1:N)
export const skillsRelations = relations(skills, ({ one, many }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
  userSkills: many(userSkills),
}));

// UserSkill -> User, Skill (N:1), Endorsements (1:N)
export const userSkillsRelations = relations(userSkills, ({ one, many }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
  endorsements: many(endorsements),
}));

// WantedSkill -> User, Skill (N:1)
export const wantedSkillsRelations = relations(wantedSkills, ({ one }) => ({
  user: one(users, {
    fields: [wantedSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [wantedSkills.skillId],
    references: [skills.id],
  }),
}));

// SwipeAction -> Swiper, Swiped (N:1)
export const swipeActionsRelations = relations(swipeActions, ({ one }) => ({
  swiper: one(users, {
    fields: [swipeActions.swiperUserId],
    references: [users.id],
  }),
  swiped: one(users, {
    fields: [swipeActions.swipedUserId],
    references: [users.id],
  }),
}));

// Match -> UserA, UserB (N:1), Contract (1:1)
export const matchesRelations = relations(matches, ({ one }) => ({
  userA: one(users, { fields: [matches.userAId], references: [users.id] }),
  userB: one(users, { fields: [matches.userBId], references: [users.id] }),
  contract: one(syncContracts, {
    fields: [matches.id],
    references: [syncContracts.matchId],
  }),
}));

// SyncContract -> Match, Messages (1:N), Notes (1:1), Reviews (1:N), Contribution (1:1)
export const syncContractsRelations = relations(
  syncContracts,
  ({ one, many }) => ({
    match: one(matches, {
      fields: [syncContracts.matchId],
      references: [matches.id],
    }),
    messages: many(workspaceMessages),
    note: one(workspaceNotes, {
      fields: [syncContracts.id],
      references: [workspaceNotes.contractId],
    }),
    reviews: many(reviews),
    contributionRecord: one(contributionRecords, {
      fields: [syncContracts.id],
      references: [contributionRecords.contractId],
    }),
    creditTransactions: many(creditTransactions),
    dispute: one(disputes, {
      fields: [syncContracts.id],
      references: [disputes.contractId],
    }),
  })
);

// WorkspaceMessage -> Contract, Sender (N:1)
export const workspaceMessagesRelations = relations(
  workspaceMessages,
  ({ one }) => ({
    contract: one(syncContracts, {
      fields: [workspaceMessages.contractId],
      references: [syncContracts.id],
    }),
    sender: one(users, {
      fields: [workspaceMessages.senderUserId],
      references: [users.id],
    }),
  })
);

// Review -> Contract, Reviewer, Reviewee (N:1)
export const reviewsRelations = relations(reviews, ({ one }) => ({
  contract: one(syncContracts, {
    fields: [reviews.contractId],
    references: [syncContracts.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerUserId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeUserId],
    references: [users.id],
  }),
}));

// Endorsement -> Endorser, Endorsee, UserSkill (N:1)
export const endorsementsRelations = relations(endorsements, ({ one }) => ({
  endorser: one(users, {
    fields: [endorsements.endorserUserId],
    references: [users.id],
  }),
  endorsee: one(users, {
    fields: [endorsements.endorseeUserId],
    references: [users.id],
  }),
  userSkill: one(userSkills, {
    fields: [endorsements.userSkillId],
    references: [userSkills.id],
  }),
}));

// ContributionRecord -> User, Contract (N:1)
export const contributionRecordsRelations = relations(
  contributionRecords,
  ({ one }) => ({
    user: one(users, {
      fields: [contributionRecords.userId],
      references: [users.id],
    }),
    contract: one(syncContracts, {
      fields: [contributionRecords.contractId],
      references: [syncContracts.id],
    }),
  })
);

// Notification -> User (N:1)
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Dispute -> Contract, Reporter, Reported (N:1)
export const disputesRelations = relations(disputes, ({ one }) => ({
  contract: one(syncContracts, {
    fields: [disputes.contractId],
    references: [syncContracts.id],
  }),
  reporter: one(users, {
    fields: [disputes.reporterUserId],
    references: [users.id],
  }),
  reported: one(users, {
    fields: [disputes.reportedUserId],
    references: [users.id],
  }),
}));

// ActivityFeed -> User, Actor (N:1)
export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  user: one(users, {
    fields: [activityFeed.userId],
    references: [users.id],
  }),
  actor: one(users, {
    fields: [activityFeed.actorUserId],
    references: [users.id],
  }),
}));

// Bookmark -> User, BookmarkedUser (N:1)
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  bookmarkedUser: one(users, {
    fields: [bookmarks.bookmarkedUserId],
    references: [users.id],
  }),
}));
