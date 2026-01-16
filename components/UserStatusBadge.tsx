"use client";

import { useSocket } from "@/components/SocketProvider";

interface UserStatusBadgeProps {
  userId: string;
  lastSeen?: Date | null;
}

export default function UserStatusBadge({
  userId,
  lastSeen,
}: UserStatusBadgeProps) {
  const { onlineUsers, lastSeenUpdates } = useSocket();
  const isOnline = onlineUsers.has(userId);
  // console.log(`UserStatusBadge for ${userId}: isOnline=${isOnline}, users=${onlineUsers.size}`);

  // Use real-time last seen if available, otherwise fall back to DB value
  const resolvedLastSeen = lastSeenUpdates.get(userId) || lastSeen;

  const getLastSeenText = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    // If less than 1 minute
    if (diff < 60000) return "Just now";

    // If less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }

    // If less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    return new Date(date).toLocaleDateString();
  };

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full w-fit">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-green-500 text-xs font-semibold">Online</span>
      </div>
    );
  }

  if (resolvedLastSeen) {
    return (
      <span className="text-muted-foreground text-sm">
        Last seen {getLastSeenText(new Date(resolvedLastSeen))}
      </span>
    );
  }

  return <span className="text-muted-foreground text-sm">Offline</span>;
}
