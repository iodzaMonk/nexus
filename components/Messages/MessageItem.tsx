import { motion, useAnimation, AnimatePresence } from "motion/react";
import { Reply } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Message } from "@/app/generated/prisma/client";

export type MessageWithReply = Message & { replyTo?: Message | null };

interface MessageItemProps {
  msg: MessageWithReply;
  showSeen: boolean;
  isMe: boolean;
  repliedTo: boolean;
  profileUrl: string | null;
  usernameInitial: string;
  onSwipe: (msg: Message) => void;
}

export function MessageItem({
  msg,
  showSeen,
  isMe,
  repliedTo,
  profileUrl,
  usernameInitial,
  onSwipe,
}: MessageItemProps) {
  const controls = useAnimation();
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (repliedTo) {
      controls.start({ x: isMe ? -20 : 20 });
    } else {
      controls.start({ x: 0 });
    }
  }, [repliedTo, isMe, controls]);

  return (
    <>
      <div className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
        {/**AVATAR LOGIC */}
        {!isMe && (
          <div className="relative h-8 w-8 shrink-0 mt-1 self-end">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt="User"
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-muted flex items-center justify-center border border-border">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {usernameInitial}
                </span>
              </div>
            )}
          </div>
        )}

        {/* BUBBLE WRAPPER */}
        <div className="flex flex-col">
          <motion.div
            drag="x"
            dragMomentum={false}
            dragConstraints={
              isMe ? { right: 0, left: -100 } : { left: 0, right: 100 }
            }
            dragElastic={0}
            animate={controls}
            onDragEnd={(e, info) => {
              const threshold = 80;
              if (!isMe && info.offset.x > threshold) {
                onSwipe(msg);
              } else if (isMe && info.offset.x < -threshold) {
                onSwipe(msg);
              }
              controls.start({ x: 0 });
            }}
            id={msg.id}
            className={`rounded-2xl wrap-break-word ${
              (msg.imageUrl || msg.videoUrl) && !msg.content
                ? "p-0 bg-transparent"
                : "px-4 py-2"
            } ${
              repliedTo
                ? "bg-brand-hlg text-foreground"
                : (msg.imageUrl || msg.videoUrl) && !msg.content
                ? ""
                : isMe
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}
          >
            {msg.replyTo && (
              <div
                className={`text-xs mb-1 px-3 py-2 rounded-xl bg-opacity-10 backdrop-blur-sm flex items-center gap-2 select-none ${
                  isMe
                    ? "bg-white/20 text-primary-foreground/90"
                    : "bg-black/5 text-muted-foreground"
                }`}
              >
                <Reply className="w-3 h-3 shrink-0 opacity-70" />
                <div className="min-w-0 flex flex-col">
                  <span className="line-clamp-1 font-medium italic opacity-90">
                    {msg.replyTo.content ||
                      (msg.replyTo.imageUrl ? "Image" : "")}
                  </span>
                </div>
              </div>
            )}

            {msg.imageUrl && (
              <div
                onClick={() => setIsZoomed(true)}
                className={`relative rounded-lg overflow-hidden mt-1 w-60 aspect-square cursor-pointer ${
                  msg.content ? "mb-2" : ""
                }`}
              >
                <motion.div
                  layoutId={`media-${msg.id}`}
                  className="absolute inset-0"
                >
                  <Image
                    fill
                    draggable="false"
                    src={
                      msg.imageUrl.startsWith("blob:")
                        ? msg.imageUrl
                        : `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${msg.imageUrl}`
                    }
                    alt="Attachment"
                    className="object-cover"
                  />
                </motion.div>
              </div>
            )}

            {msg.videoUrl && (
              <div
                onClick={() => setIsZoomed(true)}
                className={`relative rounded-lg overflow-hidden mt-1 w-64 aspect-video cursor-pointer ${
                  msg.content ? "mb-2" : ""
                }`}
              >
                <motion.div
                  layoutId={`media-${msg.id}`}
                  className="absolute inset-0"
                >
                  <video
                    src={
                      msg.videoUrl.startsWith("blob:")
                        ? msg.videoUrl
                        : `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${msg.videoUrl}`
                    }
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            )}

            {msg.content && <p className="text-sm">{msg.content}</p>}
          </motion.div>
          {isMe && showSeen && (
            <p className="text-xs text-brand-text/50 self-end">
              {msg.seen ? "Seen" : "Delivered"}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4"
          >
            <motion.div
              layoutId={`media-${msg.id}`}
              className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {msg.videoUrl ? (
                <video
                  src={
                    msg.videoUrl.startsWith("blob:")
                      ? msg.videoUrl
                      : `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${msg.videoUrl}`
                  }
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Image
                  fill
                  src={
                    msg.imageUrl!.startsWith("blob:")
                      ? msg.imageUrl!
                      : `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${msg.imageUrl}`
                  }
                  alt="Full size"
                  className="object-contain"
                />
              )}
            </motion.div>

            {/* Close button option */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <code className="text-lg">Close</code>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
