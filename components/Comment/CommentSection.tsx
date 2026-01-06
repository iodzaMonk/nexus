import { PostWithComments } from "@/lib/PostWithComments";
interface CommentSectionProps {
  post: PostWithComments;
}

export default function CommentSection({ post }: CommentSectionProps) {
  return (
    <div className="px-3 py-1 space-y-1">
      {post.comments.map((comment) => (
        <p key={comment.id} className="text-sm">
          <span className="font-bold mr-2">{comment.authorOwner.username}</span>
          <span>{comment.comment}</span>
        </p>
      ))}
    </div>
  );
}
