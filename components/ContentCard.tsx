"use client";
import Image from "next/image";
import { tmdbImage } from "@/lib/vimeus";

export type ContentItem = {
  tmdb_id: number;
  imdb_id?: string;
  title: string;
  poster?: string;
  backdrop?: string;
  embed_url: string;
  quality?: string;
  content_type: "movie" | "serie" | "anime"; // injected client-side from active tab
};

export default function ContentCard({
  item,
  onClick,
}: {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
}) {
  const posterUrl = item.poster
    ? tmdbImage(item.poster, "w300")
    : null;

  return (
    <button
      onClick={() => onClick(item)}
      className="group relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 hover:border-violet-500 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500"
    >
      <div className="aspect-[2/3] w-full relative bg-zinc-700">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
            loading="eager"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-4xl">
            🎬
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-xs font-semibold bg-violet-600 px-2 py-1 rounded-full">
            + Crear sala
          </span>
        </div>
      </div>
      <div className="p-2">
        <p className="text-white text-xs font-medium truncate">{item.title}</p>
        {item.quality && (
          <p className="text-zinc-400 text-xs">{item.quality}</p>
        )}
      </div>
    </button>
  );
}
