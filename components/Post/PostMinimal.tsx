import { Post } from "@/app/generated/prisma/client";
import Image from "next/image";

interface MinimalPostProps {
  post: Post;
}

export default function PostMinimal({ post }: MinimalPostProps) {
  return (
    <div className="flex flex-col border border-neutral-800 rounded-md overflow-hidden bg-brand-mid hover:bg-brand-mid-hover">
      <div className="relative aspect-square w-full bg-neutral-900">
        {post.imageUrl && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_STORAGE}${post.imageUrl}`}
            alt={post.caption || "Post image"}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm truncate">{post.caption}</p>
      </div>
    </div>
  );
}
