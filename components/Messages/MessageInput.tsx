"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Message } from "@/app/generated/prisma/client";
import { AnimatePresence, motion } from "motion/react";
import { Reply, X, Send } from "lucide-react";
import Image from "next/image";

interface MessageInputProps {
  onSend: (content: string, image: File | null) => Promise<void>;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

export function MessageInput({
  onSend,
  replyingTo,
  onCancelReply,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if ((!content.trim() && !image) || isLoading) return;

    setIsLoading(true);
    try {
      await onSend(content, image);
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    if (e.target.files[0].size > 50000000) {
      setError("Max file size limit is 50mb");
      return;
    }
    setError("");
    setImage(e.target.files[0]);
  };

  return (
    <div className="p-4 pt-2 shrink-0">
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between bg-muted/40 backdrop-blur-md px-4 py-2 text-sm text-foreground/80 mb-2 rounded-2xl border border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Reply className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Replying to
                </span>
                <span className="truncate opacity-75">
                  {replyingTo.content || "Image"}
                </span>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-background/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {image && (
        <div className="relative mb-2 ml-1 w-20 h-20">
          {image.type.startsWith("video/") ? (
            <video
              src={URL.createObjectURL(image)}
              className="w-full h-full rounded-lg border border-border object-cover"
              autoPlay
              muted
              loop
            />
          ) : (
            <Image
              src={URL.createObjectURL(image)}
              alt="Preview"
              fill
              className="rounded-lg border border-border object-cover"
            />
          )}

          <button
            onClick={() => setImage(null)}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm hover:opacity-90 z-10"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {error ? <p className="text-red-500">{error}</p> : null}
      <div className="flex gap-2 items-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*, video/*"
          onChange={handleFileSelect}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="text-muted-foreground hover:text-foreground shrink-0 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </Button>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send message"
          disabled={isLoading}
          className="rounded-full bg-muted/50 border-white/10 focus-visible:ring-offset-0 focus-visible:ring-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={(!content.trim() && !image) || isLoading}
          className="rounded-full shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
