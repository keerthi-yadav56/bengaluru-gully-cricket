import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const sendMessage = mutation({
  args: {
    subject: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || !user.uniqueId) {
      throw new Error("Not authenticated or missing unique ID");
    }

    return await ctx.db.insert("messages", {
      fromUserId: user._id,
      fromUserName: user.name || "Unknown User",
      fromUserUniqueId: user.uniqueId,
      subject: args.subject,
      content: args.content,
      isRead: false,
    });
  },
});

export const getAllMessages = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can view messages");
    }

    return await ctx.db
      .query("messages")
      .order("desc")
      .collect();
  },
});

export const markMessageAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can mark messages as read");
    }

    return await ctx.db.patch(args.messageId, {
      isRead: true,
    });
  },
});

export const respondToMessage = mutation({
  args: {
    messageId: v.id("messages"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can respond to messages");
    }

    return await ctx.db.patch(args.messageId, {
      adminResponse: args.response,
      respondedAt: new Date().toISOString(),
      isRead: true,
    });
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      return 0;
    }

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .collect();

    return unreadMessages.length;
  },
});
