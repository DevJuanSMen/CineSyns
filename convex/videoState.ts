import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sync = mutation({
  args: { roomId: v.id("rooms"), sessionId: v.string() },
  handler: async (ctx, { roomId, sessionId }) => {
    const room = await ctx.db.get(roomId);
    if (!room || room.hostSessionId !== sessionId) return;

    const state = await ctx.db
      .query("videoState")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .unique();
    if (!state) return;

    await ctx.db.patch(state._id, { syncAt: Date.now() });

    await ctx.db.insert("messages", {
      roomId,
      sessionId: "system",
      username: "Sistema",
      text: "🔄 El host sincronizó la reproducción",
    });
  },
});

export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    return ctx.db
      .query("videoState")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .unique();
  },
});

export const update = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionId: v.string(),
    isPlaying: v.boolean(),
    season: v.optional(v.number()),
    episode: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.hostSessionId !== args.sessionId) return;

    const state = await ctx.db
      .query("videoState")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .unique();

    const episodeChanged =
      state && (state.season !== args.season || state.episode !== args.episode);

    const patch = {
      isPlaying: args.isPlaying,
      season: args.season,
      episode: args.episode,
      startedAt: episodeChanged || !state ? Date.now() : state.startedAt,
      updatedBy: args.sessionId,
      updatedAt: Date.now(),
    };

    if (state) {
      await ctx.db.patch(state._id, patch);
    } else {
      await ctx.db.insert("videoState", { roomId: args.roomId, ...patch });
    }

    if (episodeChanged) {
      await ctx.db.insert("messages", {
        roomId: args.roomId,
        sessionId: "system",
        username: "Sistema",
        text: `📺 El host cambió a T${args.season}E${args.episode}`,
      });
    }
  },
});
