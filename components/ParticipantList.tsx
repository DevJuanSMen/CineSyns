"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ParticipantList({
  roomId,
  hostSessionId,
}: {
  roomId: Id<"rooms">;
  hostSessionId: string;
}) {
  const participants = useQuery(api.rooms.listParticipants, { roomId });

  if (!participants?.length) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {participants.map((p) => (
        <div
          key={p._id}
          className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-2.5 py-1"
          title={p.username}
        >
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-white text-xs truncate max-w-[80px]">
            {p.username}
          </span>
          {p.sessionId === hostSessionId && (
            <span className="text-violet-400 text-xs">★</span>
          )}
        </div>
      ))}
    </div>
  );
}
