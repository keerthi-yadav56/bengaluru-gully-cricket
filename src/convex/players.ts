import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createPlayer = mutation({
  args: {
    photo: v.optional(v.string()),
    age: v.number(),
    area: v.string(),
    battingHand: v.union(v.literal("right"), v.literal("left")),
    bowlingHand: v.union(v.literal("right"), v.literal("left")),
    additionalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check if player profile already exists
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingPlayer) {
      throw new Error("Player profile already exists");
    }

    return await ctx.db.insert("players", {
      userId: user._id,
      photo: args.photo,
      age: args.age,
      area: args.area,
      battingHand: args.battingHand,
      bowlingHand: args.bowlingHand,
      additionalInfo: args.additionalInfo,
      isActive: true,
    });
  },
});

export const getMyPlayer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    return await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const getAllPlayers = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();

    // Get user details for each player
    const playersWithUsers = await Promise.all(
      players.map(async (player) => {
        const user = await ctx.db.get(player.userId);
        return {
          ...player,
          user: user
            ? {
                name: user.name,
                uniqueId: user.uniqueId,
              }
            : null,
        };
      })
    );

    return playersWithUsers;
  },
});

export const updatePlayer = mutation({
  args: {
    playerId: v.id("players"),
    photo: v.optional(v.string()),
    age: v.number(),
    area: v.string(),
    battingHand: v.union(v.literal("right"), v.literal("left")),
    bowlingHand: v.union(v.literal("right"), v.literal("left")),
    additionalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const player = await ctx.db.get(args.playerId);
    if (!player || player.userId !== user._id) {
      throw new Error("Player not found or unauthorized");
    }

    return await ctx.db.patch(args.playerId, {
      photo: args.photo,
      age: args.age,
      area: args.area,
      battingHand: args.battingHand,
      bowlingHand: args.bowlingHand,
      additionalInfo: args.additionalInfo,
    });
  },
});