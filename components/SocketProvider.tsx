"use client";
import { useEffect, createContext, useContext, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Message, User } from "@/app/generated/prisma/client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  lastSeenUpdates: Map<string, Date>;
  unreadCount: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  lastSeenUpdates: new Map(),
  unreadCount: 0,
});

export default function SocketProvider({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser?: { id: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // Keep ref in sync without triggering socket re-connects
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const processedMessageIds = useRef(new Set<string>());

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenUpdates, setLastSeenUpdates] = useState<Map<string, Date>>(
    new Map()
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log("SocketProvider: Initializing socket...");
    // Auto-detects URL, but forces WSS if page is HTTPS
    const socketInstance = io(undefined, {
      secure: true,
      rejectUnauthorized: false, // In case of self-signed dev certs, though we use LetsEncrypt
      transports: ["websocket", "polling"], // Try websocket first
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log(
        "SocketProvider: Global Socket Connected:",
        socketInstance.id
      );
      if (currentUser?.id) {
        socketInstance.emit("register", currentUser.id);
      } else {
        // No user to register
      }
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      // Handle connection error
    });

    // Presence events
    socketInstance.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    socketInstance.on("userOnline", (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    socketInstance.on(
      "userOffline",
      ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        setLastSeenUpdates((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, new Date(lastSeen));
          return newMap;
        });
      }
    );

    socketInstance.on("newMessage", (message: Message & { sender: User }) => {
      // Deduplicate: If we already processed this message ID, ignore it
      if (processedMessageIds.current.has(message.id)) return;
      processedMessageIds.current.add(message.id);
      setTimeout(() => processedMessageIds.current.delete(message.id), 5000);

      // Only increment if message is not from me
      if (currentUser?.id && message.userId !== currentUser.id) {
        setUnreadCount((prev) => prev + 1);

        // Don't show toast if we are already in the conversation
        const isCurrentConversation =
          pathnameRef.current === `/messages/${message.conversationId}`;
        if (isCurrentConversation) return;

        toast(
          `New message from ${
            message.sender?.name || message.sender?.username || "Someone"
          }`,
          {
            description:
              message.content ||
              (message.imageUrl ? "Sent an image" : "Sent a video"),
            action: {
              label: "View",
              onClick: () => router.push(`/messages/${message.conversationId}`),
            },
          }
        );
      }
    });

    socketInstance.on("messageRead", () => {
      // When messages are read, re-fetch the count to be accurate
      import("@/app/actions/chat").then(({ getUnreadCount }) => {
        getUnreadCount().then(setUnreadCount);
      });
    });

    setTimeout(() => {
      setSocket(socketInstance);
    }, 0);

    // Initial fetch
    if (currentUser?.id) {
      console.log(
        "SocketProvider: Fetching unread count for user",
        currentUser.id
      );
      import("@/app/actions/chat").then(({ getUnreadCount }) => {
        getUnreadCount()
          .then((count) => {
            console.log("SocketProvider: Unread count fetched:", count);
            setUnreadCount(count);
          })
          .catch((err) =>
            console.error("SocketProvider: Failed to fetch count", err)
          );
      });
    } else {
      console.log(
        "SocketProvider: No current user, skipping unread count fetch"
      );
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser?.id, router]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, onlineUsers, lastSeenUpdates, unreadCount }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};
