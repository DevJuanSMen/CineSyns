"use client";
import { useState } from "react";
import { setUsername } from "@/lib/session";

export default function UsernameModal({ onDone }: { onDone: (name: string) => void }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const name = value.trim();
    if (!name) return;
    setUsername(name);
    onDone(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Elige tu nombre</h2>
          <p className="text-zinc-400 text-sm">Así te verán los demás en la sala</p>
        </div>
        <input
          autoFocus
          type="text"
          maxLength={24}
          placeholder="Tu nombre..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
