"use client";

import { useSocket } from "@/components/SocketProvider";
import { cn } from "@/lib/utils";

export function UnreadBadge({ className }: { className?: string }) {
  const { unreadCount } = useSocket();

  if (unreadCount === 0) return null;

  return (
    <span
      className={cn(
        "absolute z-50 -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background",
        className
      )}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
