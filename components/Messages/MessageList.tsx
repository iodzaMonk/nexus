import { MessageItem, MessageWithReply } from "./MessageItem";

import { Message, User } from "@/app/generated/prisma/client";
import { useEffect } from "react";
import { io } from "socket.io-client";

interface MessageListProps {
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  messages: MessageWithReply[];
  currentUserId: string;
  otherParticipant: User | undefined;
}

const socket = io();

export function MessageList({
  replyingTo,
  setReplyingTo,
  messages,
  currentUserId,
  otherParticipant,
}: MessageListProps) {
  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.userId === currentUserId) return;

    const options = {
      rootMargin: "0px",
      scrollMargin: "0px",
      threshold: 1.0,
    };
    const lastMsgElem = document.getElementById(lastMessage.id);

    const callback = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || lastMessage.seen) return;
        console.log(entry.target.textContent);
        socket.emit("readMessage", lastMessage);
      });
    };

    const observer = new IntersectionObserver(callback, options);

    if (lastMsgElem) observer.observe(lastMsgElem);
    return () => observer.disconnect();
  }, [messages, currentUserId]);

  const profileUrl = otherParticipant?.profileImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${otherParticipant.profileImage}`
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 no-scrollbar">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground opacity-50 my-10">
          <p>
            This is the start of your conversation with @
            {otherParticipant?.username}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 justify-end min-h-full">
          {messages.map((msg, i) => {
            const isMe = msg.userId === currentUserId;
            const repliedTo = msg.id === replyingTo?.id; // Visual highlight logic

            return (
              <MessageItem
                key={msg.id}
                msg={msg}
                isMe={isMe}
                showSeen={i === messages.length - 1}
                repliedTo={repliedTo}
                profileUrl={profileUrl}
                usernameInitial={(
                  otherParticipant?.username?.[0] || "?"
                ).toUpperCase()}
                onSwipe={(m) => setReplyingTo(m)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
