import { NextRequest, NextResponse } from "next/server";
import { buildEmbedUrl, ContentType } from "@/lib/vimeus";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") as ContentType;
  const tmdb = searchParams.get("tmdb");
  const imdb = searchParams.get("imdb");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!type || (!tmdb && !imdb)) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const url = await buildEmbedUrl(
    type,
    { tmdb: tmdb ? Number(tmdb) : undefined, imdb: imdb ?? undefined },
    { season: season ? Number(season) : undefined, episode: episode ? Number(episode) : undefined }
  );

  return NextResponse.json({ url });
}
