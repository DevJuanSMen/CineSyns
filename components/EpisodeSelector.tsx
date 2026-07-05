"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function EpisodeSelector({
  roomId,
  sessionId,
  currentSeason,
  currentEpisode,
}: {
  roomId: Id<"rooms">;
  sessionId: string;
  currentSeason: number;
  currentEpisode: number;
}) {
  const [jumping, setJumping] = useState(false);
  const [jumpSeason, setJumpSeason] = useState(currentSeason);
  const [jumpEpisode, setJumpEpisode] = useState(currentEpisode);

  const updateState = useMutation(api.videoState.update);

  const go = async (season: number, episode: number) => {
    const s = Math.max(1, season);
    const e = Math.max(1, episode);
    await updateState({ roomId, sessionId, isPlaying: true, season: s, episode: e });
    setJumpSeason(s);
    setJumpEpisode(e);
    setJumping(false);
  };

  const prev = () => {
    if (currentEpisode > 1) {
      go(currentSeason, currentEpisode - 1);
    } else if (currentSeason > 1) {
      go(currentSeason - 1, 1);
    }
  };

  const next = () => go(currentSeason, currentEpisode + 1);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={prev}
        disabled={currentSeason === 1 && currentEpisode === 1}
        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs rounded-lg transition"
      >
        ← Anterior
      </button>

      {jumping ? (
        <div className="flex items-center gap-1">
          <span className="text-zinc-500 text-xs">T</span>
          <input
            type="number"
            min={1}
            value={jumpSeason}
            onChange={(e) => setJumpSeason(Number(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && go(jumpSeason, jumpEpisode)}
            className="w-10 bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <span className="text-zinc-500 text-xs">E</span>
          <input
            type="number"
            min={1}
            value={jumpEpisode}
            onChange={(e) => setJumpEpisode(Number(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && go(jumpSeason, jumpEpisode)}
            className="w-10 bg-zinc-800 border border-zinc-600 rounded px-1.5 py-1 text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            onClick={() => go(jumpSeason, jumpEpisode)}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-2 py-1 rounded transition"
          >
            Ir
          </button>
          <button
            onClick={() => setJumping(false)}
            className="text-zinc-500 hover:text-white text-xs px-2 py-1 transition"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setJumpSeason(currentSeason); setJumpEpisode(currentEpisode); setJumping(true); }}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg transition font-mono"
        >
          T{currentSeason} · E{currentEpisode}
        </button>
      )}

      <button
        onClick={next}
        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-lg transition"
      >
        Siguiente →
      </button>
    </div>
  );
}
