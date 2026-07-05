"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPanel({
  roomId,
  sessionId,
  username,
}: {
  roomId: Id<"rooms">;
  sessionId: string;
  username: string;
}) {
  const messages = useQuery(api.messages.list, { roomId });
  const send = useMutation(api.messages.send);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text;
    setText("");
    await send({ roomId, sessionId, username, text: msg });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-white font-semibold text-sm">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages?.map((msg) => (
          <div key={msg._id} className={`flex flex-col ${msg.sessionId === "system" ? "items-center" : ""}`}>
            {msg.sessionId === "system" ? (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                {msg.text}
              </span>
            ) : (
              <>
                <span
                  className={`text-xs font-semibold mb-0.5 ${
                    msg.sessionId === sessionId ? "text-violet-400" : "text-zinc-400"
                  }`}
                >
                  {msg.sessionId === sessionId ? "Tú" : msg.username}
                </span>
                <div
                  className={`text-sm px-3 py-2 rounded-2xl max-w-[85%] break-words ${
                    msg.sessionId === sessionId
                      ? "bg-violet-600 text-white self-end rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 self-start rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Escribe algo..."
          maxLength={500}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-sm transition"
        >
          →
        </button>
      </div>
    </div>
  );
}
