"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ContentItem } from "./ContentCard";
import { getSessionId } from "@/lib/session";
import { tmdbImage } from "@/lib/vimeus";
import Image from "next/image";

export default function CreateRoomModal({
  item,
  username,
  onClose,
  onCreated,
}: {
  item: ContentItem;
  username: string;
  onClose: () => void;
  onCreated: (roomId: string) => void;
}) {
  const [roomName, setRoomName] = useState(`Sala de ${username}`);
  const [loading, setLoading] = useState(false);

  const createRoom = useMutation(api.rooms.create);
  const isSeriesLike = item.content_type === "serie" || item.content_type === "anime";
  const posterUrl = item.poster ? tmdbImage(item.poster, "w200") : null;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const roomId = await createRoom({
        name: roomName.trim() || `Sala de ${username}`,
        contentType: item.content_type,
        title: item.title,
        poster: item.poster,
        embedUrl: item.embed_url,
        // Always start at T1E1 for series; host navigates from inside the room
        season: isSeriesLike ? 1 : undefined,
        episode: isSeriesLike ? 1 : undefined,
        hostSessionId: getSessionId(),
        hostUsername: username,
      });
      onCreated(roomId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md space-y-5">
        <div className="flex gap-4">
          {posterUrl && (
            <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={posterUrl} alt={item.title} fill sizes="64px" className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-lg leading-tight">{item.title}</h2>
            <span className="text-zinc-400 text-sm capitalize">{item.content_type}</span>
            {isSeriesLike && (
              <p className="text-zinc-500 text-xs mt-1">Arranca en T1E1 · puedes navegar desde la sala</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-zinc-400 text-xs mb-1 block">Nombre de la sala</label>
          <input
            autoFocus
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            maxLength={40}
            className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition"
          >
            {loading ? "Creando..." : "Crear sala"}
          </button>
        </div>
      </div>
    </div>
  );
}
