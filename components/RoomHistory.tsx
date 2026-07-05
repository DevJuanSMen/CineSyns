"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory, HistoryEntry } from "@/lib/history";
import { tmdbImage } from "@/lib/vimeus";

export default function RoomHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (!history.length) return null;

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora mismo";
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    return `Hace ${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="space-y-3">
      <h2 className="text-white font-semibold text-sm">Salas recientes</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {history.map((entry) => (
          <button
            key={entry.roomId}
            onClick={() => router.push(`/room/${entry.roomId}`)}
            className="flex-shrink-0 w-36 group rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-violet-500 transition text-left"
          >
            <div className="relative h-24 bg-zinc-800">
              {entry.poster ? (
                <img
                  src={tmdbImage(entry.poster, "w300")}
                  alt={entry.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
              <span className="absolute bottom-1.5 left-2 text-white text-xs font-medium truncate max-w-[120px]">
                {entry.title}
              </span>
            </div>
            <div className="px-2.5 py-2">
              <p className="text-zinc-300 text-xs truncate font-medium">{entry.roomName}</p>
              <p className="text-zinc-500 text-xs">{timeAgo(entry.visitedAt)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
