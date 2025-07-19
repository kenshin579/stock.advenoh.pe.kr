import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Calendar, User, Tag, Clock, ArrowLeft, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface BlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  date: string;
  category: string;
  tags?: string[];
  readTime?: number;
  series?: string;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesName = decodeURIComponent(params.seriesName || '');

  // Fetch posts in this series
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts', { series: seriesName }],
    queryFn: async () => {
      const response = await fetch(`/api/blog-posts?series=${encodeURIComponent(seriesName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch series posts');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !posts) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                시리즈를 찾을 수 없습니다
              </h1>
              <p className="text-muted-foreground mb-8">
                요청하신 시리즈가 존재하지 않거나 삭제되었습니다.
              </p>
              <Link href="/series">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  시리즈 목록으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Sort posts by date (newest first)
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/series">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              시리즈 목록으로 돌아가기
            </Button>
          </Link>
        </div>

        {/* Series Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              SERIES
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {seriesName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {posts.length}개 게시물
          </p>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {sortedPosts.map((post, index) => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/blog/${post.slug}`}>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors cursor-pointer line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {post.date && !isNaN(new Date(post.date).getTime()) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                      {post.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}분 읽기
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Part
                    </div>
                  </div>
                </div>
              </CardHeader>
              {post.excerpt && (
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Back to Series Button */}
        <div className="mt-12 text-center">
          <Link href="/series">
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              다른 시리즈 보기
            </Button>
          </Link>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}