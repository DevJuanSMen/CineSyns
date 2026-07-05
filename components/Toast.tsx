"use client";
import { useEffect, useState } from "react";

export type ToastItem = { id: string; message: string; type?: "info" | "join" };

let listeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

export function showToast(message: string, type: ToastItem["type"] = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toasts));
  }, 4000);
}

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: ToastItem[]) => setItems([...t]);
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className="bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-full shadow-lg animate-fade-in"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
