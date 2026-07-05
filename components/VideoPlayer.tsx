"use client";

type Props = {
  embedUrl: string;
  season?: number;
  episode?: number;
};

function buildUrl(embedUrl: string, season?: number, episode?: number): string {
  const url = new URL(embedUrl);
  if (season) url.searchParams.set("se", String(season));
  if (episode) url.searchParams.set("ep", String(episode));
  // CineSync branding — violet accent, custom theme
  url.searchParams.set("primary_color", "7c3aed");
  url.searchParams.set("autoplay", "1");
  return url.toString();
}

export default function VideoPlayer({ embedUrl, season, episode }: Props) {
  const src = buildUrl(embedUrl, season, episode);

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
