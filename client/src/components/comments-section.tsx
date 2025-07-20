import CommentForm from "./comment-form";
import CommentList from "./comment-list";

interface CommentsSectionProps {
  postId: number;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  return (
    <div className="mt-12 space-y-8">
      {/* Comments List */}
      <CommentList postId={postId} />
      
      {/* Comment Form */}
      <CommentForm postId={postId} />
    </div>
  );
}