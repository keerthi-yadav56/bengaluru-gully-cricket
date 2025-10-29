import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createMatch = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    team1Id: v.id("teams"),
    team2Id: v.id("teams"),
    team1Name: v.string(),
    team2Name: v.string(),
    matchDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create matches");
    }

    return await ctx.db.insert("matches", {
      ...args,
      status: "upcoming" as const,
      updatedBy: user._id,
    });
  },
});

export const updateMatchScore = mutation({
  args: {
    matchId: v.id("matches"),
    team1Score: v.optional(v.string()),
    team2Score: v.optional(v.string()),
    team1Overs: v.optional(v.string()),
    team2Overs: v.optional(v.string()),
    currentBatting: v.optional(v.union(v.literal("team1"), v.literal("team2"))),
    status: v.optional(v.union(
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("completed")
    )),
    winner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update match scores");
    }

    const { matchId, ...updates } = args;
    return await ctx.db.patch(matchId, {
      ...updates,
      updatedBy: user._id,
    });
  },
});

export const getMatchesByTournament = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
  },
});

export const getLiveMatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();
  },
});

export const getMatchById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.matchId);
  },
});
