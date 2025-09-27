import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  PLAYER: "player",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.PLAYER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // BGC specific fields
      fullName: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      uniqueId: v.optional(v.string()), // BGC001, BGC002, etc.
      isPhoneVerified: v.optional(v.boolean()),
    }).index("email", ["email"]) // index for the email. do not remove or modify
      .index("by_unique_id", ["uniqueId"])
      .index("by_phone", ["phoneNumber"]),

    // Player profiles
    players: defineTable({
      userId: v.id("users"),
      photo: v.optional(v.string()),
      age: v.number(),
      area: v.string(), // Area of residence in Bengaluru
      battingHand: v.union(v.literal("right"), v.literal("left")),
      bowlingHand: v.union(v.literal("right"), v.literal("left")),
      additionalInfo: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_is_active", ["isActive"]),

    // Tournaments
    tournaments: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      maxTeams: v.number(),
      entryFeePerPerson: v.number(),
      rewards: v.string(),
      groundPhotos: v.optional(v.array(v.string())),
      trophyPhotos: v.optional(v.array(v.string())),
      date: v.string(),
      location: v.string(),
      mapLink: v.optional(v.string()),
      oversPerMatch: v.number(),
      upiId: v.string(), // For payment
      status: v.union(
        v.literal("upcoming"),
        v.literal("ongoing"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      registrationDeadline: v.string(),
      createdBy: v.id("users"), // Admin who created it
    }).index("by_status", ["status"])
      .index("by_created_by", ["createdBy"]),

    // Teams
    teams: defineTable({
      name: v.string(),
      ownerId: v.id("users"),
      ownerUniqueId: v.string(),
      players: v.array(
        v.object({
          playerId: v.id("players"),
          playerName: v.string(),
          playerUniqueId: v.string(),
        })
      ),
      tournamentId: v.id("tournaments"),
      registrationDate: v.string(),
      paymentStatus: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("verified")
      ),
    })
      .index("by_owner", ["ownerId"])
      .index("by_tournament_and_owner", ["tournamentId", "ownerId"]),

    // Messages from users to admin
    messages: defineTable({
      fromUserId: v.id("users"),
      fromUserName: v.string(),
      fromUserUniqueId: v.string(),
      subject: v.string(),
      content: v.string(),
      isRead: v.boolean(),
      adminResponse: v.optional(v.string()),
      respondedAt: v.optional(v.string()),
    }).index("by_from_user", ["fromUserId"])
      .index("by_read_status", ["isRead"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;