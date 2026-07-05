"use client";
import { useEffect } from "react";
import ChatPanel from "./ChatPanel";
import { Id } from "@/convex/_generated/dataModel";

export default function MobileChatDrawer({
  open,
  onClose,
  roomId,
  sessionId,
  username,
}: {
  open: boolean;
  onClose: () => void;
  roomId: Id<"rooms">;
  sessionId: string;
  username: string;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 h-[70vh] rounded-t-2xl overflow-hidden flex flex-col transition-transform duration-300 md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <ChatPanel roomId={roomId} sessionId={sessionId} username={username} />
      </div>
    </>
  );
}
