"use client"
import { createComment } from "../actions";

interface CommentFormProps {
    postId: string;
}
export default function CommentForm({postId}: CommentFormProps) {
    const createCommentWithId = createComment.bind(null, postId);

    return (
        <form action={createCommentWithId} className="p-4">
            <input type="text" name="comment" className="mb-2 p-2 mr-2" placeholder="write your comment here..." />
            <button type="submit" className="bg-brand-hlg py-2 px-4 rounded-lg text-white">Post</button>
        </form>
    );
}