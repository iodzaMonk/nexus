"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSocket } from "../SocketProvider";
import { formatLastSeen } from "@/lib/dateUtils";

interface ConversationHeaderProps {
  participant:
    | {
        id: string;
        username: string;
        name: string | null;
        profileImage: string | null;
        lastSeen?: Date | null;
      }
    | undefined;
}

export function ConversationHeader({ participant }: ConversationHeaderProps) {
  const { onlineUsers, lastSeenUpdates } = useSocket();

  const profileUrl = participant?.profileImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${participant.profileImage}`
    : null;

  const isOnline = participant ? onlineUsers.has(participant.id) : false;
  // Use real-time last seen if available, otherwise fall back to DB value
  const lastSeen = participant
    ? lastSeenUpdates.get(participant.id) || participant.lastSeen
    : null;

  return (
    <div className="h-16 border-b border-border flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3 w-full">
        {/* Mobile Back Button */}
        <Link
          href="/messages"
          className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Profile Image - wrap in link to profile optional - NOW ENABLED */}
        <Link
          href={`/profile/${participant?.username}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative h-8 w-8 shrink-0">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={participant?.username || "User"}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-muted flex items-center justify-center border border-border">
                <span className="text-xs font-medium text-muted-foreground">
                  {(participant?.username?.[0] || "?").toUpperCase()}
                </span>
              </div>
            )}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full ring-1 ring-background"></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground leading-none">
              {participant?.name || participant?.username}
            </span>
            {participant && (
              <span className="text-xs text-muted-foreground font-normal">
                {isOnline
                  ? "Online"
                  : lastSeen
                  ? `Last seen ${formatLastSeen(new Date(lastSeen))}`
                  : "Offline"}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
