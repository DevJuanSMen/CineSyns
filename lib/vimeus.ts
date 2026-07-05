const BASE = "https://vimeus.com";
const API_KEY = process.env.VIMEUS_API_KEY!;

export type ContentType = "movie" | "serie" | "anime";

export async function fetchListing(
  type: "movies" | "series" | "animes" | "episodes",
  params: Record<string, string | number> = {}
) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  );
  const res = await fetch(`${BASE}/api/listing/${type}?${qs}`, {
    headers: { "X-API-Key": API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Vimeus API error: ${res.status}`);
  return res.json();
}

export async function buildEmbedUrl(
  type: ContentType,
  id: { tmdb?: number; imdb?: string },
  opts?: { season?: number; episode?: number }
): Promise<string> {
  // Get the working view_key from a real listing response
  const res = await fetchListing("movies", { page: 1 });
  const viewKey =
    (() => {
      try {
        const url = new URL(res.data?.result?.[0]?.embed_url ?? "");
        return url.searchParams.get("view_key") ?? process.env.VIMEUS_VIEW_KEY!;
      } catch {
        return process.env.VIMEUS_VIEW_KEY!;
      }
    })();

  const params = new URLSearchParams({ view_key: viewKey });
  if (id.tmdb) params.set("tmdb", String(id.tmdb));
  else if (id.imdb) params.set("imdb", id.imdb);
  if (opts?.season) params.set("se", String(opts.season));
  if (opts?.episode) params.set("ep", String(opts.episode));
  return `${BASE}/e/${type}?${params.toString()}`;
}

export function tmdbImage(path: string, size = "w500") {
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
