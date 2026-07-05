import { NextRequest, NextResponse } from "next/server";

const TMDB_TOKEN = process.env.TMDB_API_KEY!;
const VIMEUS_API_KEY = process.env.VIMEUS_API_KEY!;
const TMDB_BASE = "https://api.themoviedb.org/3";
const VIMEUS_BASE = "https://vimeus.com";

// Check Vimeus episodes API for a tmdb_id — returns the base embed_url and content_type
async function getVimeusEmbed(
  tmdbId: number
): Promise<{ embed_url: string; content_type: "serie" | "anime" } | null> {
  try {
    const res = await fetch(
      `${VIMEUS_BASE}/api/listing/episodes?tmdb_id=${tmdbId}&page=1`,
      {
        headers: { "X-API-Key": VIMEUS_API_KEY },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const episode = data.data?.result?.[0];
    if (!episode?.embed_url) return null;

    // Strip se/ep from the episode URL to get the base series URL
    const url = new URL(episode.embed_url);
    url.searchParams.delete("se");
    url.searchParams.delete("ep");

    return {
      embed_url: url.toString(),
      content_type: episode.parent_type === "anime" ? "anime" : "serie",
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  if (!TMDB_TOKEN) return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 503 });

  const res = await fetch(
    `${TMDB_BASE}/search/multi?query=${encodeURIComponent(q)}&language=es-ES&include_adult=false&page=1`,
    { headers: { Authorization: `Bearer ${TMDB_TOKEN}` }, next: { revalidate: 60 } }
  );
  if (!res.ok) return NextResponse.json({ results: [] });

  const data = await res.json();
  const candidates = (data.results ?? [])
    .filter((item: { media_type: string }) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 20);

  // For TV content: verify against Vimeus and get the correct embed_url
  // For movies: use Vimeus movie endpoint with cached view_key
  const results = await Promise.all(
    candidates.map(async (item: {
      id: number;
      media_type: string;
      title?: string;
      name?: string;
      poster_path?: string;
      backdrop_path?: string;
    }) => {
      if (item.media_type === "tv") {
        const vimeus = await getVimeusEmbed(item.id);
        if (!vimeus) return null; // Not in Vimeus, skip
        return {
          tmdb_id: item.id,
          title: item.name ?? "Sin título",
          poster: item.poster_path ?? null,
          backdrop: item.backdrop_path ?? null,
          content_type: vimeus.content_type,
          embed_url: vimeus.embed_url,
          quality: "FULL HD",
        };
      } else {
        // Movie — fetch from movies listing to try to get a working embed_url
        // We can't filter movies by tmdb_id, so build the URL using the episodes view_key as fallback
        // Most movies should work since Vimeus accepts tmdb_id directly on their /e/movie endpoint
        const vimeus = await getVimeusEmbed(item.id); // might return null for movies
        return {
          tmdb_id: item.id,
          title: item.title ?? "Sin título",
          poster: item.poster_path ?? null,
          backdrop: item.backdrop_path ?? null,
          content_type: "movie" as const,
          embed_url: vimeus?.embed_url ?? `${VIMEUS_BASE}/e/movie?tmdb=${item.id}&view_key=${process.env.VIMEUS_VIEW_KEY}`,
          quality: null,
        };
      }
    })
  );

  return NextResponse.json({ results: results.filter(Boolean) });
}
