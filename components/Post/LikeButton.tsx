"use client";
import { useState } from "react";
import { Toggle } from "../ui/toggle";
import { HeartIcon } from "lucide-react";
import { toggleLike } from "@/app/actions";

export default function LikeButton({
  postId,
  initialIsLiked,
  initialLikeCount,
}: {
  postId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  async function handleLike() {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await toggleLike(postId);
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <Toggle
        pressed={isLiked}
        onPressedChange={handleLike}
        aria-label="Toggle heart"
        className="data-[state=on]:bg-transparent data-[state=on]:text-red-500 hover:bg-transparent p-0 h-auto w-auto flex items-center justify-center transition-transform active:scale-95"
      >
        {likeCount > 0 && (
          <span className="text-sm font-semibold text-white">{likeCount}</span>
        )}
        <HeartIcon
          className={`size-5 ${
            isLiked ? "fill-current text-red-500" : "text-white"
          }`}
        />
      </Toggle>
    </div>
  );
}
