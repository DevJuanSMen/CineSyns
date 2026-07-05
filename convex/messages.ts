import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionId: v.string(),
    username: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.text.trim()) return;
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      sessionId: args.sessionId,
      username: args.username,
      text: args.text.trim(),
    });
  },
});

export const list = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    return ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .order("asc")
      .take(200);
  },
});
