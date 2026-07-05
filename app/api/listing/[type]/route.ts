import { NextRequest, NextResponse } from "next/server";
import { fetchListing } from "@/lib/vimeus";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const allowed = ["movies", "series", "animes", "episodes"];
  if (!allowed.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const url = req.nextUrl;
  const queryParams: Record<string, string | number> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = isNaN(Number(value)) ? value : Number(value);
  });

  try {
    const data = await fetchListing(
      type as "movies" | "series" | "animes" | "episodes",
      queryParams
    );
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 502 }
    );
  }
}
