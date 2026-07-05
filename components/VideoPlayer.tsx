"use client";

type Props = {
  embedUrl: string;
  season?: number;
  episode?: number;
  startedAt?: number;
  syncAt?: number; // when set/changed, forces iframe reload with elapsed time
};

function buildUrl(
  embedUrl: string,
  season?: number,
  episode?: number,
  startedAt?: number
): string {
  const url = new URL(embedUrl);
  if (season) url.searchParams.set("se", String(season));
  if (episode) url.searchParams.set("ep", String(episode));
  if (startedAt) {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    if (elapsed > 5) url.searchParams.set("t", String(elapsed));
  }
  url.searchParams.set("primary_color", "7c3aed");
  url.searchParams.set("autoplay", "1");
  return url.toString();
}

export default function VideoPlayer({ embedUrl, season, episode, startedAt, syncAt }: Props) {
  const src = buildUrl(embedUrl, season, episode, startedAt);
  // syncAt in key forces full iframe reload when host triggers sync
  const key = `${src}-${syncAt ?? 0}`;

  return (
    <iframe
      key={key}
      src={src}
      className="w-full h-full block"
      allowFullScreen
      referrerPolicy="origin"
      allow="autoplay; fullscreen"
    />
  );
}
