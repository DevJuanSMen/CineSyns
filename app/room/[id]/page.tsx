"use client";
import { useEffect, useState, useCallback, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import ChatPanel from "@/components/ChatPanel";
import EpisodeSelector from "@/components/EpisodeSelector";
import ParticipantList from "@/components/ParticipantList";
import UsernameModal from "@/components/UsernameModal";
import { getSessionId, getUsername } from "@/lib/session";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [sessionId, setSessionId] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const roomId = id as Id<"rooms">;
  const room = useQuery(api.rooms.get, { roomId });
  const videoState = useQuery(api.videoState.get, { roomId });

  const join = useMutation(api.rooms.join);
  const ping = useMutation(api.rooms.ping);

  useEffect(() => {
    const sid = getSessionId();
    const uname = getUsername();
    setSessionId(sid);
    setUsername(uname || null);
  }, []);

  const handleJoin = useCallback(
    async (name: string) => {
      if (!name || !sessionId) return;
      await join({ roomId, sessionId, username: name });
      setJoined(true);
    },
    [join, roomId, sessionId]
  );

  useEffect(() => {
    if (username && sessionId && !joined) {
      handleJoin(username);
    }
  }, [username, sessionId, joined, handleJoin]);

  // Heartbeat to keep participant "online"
  useEffect(() => {
    if (!joined || !sessionId) return;
    const id = setInterval(() => ping({ roomId, sessionId }), 15_000);
    return () => clearInterval(id);
  }, [joined, sessionId, ping, roomId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (room === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg">Sala no encontrada</p>
        <button
          onClick={() => router.push("/")}
          className="text-violet-400 hover:text-violet-300 text-sm transition"
        >
          ← Volver al inicio
        </button>
      </div>
    );
  }

  if (!username) {
    return (
      <UsernameModal
        onDone={(name) => {
          setUsername(name);
          handleJoin(name);
        }}
      />
    );
  }

  const isHost = sessionId === room.hostSessionId;
  const isSeriesLike = room.contentType === "serie" || room.contentType === "anime";
  const currentSeason = videoState?.season ?? room.season;
  const currentEpisode = videoState?.episode ?? room.episode;

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="text-zinc-400 hover:text-white transition text-sm"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-white font-semibold text-sm truncate">{room.name}</h1>
            <span className="text-zinc-500 text-xs">·</span>
            <span className="text-zinc-400 text-xs truncate">{room.title}</span>
            {isSeriesLike && currentSeason && currentEpisode && (
              <>
                <span className="text-zinc-500 text-xs">·</span>
                <span className="text-violet-400 text-xs">
                  T{currentSeason}E{currentEpisode}
                </span>
              </>
            )}
            {isHost && (
              <span className="text-xs bg-violet-900/50 text-violet-300 border border-violet-700 px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
          </div>
        </div>
        <button
          onClick={copyLink}
          className="flex-shrink-0 flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
        >
          {copied ? "✓ Copiado" : "Invitar"}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video fills remaining height */}
          <div className="flex-1 min-h-0 bg-black">
            <VideoPlayer
              embedUrl={room.embedUrl}
              season={currentSeason}
              episode={currentEpisode}
            />
          </div>

          {/* Controls bar — always visible below video */}
          <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-2.5">
            <ParticipantList roomId={roomId} hostSessionId={room.hostSessionId} />

            {isSeriesLike && isHost && (
              <EpisodeSelector
                roomId={roomId}
                sessionId={sessionId}
                currentSeason={currentSeason ?? 1}
                currentEpisode={currentEpisode ?? 1}
              />
            )}

            {isSeriesLike && !isHost && (
              <p className="text-zinc-500 text-xs font-mono">
                T{currentSeason} · E{currentEpisode} — el host controla la navegación
              </p>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        <div className="w-72 flex-shrink-0 hidden md:flex flex-col">
          <ChatPanel roomId={roomId} sessionId={sessionId} username={username} />
        </div>
      </div>
    </div>
  );
}
