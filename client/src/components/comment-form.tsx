import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    content: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", `/api/blog-posts/${postId}/comments`, data);
      return response.json();
    },
    onSuccess: () => {
      // Reset form
      setFormData({
        authorName: "",
        authorEmail: "",
        content: "",
      });
      
      // Invalidate comments to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts', postId, 'comments'] });
      
      toast({
        title: "댓글 등록 완료!",
        description: "댓글이 성공적으로 등록되었습니다. 관리자 승인 후 게시됩니다.",
      });
    },
    onError: () => {
      toast({
        title: "댓글 등록 실패",
        description: "댓글 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.authorName.trim() || !formData.authorEmail.trim() || !formData.content.trim()) {
      toast({
        title: "필수 항목 누락",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate(formData);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">댓글 작성</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="authorName">이름 *</Label>
            <Input
              id="authorName"
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="이름을 입력해주세요"
              required
            />
          </div>
          <div>
            <Label htmlFor="authorEmail">이메일 *</Label>
            <Input
              id="authorEmail"
              type="email"
              value={formData.authorEmail}
              onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="content">댓글 내용 *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="댓글을 입력해주세요..."
            rows={4}
            required
          />
        </div>
        <Button 
          type="submit" 
          disabled={commentMutation.isPending}
          className="w-full md:w-auto"
        >
          {commentMutation.isPending ? "등록 중..." : "댓글 등록"}
        </Button>
      </form>
    </Card>
  );
}