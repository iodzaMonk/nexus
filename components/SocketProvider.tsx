"use client";
import { useEffect, createContext, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  lastSeenUpdates: Map<string, Date>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  lastSeenUpdates: new Map(),
});

export default function SocketProvider({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser?: { id: string };
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenUpdates, setLastSeenUpdates] = useState<Map<string, Date>>(
    new Map()
  );

  useEffect(() => {
    console.log("SocketProvider: Initializing socket...");
    const socketInstance = io();

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log(
        "SocketProvider: Global Socket Connected:",
        socketInstance.id
      );
      if (currentUser?.id) {
        console.log(
          "SocketProvider: Emitting register for user:",
          currentUser.id
        );
        socketInstance.emit("register", currentUser.id);
      } else {
        console.warn(
          "SocketProvider: Connected but no currentUser.id to register"
        );
      }
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("SocketProvider: Global Socket Disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("SocketProvider: Connection Error:", error);
    });

    // Presence events
    socketInstance.on("onlineUsers", (users: string[]) => {
      console.log("SocketProvider: Received onlineUsers list:", users);
      setOnlineUsers(new Set(users));
    });

    socketInstance.on("userOnline", (userId: string) => {
      console.log("SocketProvider: Received userOnline:", userId);
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

    setTimeout(() => {
      setSocket(socketInstance);
    }, 0);

    return () => {
      console.log("SocketProvider: Cleaning up socket...");
      socketInstance.disconnect();
    };
  }, [currentUser?.id]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, onlineUsers, lastSeenUpdates }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};
