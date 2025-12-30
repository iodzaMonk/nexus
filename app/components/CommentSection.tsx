import { PostWithComments } from "@/lib/PostWithComments";
interface CommentSectionProps {
  post: PostWithComments;
}

export default function CommentSection({ post }: CommentSectionProps) {
  return (
    <div className="p-4">
      {post.comments.map((comment) => (
        <p key={comment.id}>
          <span className="font-bold">{comment.authorOwner.name}: </span>
          {comment.comment}
        </p>
      ))}
    </div>
  );
} 