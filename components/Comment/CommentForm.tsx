"use client";
import { createComment } from "@/app/actions/post";

interface CommentFormProps {
  postId: string;
}
export default function CommentForm({ postId }: CommentFormProps) {
  const createCommentWithId = createComment.bind(null, postId);

  return (
    <form
      action={createCommentWithId}
      className="border-t border-neutral-800 p-3 flex items-center gap-3"
    >
      <input
        type="text"
        name="comment"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500"
        placeholder="Add a comment..."
      />
      <button
        type="submit"
        className="text-brand text-sm font-semibold hover:text-white transition-colors disabled:opacity-50"
      >
        Post
      </button>
    </form>
  );
}
