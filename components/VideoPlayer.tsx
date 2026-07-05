"use client";

type Props = {
  embedUrl: string;
  season?: number;
  episode?: number;
  startedAt?: number; // timestamp when host started — used to sync late joiners
};

function buildUrl(embedUrl: string, season?: number, episode?: number, startedAt?: number): string {
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

export default function VideoPlayer({ embedUrl, season, episode, startedAt }: Props) {
  const src = buildUrl(embedUrl, season, episode, startedAt);

  return (
    <iframe
      key={src}
      src={src}
      className="w-full h-full block"
      allowFullScreen
      referrerPolicy="origin"
      allow="autoplay; fullscreen"
    />
  );
}
