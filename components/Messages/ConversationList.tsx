"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Message, Conversation } from "@/app/generated/prisma/client";
import { useSocket } from "../SocketProvider";
import { formatMessageTime } from "@/lib/dateUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations } from "@/app/actions/chat";

// Define the shape including relations
type ConversationWithDetails = Conversation & {
  participants: User[];
  messages: Message[];
  unreadCount: number;
};

interface ConversationListProps {
  initialConversations: ConversationWithDetails[];
  currentUser: User;
}

export default function ConversationList({
  initialConversations,
  currentUser,
}: ConversationListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    initialData: initialConversations,
    queryFn: () => getConversations(),
    staleTime: Infinity, // Prevent auto-refetching since we rely on sockets
  });

  const { socket, onlineUsers } = useSocket();

  // Sync with server updates (e.g. initial load or router.refresh)

  // Socket connection
  useEffect(() => {
    if (!socket) return;

    const joinRooms = () => {
      // Join all conversation rooms to listen for updates
      initialConversations.forEach((c) => {
        socket.emit("join", c.id);
      });
      // Also join our own user room if backend supports it for new chats
      socket.emit("join", currentUser.id);
    };

    // If already connected, join immediately
    if (socket.connected) {
      joinRooms();
    }

    // Also listen for connect event in case of reconnection
    socket.on("connect", joinRooms);

    const handleNewMessage = (newMessage: Message) => {
      console.log("ConversationList: Received newMessage", newMessage);
      queryClient.setQueryData<ConversationWithDetails[]>(
        ["conversations"],
        (oldData) => {
          if (!oldData) return [];

          const convoIndex = oldData.findIndex(
            (c) => c.id === newMessage.conversationId
          );
          console.log("ConversationList: Found convoIndex", convoIndex);

          if (convoIndex === -1) {
            console.log("ConversationList: Convo not found, refreshing");
            router.refresh();
            return oldData;
          }

          const updatedConvo = {
            ...oldData[convoIndex],
            messages: [newMessage],
            updatedAt: new Date(),
            // Increment unread count if it's not from us
            unreadCount:
              newMessage.userId !== currentUser.id
                ? (oldData[convoIndex].unreadCount || 0) + 1
                : oldData[convoIndex].unreadCount,
          };

          const otherConvos = oldData.filter(
            (c) => c.id !== newMessage.conversationId
          );

          console.log("ConversationList: Reordering conversations");
          return [updatedConvo, ...otherConvos];
        }
      );
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("connect", joinRooms);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, initialConversations, currentUser.id, router, queryClient]);

  return (
    <div className="w-full md:w-80 border-r border-border h-full flex flex-col bg-card/50">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold tracking-tight">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((convo) => {
              const otherParticipant = convo.participants.find(
                (participant) => participant.id !== currentUser.id
              );
              const lastMessage = convo.messages[0];
              const profileUrl = otherParticipant?.profileImage
                ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${otherParticipant.profileImage}`
                : null;

              return (
                <Link
                  key={convo.id}
                  href={`/messages/${convo.id}`}
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="relative h-10 w-10 shrink-0">
                    {profileUrl ? (
                      <Image
                        src={profileUrl}
                        alt={otherParticipant?.username || "User"}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-muted flex items-center justify-center border border-border">
                        <span className="text-sm font-medium text-muted-foreground">
                          {(
                            otherParticipant?.username?.[0] || "?"
                          ).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Online Dot */}
                    {otherParticipant &&
                      onlineUsers.has(otherParticipant.id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full ring-1 ring-background"></span>
                      )}

                    {/* Unread Pulse on Avatar - THE ORIGINAL WAY */}
                    {convo.unreadCount > 0 && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse pointer-events-none"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {otherParticipant?.name ||
                          otherParticipant?.username ||
                          "Unknown User"}
                      </span>

                      {lastMessage && (
                        <span
                          className={`text-[10px] ml-1 ${
                            convo.unreadCount > 0
                              ? "text-blue-400 font-bold"
                              : "text-muted-foreground"
                          }`}
                          suppressHydrationWarning
                        >
                          {formatMessageTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate ${
                        convo.unreadCount > 0
                          ? "text-white font-semibold"
                          : "text-muted-foreground opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      {lastMessage ? (
                        lastMessage.content ||
                        (lastMessage.imageUrl
                          ? "Sent an image"
                          : lastMessage.videoUrl
                          ? "Sent a video"
                          : "Message")
                      ) : (
                        <span className="italic">No messages</span>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
