"use client";

import Image from "next/image";
import Link from "next/link";
import CommentSection from "../Comment/CommentSection";
import CommentForm from "../Comment/CommentForm";
import { PostWithComments } from "@/lib/PostWithComments";
import LikeButton from "./LikeButton";
import VideoPlayer from "./VideoPlayer";
import { useRef, useState } from "react";

interface VideoFeedProps {
  posts: PostWithComments[];
  userId?: string;
}

const supabaseStorage = process.env.NEXT_PUBLIC_SUPABASE_STORAGE;

export default function VideoFeed({ posts, userId }: VideoFeedProps) {
  const [playingIndex, setPlayingIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Calculate center relative to the container's scroll position
    const containerCenter = container.scrollTop + container.clientHeight / 2;

    const children = Array.from(container.children);

    let minDiff = Infinity;
    let closestIndex = 0;

    children.forEach((child, index) => {
      const childEl = child as HTMLElement;
      // Element's center position
      const childStart = childEl.offsetTop;
      const childCenter = childStart + childEl.clientHeight / 2;

      const diff = Math.abs(containerCenter - childCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    if (closestIndex !== playingIndex) {
      setPlayingIndex(closestIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-[85vh] my-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
    >
      {posts.map((post, index) => {
        const isLiked = post.likes.some((like) => like.userId === userId);
        return (
          <div
            key={post.id}
            className="snap-center w-full h-[85vh] flex items-center justify-center p-2"
          >
            <div className="w-full max-w-lg md:max-w-xl h-full mx-auto border border-neutral-800 rounded-xl overflow-hidden bg-brand-mid shadow-sm flex flex-col">
              {/* Header */}
              <div className="flex items-center p-3 shrink-0">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-bold text-sm hover:underline"
                >
                  {post.author.username}
                </Link>
                <span className="text-neutral-500 text-xs ml-auto">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* Media (Video only expected here mostly, but safe to check) */}
              {post.videoUrl ? (
                <div className="relative w-full flex-1 bg-black border-t border-b border-neutral-800 min-h-0">
                  <VideoPlayer
                    src={`${supabaseStorage}${post.videoUrl}`}
                    isActive={index === playingIndex}
                  />
                </div>
              ) : post.imageUrl ? (
                <div className="relative w-full flex-1 bg-neutral-900 border-t border-b border-neutral-800 min-h-0">
                  <Image
                    width={1200}
                    height={1200}
                    src={`${supabaseStorage}${post.imageUrl}`}
                    alt={post.caption || "Post"}
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : null}
              {/* Actions / Caption */}
              <div className="p-3 flex justify-between">
                <div className="text-sm">
                  <span className="font-bold mr-2">{post.author.username}</span>
                  <span>{post.caption}</span>
                </div>
                <LikeButton
                  postId={post.id}
                  initialIsLiked={isLiked}
                  initialLikeCount={post.likes.length}
                />
              </div>
              <CommentSection post={post} />
              <CommentForm postId={post.id} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
