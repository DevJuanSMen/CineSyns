"use client";
import { useEffect, useState } from "react";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ElapsedTimer({ startedAt }: { startedAt?: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <span className="text-zinc-400 text-xs font-mono bg-zinc-800 px-2 py-1 rounded-lg">
      ⏱ {formatTime(elapsed)}
    </span>
  );
}
