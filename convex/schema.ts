import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    name: v.string(),
    contentType: v.union(v.literal("movie"), v.literal("serie"), v.literal("anime")),
    title: v.string(),
    poster: v.optional(v.string()),
    embedUrl: v.string(),
    season: v.optional(v.number()),
    episode: v.optional(v.number()),
    hostSessionId: v.string(),
  }),

  participants: defineTable({
    roomId: v.id("rooms"),
    sessionId: v.string(),
    username: v.string(),
    lastSeen: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_session", ["roomId", "sessionId"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    sessionId: v.string(),
    username: v.string(),
    text: v.string(),
  }).index("by_room", ["roomId"]),

  videoState: defineTable({
    roomId: v.id("rooms"),
    isPlaying: v.boolean(),
    episode: v.optional(v.number()),
    season: v.optional(v.number()),
    startedAt: v.optional(v.number()), // timestamp when current episode/movie started
    updatedBy: v.string(),
    updatedAt: v.number(),
  }).index("by_room", ["roomId"]),
});
