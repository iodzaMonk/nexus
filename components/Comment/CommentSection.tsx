import { PostWithComments } from "@/lib/PostWithComments";
import Link from "next/link";

interface CommentSectionProps {
  post: PostWithComments;
}

export default function CommentSection({ post }: CommentSectionProps) {
  if (post.comments.length === 0) return null;

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Subtle Divider */}
      <div className="w-full h-px bg-white/10" />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Comments
        </p>

        {post.comments.map((comment) => (
          <div key={comment.id} className="text-sm flex gap-2 items-start">
            <Link
              href={`/profile/${comment.authorOwner.username}`}
              className="font-bold hover:underline shrink-0"
            >
              {comment.authorOwner.username}
            </Link>
            <span className="text-neutral-300 wrap-break-word">
              {comment.comment}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
