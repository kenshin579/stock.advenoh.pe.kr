import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { BlogPost } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateSlug, extractExcerpt } from "@/lib/markdown";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
    queryFn: async () => {
      const response = await fetch('/api/blog-posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return apiRequest("POST", "/api/blog-posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({
        title: "글 작성 완료",
        description: "새로운 글이 성공적으로 작성되었습니다.",
      });
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "글 작성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, postData }: { id: number; postData: any }) => {
      return apiRequest("PUT", `/api/blog-posts/${id}`, postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({
        title: "글 수정 완료",
        description: "글이 성공적으로 수정되었습니다.",
      });
      setEditingPost(null);
    },
    onError: (error: Error) => {
      toast({
        title: "글 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/blog-posts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      toast({
        title: "글 삭제 완료",
        description: "글이 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "글 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tags = formData.get('tags')?.toString().split(',').map(tag => tag.trim()).filter(Boolean) || [];
    
    const postData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      category: formData.get('category'),
      tags,
      featuredImage: formData.get('featuredImage'),
      published: formData.get('published') === 'on',
      seoTitle: formData.get('seoTitle'),
      seoDescription: formData.get('seoDescription'),
      seoKeywords: formData.get('seoKeywords'),
    };

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, postData });
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const handleDeletePost = (id: number) => {
    if (window.confirm('정말로 이 글을 삭제하시겠습니까?')) {
      deletePostMutation.mutate(id);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
    const excerptTextarea = document.querySelector('textarea[name="excerpt"]') as HTMLTextAreaElement;
    
    if (slugInput && !editingPost) {
      slugInput.value = generateSlug(title);
    }
    
    if (excerptTextarea && !editingPost) {
      const content = (document.querySelector('textarea[name="content"]') as HTMLTextAreaElement)?.value || '';
      if (content) {
        excerptTextarea.value = extractExcerpt(content);
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const excerptTextarea = document.querySelector('textarea[name="excerpt"]') as HTMLTextAreaElement;
    
    if (excerptTextarea && !editingPost) {
      excerptTextarea.value = extractExcerpt(content);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "stocks": return "주식";
      case "etf": return "ETF";
      case "bonds": return "채권";
      case "funds": return "펀드";
      case "analysis": return "시장분석";
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="관리자 페이지 | 투자 인사이트"
        description="투자 인사이트 블로그 관리자 페이지"
        ogTitle="관리자 페이지"
        ogDescription="투자 인사이트 블로그 관리자 페이지"
      />
      
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">블로그 관리</h1>
          <p className="text-muted-foreground">
            블로그 포스트를 작성, 편집, 삭제할 수 있습니다.
          </p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">포스트 관리</TabsTrigger>
            <TabsTrigger value="create">포스트 작성</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">포스트 목록</h2>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                새 포스트 작성
              </Button>
            </div>

            {isLoading ? (
              <div>로딩 중...</div>
            ) : (
              <div className="space-y-4">
                {posts?.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{post.title}</h3>
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? "발행됨" : "초안"}
                            </Badge>
                            <Badge variant="outline">
                              {getCategoryLabel(post.category)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(post.createdAt!).toLocaleDateString('ko-KR')}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPost(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            {(isCreating || editingPost) && (
              <PostEditor
                post={editingPost}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingPost(null);
                }}
                isSubmitting={createPostMutation.isPending || updatePostMutation.isPending}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

interface PostEditorProps {
  post?: BlogPost | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

function PostEditor({ post, onSubmit, onCancel, isSubmitting, onTitleChange, onContentChange }: PostEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {post ? '포스트 편집' : '새 포스트 작성'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                name="title"
                defaultValue={post?.title || ''}
                onChange={onTitleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">슬러그</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={post?.slug || ''}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">요약</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post?.excerpt || ''}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">내용 (Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={post?.content || ''}
              onChange={onContentChange}
              rows={20}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select name="category" defaultValue={post?.category || 'stocks'}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stocks">주식</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="bonds">채권</SelectItem>
                  <SelectItem value="funds">펀드</SelectItem>
                  <SelectItem value="analysis">시장분석</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={post?.tags?.join(', ') || ''}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="featuredImage">대표 이미지 URL</Label>
            <Input
              id="featuredImage"
              name="featuredImage"
              type="url"
              defaultValue={post?.featuredImage || ''}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SEO 설정</h3>
            <div>
              <Label htmlFor="seoTitle">SEO 제목</Label>
              <Input
                id="seoTitle"
                name="seoTitle"
                defaultValue={post?.seoTitle || ''}
              />
            </div>
            <div>
              <Label htmlFor="seoDescription">SEO 설명</Label>
              <Textarea
                id="seoDescription"
                name="seoDescription"
                defaultValue={post?.seoDescription || ''}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="seoKeywords">SEO 키워드</Label>
              <Input
                id="seoKeywords"
                name="seoKeywords"
                defaultValue={post?.seoKeywords || ''}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              name="published"
              defaultChecked={post?.published || false}
            />
            <Label htmlFor="published">발행하기</Label>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '저장 중...' : (post ? '수정하기' : '작성하기')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
