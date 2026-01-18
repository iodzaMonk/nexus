"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/chat";
import { ConversationHeader } from "./ConversationHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Message, User } from "@/app/generated/prisma/client";
import { useSocket } from "../SocketProvider";

interface ChatWindowProps {
  initialMessages: Message[];
  conversationId: string;
  currentUser: User;
  otherParticipant: User | undefined;
}

export function ChatWindow({
  initialMessages,
  conversationId,
  currentUser,
  otherParticipant,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prevInitialMessages, setPrevInitialMessages] =
    useState(initialMessages);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join logic
    const joinRoom = () => {
      socket.emit("join", conversationId);
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    const handleNewMessage = (newMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageRead", (data) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (new Date(msg.createdAt) <= new Date(data.seenAt) && !msg.seen) {
            return { ...msg, seen: data.seenAt };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off("connect", joinRoom);
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId, socket, currentUser.id]);

  if (initialMessages !== prevInitialMessages) {
    setPrevInitialMessages(initialMessages);
    setMessages((prevMessages) => {
      const seenMap = new Map(prevMessages.map((m) => [m.id, m.seen]));

      // 1. Merge server messages with local knowledge
      const mergedServerMessages = initialMessages.map((serverMsg) => {
        const localSeen = seenMap.get(serverMsg.id);
        if (localSeen && !serverMsg.seen) {
          return { ...serverMsg, seen: localSeen };
        }
        return serverMsg;
      });

      // 2. Preserve optimistic messages
      const optimisticMessages = prevMessages.filter((m) =>
        m.id.startsWith("temp-")
      );

      return [...mergedServerMessages, ...optimisticMessages];
    });
  }

  const handleSendMessage = async (content: string, image: File | null) => {
    const tempId = `temp-${Date.now()}`;
    const isVideo = image?.type.startsWith("video/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optimisticMessage: any = {
      id: tempId,
      userId: currentUser.id,
      content: content,
      imageUrl: image && !isVideo ? URL.createObjectURL(image) : null,
      videoUrl: image && isVideo ? URL.createObjectURL(image) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: conversationId,
      replyToId: replyingTo?.id || null, // Ensure replyToId matches validReplyId logic roughly or just rely on object
      replyTo: replyingTo,
      sender: currentUser,
    };

    // 1. Optimistic Update: Show immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      if (isVideo) {
        formData.append("video", image);
      } else {
        formData.append("image", image);
      }
    }
    if (replyingTo) {
      formData.append("replyId", replyingTo.id);
    }

    try {
      // 3. Save to DB and Upload by calling server action
      const newMessage = await sendMessage(conversationId, formData);
      setReplyingTo(null);

      // 4. Update with real message (replace optimistic)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? (newMessage as Message) : msg))
      );

      // 5. Refresh router to update sidebar lists

      // 6. Emit real message via socket
      // Wait for image upload to complete before emitting so others see the image
      if (socket) {
        console.log("Emitting socket message:", newMessage);
        socket.emit("sendMessage", {
          ...newMessage,
          recipientId: otherParticipant?.id,
        });
      } else {
        console.warn("Socket not available for emit");
      }
    } catch (error) {
      console.error("Failed to send message", error);
      // Rollback on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-full w-full pb-16 md:pb-0">
      <ConversationHeader participant={otherParticipant} />

      {/* We pass the LOCAL messages state to the list */}
      <MessageList
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        messages={messages}
        currentUserId={currentUser.id}
        otherParticipant={otherParticipant}
      />

      {/* We pass our handler to the input */}
      <MessageInput
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
