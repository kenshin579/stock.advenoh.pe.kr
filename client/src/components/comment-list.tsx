import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageCircle, User } from "lucide-react";
import type { Comment } from "@shared/schema";

interface CommentListProps {
  postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['/api/blog-posts', postId, 'comments'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <MessageCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
          아직 댓글이 없습니다
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        댓글 {comments.length}개
      </h3>
      
      {comments.map((comment) => (
        <Card key={comment.id} className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.authorName}
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt!), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}