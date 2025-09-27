import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const completeUserProfile = mutation({
  args: {
    fullName: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Generate unique ID using index (BGC001, BGC002, etc.)
    const latestWithId = await ctx.db
      .query("users")
      .withIndex("by_unique_id")
      .order("desc")
      .first();

    const lastNum = latestWithId?.uniqueId
      ? parseInt(String(latestWithId.uniqueId).replace(/^BGC/, ""), 10)
      : 0;

    const uniqueId = `BGC${String((isNaN(lastNum) ? 0 : lastNum) + 1).padStart(3, "0")}`;

    return await ctx.db.patch(user._id, {
      name: args.fullName,
      fullName: args.fullName,
      phoneNumber: args.phoneNumber,
      uniqueId,
      role: "player" as const,
      isPhoneVerified: false,
    });
  },
});

export const verifyPhone = mutation({
  args: {
    phoneNumber: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // In a real app, you'd verify the OTP with a service like Twilio
    // For now, we'll accept any 6-digit OTP
    if (args.otp.length !== 6 || !/^\d{6}$/.test(args.otp)) {
      throw new Error("Invalid OTP format");
    }

    return await ctx.db.patch(user._id, {
      isPhoneVerified: true,
    });
  },
});

export const makeAdmin = mutation({
  args: {
    userId: v.id("users"),
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real app, you'd have a secure way to verify admin credentials
    // For demo purposes, using a simple password check
    if (args.adminPassword !== "BGC_ADMIN_2024") {
      throw new Error("Invalid admin password");
    }

    return await ctx.db.patch(args.userId, {
      role: "admin" as const,
    });
  },
});