import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SEOHead } from "@/components/seo-head";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/table-of-contents";
import { SeriesNavigation } from "@/components/series-navigation";
import profileImage from "@assets/profile.jpeg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, Calendar, Clock, ArrowLeft } from "lucide-react";
import { BlogPost } from "@shared/schema";
import { generateStructuredData, getBaseUrl } from "@/lib/seo";
import { estimateReadingTime } from "@/lib/markdown";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCoverImage } from "@/lib/image-utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog-posts', slug],
    queryFn: async ({ queryKey }) => {
      const [path, postSlug] = queryKey;
      const response = await fetch(`${path}/${postSlug}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      return response.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("POST", `/api/blog-posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts', slug] });
      toast({
        title: "좋아요!",
        description: "이 글이 마음에 드시는군요!",
      });
    },
    onError: () => {
      toast({
        title: "오류 발생",
        description: "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (post) {
      likeMutation.mutate(post.id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "stock":
        return "bg-blue-500 text-white";
      case "etf":
        return "bg-green-500 text-white";
      case "weekly":
        return "bg-indigo-500 text-white";
      case "etc":
        return "bg-gray-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    // 마크다운 파일의 category 값을 그대로 사용
    return category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              글을 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground mb-8">
              요청하신 글이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => setLocation('/')}>
              홈으로 돌아가기
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const baseUrl = getBaseUrl();
  const structuredData = generateStructuredData(post, baseUrl);
  const readingTime = estimateReadingTime(post.content);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.seoTitle || `${post.title} | 투자 인사이트`}
        description={post.seoDescription || post.excerpt}
        keywords={post.seoKeywords || post.tags?.join(', ')}
        ogTitle={post.title}
        ogDescription={post.excerpt}
        ogImage={post.featuredImage}
        ogUrl={`${baseUrl}/blog/${post.slug}`}
        canonicalUrl={`${baseUrl}/blog/${post.slug}`}
        structuredData={structuredData}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            <article>
              {/* Back button */}
              <Button
                variant="ghost"
                className="mb-6"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로 돌아가기
              </Button>

              {/* Post header */}
              <header className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <Badge className={getCategoryColor(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={profileImage} alt="Frank" />
                      <AvatarFallback>F</AvatarFallback>
                    </Avatar>
                    <span>Frank</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.createdAt!).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime}분 읽기</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views || 0}회 조회</span>
                  </div>
                </div>
              </header>

              {/* Series Navigation */}
              {post.series && (
                <div className="mb-8">
                  <SeriesNavigation seriesName={post.series} currentSlug={post.slug} />
                </div>
              )}

              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8">
                <TableOfContents content={post.content} />
              </div>

              {/* Post content */}
              <div className="mb-8">
                <MarkdownRenderer content={post.content} slug={post.slug} category={post.category} />
              </div>

              {/* Post footer */}
              <footer className="border-t pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      disabled={likeMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      좋아요 {post.likes || 0}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      마지막 수정: {new Date(post.updatedAt!).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </footer>
            </article>
          </div>

          {/* Desktop Table of Contents */}
          <div className="hidden lg:block">
            <TableOfContents content={post.content} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}