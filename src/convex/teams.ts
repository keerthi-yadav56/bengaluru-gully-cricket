import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const registerTeam = mutation({
  args: {
    teamName: v.string(),
    tournamentId: v.id("tournaments"),
    players: v.array(
      v.object({
        playerId: v.id("players"),
        playerName: v.string(),
        playerUniqueId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || !user.uniqueId) {
      throw new Error("Not authenticated or missing unique ID");
    }

    // Check if tournament exists and is accepting registrations
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament || tournament.status !== "upcoming") {
      throw new Error("Tournament not available for registration");
    }

    // Check if user already registered a team for this tournament (use composite index)
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_tournament_and_owner", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("ownerId", user._id)
      )
      .first();

    if (existingTeam) {
      throw new Error("You have already registered a team for this tournament");
    }

    // Check current number of registered teams for this tournament
    const registeredTeams = await ctx.db
      .query("teams")
      .withIndex("by_tournament_and_owner", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    if (registeredTeams.length >= tournament.maxTeams) {
      throw new Error("Tournament is full");
    }

    return await ctx.db.insert("teams", {
      name: args.teamName,
      ownerId: user._id,
      ownerUniqueId: user.uniqueId,
      players: args.players,
      tournamentId: args.tournamentId,
      registrationDate: new Date().toISOString(),
      paymentStatus: "pending" as const,
    });
  },
});

export const getMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const teams = await ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Get tournament details for each team
    const teamsWithTournaments = await Promise.all(
      teams.map(async (team) => {
        const tournament = await ctx.db.get(team.tournamentId);
        return {
          ...team,
          tournament,
        };
      })
    );

    return teamsWithTournaments;
  },
});

export const getTeamsByTournament = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_tournament_and_owner", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
  },
});

export const updatePaymentStatus = mutation({
  args: {
    teamId: v.id("teams"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("verified")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update payment status");
    }

    return await ctx.db.patch(args.teamId, {
      paymentStatus: args.status,
    });
  },
});