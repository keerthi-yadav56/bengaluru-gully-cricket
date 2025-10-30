"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const fetchLiveCricketMatches = action({
  args: {},
  handler: async (ctx) => {
    try {
      const apiKey = process.env.CRICKET_API_KEY || "d83691ff-171b-438b-a869-ede2168c5ef6";
      const response = await fetch(
        `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching cricket matches:", error);
      throw new Error(error?.message ?? "Failed to fetch cricket matches");
    }
  },
});

export const fetchMatchDetails = action({
  args: { matchId: v.string() },
  handler: async (ctx, args) => {
    try {
      const apiKey = process.env.CRICKET_API_KEY || "d83691ff-171b-438b-a869-ede2168c5ef6";
      const response = await fetch(
        `https://api.cricapi.com/v1/match_info?apikey=${apiKey}&id=${args.matchId}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching match details:", error);
      throw new Error(error?.message ?? "Failed to fetch match details");
    }
  },
});
