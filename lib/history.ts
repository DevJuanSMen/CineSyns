export type HistoryEntry = {
  roomId: string;
  title: string;
  poster?: string;
  contentType: string;
  roomName: string;
  visitedAt: number;
};

const KEY = "cinesync_history";
const MAX = 10;

export function saveToHistory(entry: Omit<HistoryEntry, "visitedAt">) {
  if (typeof window === "undefined") return;
  const prev = getHistory().filter((h) => h.roomId !== entry.roomId);
  const next = [{ ...entry, visitedAt: Date.now() }, ...prev].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
