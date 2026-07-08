import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  json,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ============================================================
// CORE USERS
// ============================================================

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isOnboarded: boolean("isOnboarded").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// PROFILES
// ============================================================

export const profiles = mysqlTable(
  "profiles",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true })
      .notNull()
      .unique(),
    headline: varchar("headline", { length: 160 }),
    bio: text("bio"),
    location: varchar("location", { length: 100 }),
    timezone: varchar("timezone", { length: 50 }),
    githubUrl: varchar("githubUrl", { length: 255 }),
    linkedinUrl: varchar("linkedinUrl", { length: 255 }),
    portfolioUrl: varchar("portfolioUrl", { length: 255 }),
    figmaUrl: varchar("figmaUrl", { length: 255 }),
    availability: mysqlEnum("availability", [
      "full_time",
      "part_time",
      "weekends",
      "limited",
      "unavailable",
    ])
      .default("part_time")
      .notNull(),
    yearsOfExperience: mysqlEnum("yearsOfExperience", [
      "0-1",
      "1-2",
      "2-3",
      "3-5",
      "5+",
    ]),
    educationLevel: mysqlEnum("educationLevel", [
      "self_taught",
      "bootcamp",
      "associate",
      "bachelor",
      "master",
      "phd",
    ]),
    isStudent: boolean("isStudent").default(false).notNull(),
    institution: varchar("institution", { length: 255 }),
    isEmailVerified: boolean("isEmailVerified").default(false).notNull(),
    isStudentVerified: boolean("isStudentVerified").default(false).notNull(),
    isPortfolioVerified: boolean("isPortfolioVerified").default(false).notNull(),
    reputationScore: int("reputationScore").default(0).notNull(),
    trustScore: int("trustScore").default(0).notNull(),
    contributionScore: int("contributionScore").default(0).notNull(),
    responseRate: int("responseRate").default(100).notNull(),
    completionRate: int("completionRate").default(100).notNull(),
    totalProjects: int("totalProjects").default(0).notNull(),
    totalHours: int("totalHours").default(0).notNull(),
    creditBalance: int("creditBalance").default(50).notNull(), // Start with 50 credits
    qualityTier: mysqlEnum("qualityTier", [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ])
      .default("beginner")
      .notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("profile_userId_idx").on(table.userId),
    qualityTierIdx: index("profile_tier_idx").on(table.qualityTier),
    reputationIdx: index("profile_reputation_idx").on(table.reputationScore),
  })
);

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ============================================================
// SKILLS & CATEGORIES
// ============================================================

export const skillCategories = mysqlTable("skillCategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  baseCreditMultiplier: decimal("baseCreditMultiplier", {
    precision: 3,
    scale: 1,
  })
    .default("1.0")
    .notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SkillCategory = typeof skillCategories.$inferSelect;

export const skills = mysqlTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    categoryId: bigint("categoryId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    displayName: varchar("displayName", { length: 150 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("skill_category_idx").on(table.categoryId),
    nameIdx: index("skill_name_idx").on(table.name),
  })
);

export type Skill = typeof skills.$inferSelect;

// ============================================================
// USER SKILLS (Offered)
// ============================================================

export const userSkills = mysqlTable(
  "userSkills",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    skillId: bigint("skillId", { mode: "number", unsigned: true }).notNull(),
    proficiencyLevel: mysqlEnum("proficiencyLevel", [
      "learning",
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ])
      .default("beginner")
      .notNull(),
    yearsExperience: int("yearsExperience").default(0).notNull(),
    isVerified: boolean("isVerified").default(false).notNull(),
    endorsementCount: int("endorsementCount").default(0).notNull(),
    portfolioUrl: varchar("portfolioUrl", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userSkillUnique: uniqueIndex("user_skill_unique").on(
      table.userId,
      table.skillId
    ),
    userIdIdx: index("userSkill_userId_idx").on(table.userId),
    skillIdIdx: index("userSkill_skillId_idx").on(table.skillId),
  })
);

export type UserSkill = typeof userSkills.$inferSelect;

// ============================================================
// WANTED SKILLS (What user wants to learn/receive)
// ============================================================

export const wantedSkills = mysqlTable(
  "wantedSkills",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    skillId: bigint("skillId", { mode: "number", unsigned: true }).notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high"])
      .default("medium")
      .notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userWantedUnique: uniqueIndex("user_wanted_skill_unique").on(
      table.userId,
      table.skillId
    ),
    userIdIdx: index("wantedSkill_userId_idx").on(table.userId),
  })
);

export type WantedSkill = typeof wantedSkills.$inferSelect;

// ============================================================
// SWIPE / MATCHING
// ============================================================

export const swipeActions = mysqlTable(
  "swipeActions",
  {
    id: serial("id").primaryKey(),
    swiperUserId: bigint("swiperUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    swipedUserId: bigint("swipedUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    action: mysqlEnum("action", ["like", "pass", "superlike"]).notNull(),
    compatibilityScore: int("compatibilityScore").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    swipeUnique: uniqueIndex("swipe_unique").on(
      table.swiperUserId,
      table.swipedUserId
    ),
    swiperIdx: index("swipe_swiper_idx").on(table.swiperUserId),
    swipedIdx: index("swipe_swiped_idx").on(table.swipedUserId),
  })
);

export type SwipeAction = typeof swipeActions.$inferSelect;

export const matches = mysqlTable(
  "matches",
  {
    id: serial("id").primaryKey(),
    userAId: bigint("userAId", { mode: "number", unsigned: true }).notNull(),
    userBId: bigint("userBId", { mode: "number", unsigned: true }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "accepted",
      "declined",
      "expired",
    ])
      .default("pending")
      .notNull(),
    compatibilityScore: int("compatibilityScore").default(0).notNull(),
    matchedAt: timestamp("matchedAt").defaultNow().notNull(),
    acceptedAt: timestamp("acceptedAt"),
    createdContract: boolean("createdContract").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    matchUnique: uniqueIndex("match_unique").on(table.userAId, table.userBId),
    userAIdx: index("match_userA_idx").on(table.userAId),
    userBIdx: index("match_userB_idx").on(table.userBId),
  })
);

export type Match = typeof matches.$inferSelect;

// ============================================================
// SYNC CONTRACTS
// ============================================================

export const syncContracts = mysqlTable(
  "syncContracts",
  {
    id: serial("id").primaryKey(),
    matchId: bigint("matchId", { mode: "number", unsigned: true }).notNull(),
    initiatorUserId: bigint("initiatorUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    recipientUserId: bigint("recipientUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    requiredSkillId: bigint("requiredSkillId", {
      mode: "number",
      unsigned: true,
    }),
    offeredSkillId: bigint("offeredSkillId", {
      mode: "number",
      unsigned: true,
    }),
    status: mysqlEnum("status", [
      "draft",
      "pending_acceptance",
      "active",
      "milestone_review",
      "completed",
      "cancelled",
      "disputed",
      "rejected",
      "closed",
    ])
      .default("draft")
      .notNull(),
    estimatedHours: int("estimatedHours").default(0).notNull(),
    escrowCredits: int("escrowCredits").default(0).notNull(),
    complexity: mysqlEnum("complexity", ["simple", "moderate", "complex"])
      .default("simple")
      .notNull(),
    deadline: timestamp("deadline"),
    deliverables: json("deliverables").$type<string[]>(),
    checklist: json("checklist").$type<
      { text: string; completed: boolean }[]
    >(),
    milestones: json("milestones").$type<
      {
        title: string;
        description?: string;
        dueDate: string;
        status: string;
      }[]
    >(),
    finalRating: int("finalRating"),
    reviewComment: text("reviewComment"),
    completedAt: timestamp("completedAt"),
    cancelledAt: timestamp("cancelledAt"),
    disputeReason: text("disputeReason"),
    disputeStatus: mysqlEnum("disputeStatus", [
      "none",
      "open",
      "under_review",
      "resolved",
    ])
      .default("none")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    matchIdx: index("contract_match_idx").on(table.matchId),
    initiatorIdx: index("contract_initiator_idx").on(table.initiatorUserId),
    recipientIdx: index("contract_recipient_idx").on(table.recipientUserId),
    statusIdx: index("contract_status_idx").on(table.status),
  })
);

export type SyncContract = typeof syncContracts.$inferSelect;

// ============================================================
// WORKSPACE MESSAGES
// ============================================================

export const workspaceMessages = mysqlTable(
  "workspaceMessages",
  {
    id: serial("id").primaryKey(),
    contractId: bigint("contractId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    senderUserId: bigint("senderUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    content: text("content").notNull(),
    messageType: mysqlEnum("messageType", [
      "text",
      "file",
      "milestone",
      "system",
      "activity",
    ])
      .default("text")
      .notNull(),
    fileUrl: varchar("fileUrl", { length: 500 }),
    fileName: varchar("fileName", { length: 255 }),
    milestoneRef: int("milestoneRef"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    contractIdx: index("msg_contract_idx").on(table.contractId),
    senderIdx: index("msg_sender_idx").on(table.senderUserId),
    createdAtIdx: index("msg_createdAt_idx").on(table.createdAt),
  })
);

export type WorkspaceMessage = typeof workspaceMessages.$inferSelect;

// ============================================================
// WORKSPACE NOTES
// ============================================================

export const workspaceNotes = mysqlTable(
  "workspaceNotes",
  {
    id: serial("id").primaryKey(),
    contractId: bigint("contractId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    content: text("content").notNull(),
    lastEditedBy: bigint("lastEditedBy", {
      mode: "number",
      unsigned: true,
    }),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    contractIdx: uniqueIndex("notes_contract_unique").on(table.contractId),
  })
);

export type WorkspaceNote = typeof workspaceNotes.$inferSelect;

// ============================================================
// CREDIT TRANSACTIONS
// ============================================================

export const creditTransactions = mysqlTable(
  "creditTransactions",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    contractId: bigint("contractId", {
      mode: "number",
      unsigned: true,
    }),
    type: mysqlEnum("type", [
      "signup_bonus",
      "task_completion",
      "task_spend",
      "escrow_lock",
      "escrow_release",
      "escrow_refund",
      "referral",
      "penalty",
      "bonus",
      "purchase",
    ]).notNull(),
    amount: int("amount").notNull(),
    balanceAfter: int("balanceAfter").notNull(),
    description: varchar("description", { length: 255 }),
    relatedUserId: bigint("relatedUserId", {
      mode: "number",
      unsigned: true,
    }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("credit_user_idx").on(table.userId),
    contractIdx: index("credit_contract_idx").on(table.contractId),
    typeIdx: index("credit_type_idx").on(table.type),
    createdAtIdx: index("credit_createdAt_idx").on(table.createdAt),
  })
);

export type CreditTransaction = typeof creditTransactions.$inferSelect;

// ============================================================
// REVIEWS & RATINGS
// ============================================================

export const reviews = mysqlTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    contractId: bigint("contractId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    reviewerUserId: bigint("reviewerUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    revieweeUserId: bigint("revieweeUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    overallRating: int("overallRating").notNull(),
    communicationRating: int("communicationRating").notNull(),
    qualityRating: int("qualityRating").notNull(),
    timelinessRating: int("timelinessRating").notNull(),
    comment: text("comment"),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    contractUnique: uniqueIndex("review_contract_unique").on(
      table.contractId,
      table.reviewerUserId
    ),
    revieweeIdx: index("review_reviewee_idx").on(table.revieweeUserId),
    reviewerIdx: index("review_reviewer_idx").on(table.reviewerUserId),
  })
);

export type Review = typeof reviews.$inferSelect;

// ============================================================
// ENDORSEMENTS
// ============================================================

export const endorsements = mysqlTable(
  "endorsements",
  {
    id: serial("id").primaryKey(),
    endorserUserId: bigint("endorserUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    endorseeUserId: bigint("endorseeUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    userSkillId: bigint("userSkillId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    endorsementUnique: uniqueIndex("endorsement_unique").on(
      table.endorserUserId,
      table.userSkillId
    ),
    endorseeIdx: index("endorsement_user_idx").on(table.endorseeUserId),
  })
);

export type Endorsement = typeof endorsements.$inferSelect;

// ============================================================
// CONTRIBUTION RECORDS (Verified Proof-of-Work)
// ============================================================

export const contributionRecords = mysqlTable(
  "contributionRecords",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    contractId: bigint("contractId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    projectName: varchar("projectName", { length: 200 }),
    role: varchar("role", { length: 100 }),
    skillsUsed: json("skillsUsed").$type<string[]>(),
    techStack: json("techStack").$type<string[]>(),
    screenshots: json("screenshots").$type<string[]>(),
    githubUrl: varchar("githubUrl", { length: 255 }),
    liveUrl: varchar("liveUrl", { length: 255 }),
    figmaUrl: varchar("figmaUrl", { length: 255 }),
    hoursContributed: int("hoursContributed").default(0).notNull(),
    creditsEarned: int("creditsEarned").default(0).notNull(),
    milestonesCompleted: int("milestonesCompleted").default(0).notNull(),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    review: text("review"),
    rating: int("rating"),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("contrib_user_idx").on(table.userId),
    contractIdx: uniqueIndex("contrib_contract_unique").on(table.contractId),
  })
);

export type ContributionRecord = typeof contributionRecords.$inferSelect;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notifications = mysqlTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    type: mysqlEnum("type", [
      "match",
      "contract_request",
      "contract_accepted",
      "milestone_due",
      "contract_completed",
      "review_received",
      "endorsement",
      "credit_received",
      "message",
      "system",
      "tier_changed",
    ]).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message"),
    relatedId: bigint("relatedId", { mode: "number", unsigned: true }),
    relatedType: varchar("relatedType", { length: 50 }),
    isRead: boolean("isRead").default(false).notNull(),
    actionUrl: varchar("actionUrl", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("notif_user_idx").on(table.userId),
    unreadIdx: index("notif_unread_idx").on(table.userId, table.isRead),
    createdAtIdx: index("notif_createdAt_idx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;

// ============================================================
// DISPUTES
// ============================================================

export const disputes = mysqlTable(
  "disputes",
  {
    id: serial("id").primaryKey(),
    contractId: bigint("contractId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    reporterUserId: bigint("reporterUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    reportedUserId: bigint("reportedUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    reason: mysqlEnum("reason", [
      "no_show",
      "late_delivery",
      "poor_quality",
      "scope_creep",
      "communication",
      "fraud",
      "other",
    ]).notNull(),
    description: text("description").notNull(),
    evidence: json("evidence").$type<string[]>(),
    status: mysqlEnum("status", ["open", "under_review", "resolved", "dismissed"])
      .default("open")
      .notNull(),
    resolution: text("resolution"),
    resolvedBy: bigint("resolvedBy", { mode: "number", unsigned: true }),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    contractIdx: uniqueIndex("dispute_contract_unique").on(table.contractId),
    reporterIdx: index("dispute_reporter_idx").on(table.reporterUserId),
  })
);

export type Dispute = typeof disputes.$inferSelect;

// ============================================================
// ACTIVITY FEED
// ============================================================

export const activityFeed = mysqlTable(
  "activityFeed",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    actorUserId: bigint("actorUserId", {
      mode: "number",
      unsigned: true,
    }),
    type: mysqlEnum("type", [
      "joined",
      "skill_added",
      "match_made",
      "contract_started",
      "contract_completed",
      "review_received",
      "endorsement_received",
      "tier_promoted",
      "project_shared",
    ]).notNull(),
    description: text("description"),
    relatedId: bigint("relatedId", { mode: "number", unsigned: true }),
    relatedType: varchar("relatedType", { length: 50 }),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("activity_user_idx").on(table.userId),
    createdAtIdx: index("activity_createdAt_idx").on(table.createdAt),
  })
);

export type ActivityFeedItem = typeof activityFeed.$inferSelect;

// ============================================================
// BOOKMARKS / SAVED
// ============================================================

export const bookmarks = mysqlTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
    bookmarkedUserId: bigint("bookmarkedUserId", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    bookmarkUnique: uniqueIndex("bookmark_unique").on(
      table.userId,
      table.bookmarkedUserId
    ),
  })
);

export type Bookmark = typeof bookmarks.$inferSelect;

// ============================================================
// AUDIT LOGS
// ============================================================

export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number", unsigned: true }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entityType", { length: 50 }),
    entityId: bigint("entityId", { mode: "number", unsigned: true }),
    oldValue: json("oldValue"),
    newValue: json("newValue"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("audit_user_idx").on(table.userId),
    actionIdx: index("audit_action_idx").on(table.action),
    createdAtIdx: index("audit_createdAt_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
