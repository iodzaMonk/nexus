import Image from "next/image";
import CommentSection from "../Comment/CommentSection";
import CommentForm from "../Comment/CommentForm";
import { PostWithComments } from "@/lib/PostWithComments";
import LikeButton from "./LikeButton";

interface PostSectionProps {
  posts: PostWithComments[];
  userId?: string;
}

const supabaseStorage = process.env.NEXT_PUBLIC_SUPABASE_STORAGE;

export default function PostSection({ posts, userId }: PostSectionProps) {
  return (
    <div className="flex flex-col items-center gap-y-8 mt-8 pb-20">
      {posts.map((post) => {
        const isLiked = post.likes.some((like) => like.userId === userId);
        return (
          <div
            key={post.id}
            className="w-full max-w-[470px] border border-neutral-800 rounded-xl overflow-hidden bg-brand-mid shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center p-3">
              <p className="font-bold text-sm">{post.author.username}</p>
              <span className="text-neutral-500 text-xs ml-auto">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Image */}
            <div className="relative aspect-square w-full bg-neutral-900 border-t border-b border-neutral-800">
              <Image
                width={1200}
                height={1200}
                src={`${supabaseStorage}${post.imageUrl}`}
                alt={post.caption || "Post"}
                className="object-cover w-full h-full"
              />
            </div>

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
        );
      })}
    </div>
  );
}
