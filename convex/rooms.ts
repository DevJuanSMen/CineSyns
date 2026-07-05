import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    contentType: v.union(v.literal("movie"), v.literal("serie"), v.literal("anime")),
    title: v.string(),
    poster: v.optional(v.string()),
    embedUrl: v.string(),
    season: v.optional(v.number()),
    episode: v.optional(v.number()),
    hostSessionId: v.string(),
    hostUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      contentType: args.contentType,
      title: args.title,
      poster: args.poster,
      embedUrl: args.embedUrl,
      season: args.season,
      episode: args.episode,
      hostSessionId: args.hostSessionId,
    });

    await ctx.db.insert("participants", {
      roomId,
      sessionId: args.hostSessionId,
      username: args.hostUsername,
      lastSeen: Date.now(),
    });

    await ctx.db.insert("videoState", {
      roomId,
      isPlaying: false,
      season: args.season,
      episode: args.episode,
      updatedBy: args.hostSessionId,
      updatedAt: Date.now(),
    });

    return roomId;
  },
});

export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    return ctx.db.get(roomId);
  },
});

export const join = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, { roomId, sessionId, username }) => {
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_room_session", (q) =>
        q.eq("roomId", roomId).eq("sessionId", sessionId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now(), username });
    } else {
      await ctx.db.insert("participants", {
        roomId,
        sessionId,
        username,
        lastSeen: Date.now(),
      });
    }
  },
});

export const ping = mutation({
  args: { roomId: v.id("rooms"), sessionId: v.string() },
  handler: async (ctx, { roomId, sessionId }) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_room_session", (q) =>
        q.eq("roomId", roomId).eq("sessionId", sessionId)
      )
      .unique();
    if (participant) {
      await ctx.db.patch(participant._id, { lastSeen: Date.now() });
    }
  },
});

export const listParticipants = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    const cutoff = Date.now() - 30_000;
    const all = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
    return all.filter((p) => p.lastSeen >= cutoff);
  },
});
