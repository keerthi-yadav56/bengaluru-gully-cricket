import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createTournament = mutation({
  args: {
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
    upiId: v.string(),
    registrationDeadline: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create tournaments");
    }

    return await ctx.db.insert("tournaments", {
      ...args,
      status: "upcoming" as const,
      createdBy: user._id,
    });
  },
});

export const getAllTournaments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tournaments")
      .withIndex("by_status", (q) => q.eq("status", "upcoming"))
      .collect();
  },
});

export const getTournamentById = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tournamentId);
  },
});

export const getMyTournaments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      return [];
    }

    return await ctx.db
      .query("tournaments")
      .withIndex("by_created_by", (q) => q.eq("createdBy", user._id))
      .collect();
  },
});

export const updateTournamentStatus = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    status: v.union(
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update tournament status");
    }

    return await ctx.db.patch(args.tournamentId, {
      status: args.status,
    });
  },
});
