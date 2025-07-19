import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookOpen, ChevronRight, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface SeriesPost {
  title: string;
  slug: string;
  date: string;
}

interface SeriesNavigationProps {
  seriesName: string;
  currentSlug: string;
}

export function SeriesNavigation({ seriesName, currentSlug }: SeriesNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all posts in this series
  const { data: posts, isLoading } = useQuery<SeriesPost[]>({
    queryKey: ['/api/blog-posts', { series: seriesName }],
    queryFn: async () => {
      const response = await fetch(`/api/blog-posts?series=${encodeURIComponent(seriesName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch series posts');
      }
      return response.json();
    },
  });

  if (isLoading || !posts || posts.length <= 1) {
    return null;
  }

  // Sort posts by date (oldest first for series order)
  const sortedPosts = [...posts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Find current post index
  const currentIndex = sortedPosts.findIndex(post => post.slug === currentSlug);
  const currentPost = sortedPosts[currentIndex];
  
  if (!currentPost) {
    return null;
  }

  // Get previous and next posts
  const previousPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 dark:bg-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-white dark:bg-gray-800">
              <BookOpen className="w-3 h-3" />
              SERIES
            </Badge>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/series/${encodeURIComponent(seriesName)}`}>
              <span className="font-medium text-primary hover:underline cursor-pointer">
                {seriesName}
              </span>
            </Link>
          </div>
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1}/{sortedPosts.length}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentPost.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-2 h-auto text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
            >
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                시리즈 전체 보기 ({sortedPosts.length}개)
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1 mt-2">
            {sortedPosts.map((post, index) => {
              const isCurrent = post.slug === currentSlug;
              return (
                <div
                  key={post.slug}
                  className={`flex items-center gap-2 p-2 rounded transition-colors ${
                    isCurrent 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`text-xs font-mono w-6 text-center ${
                    isCurrent ? 'text-primary font-bold' : 'text-gray-400'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {isCurrent ? (
                    <span className="text-sm font-medium text-primary line-clamp-1">
                      {post.title}
                    </span>
                  ) : (
                    <Link href={`/blog/${post.slug}`}>
                      <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer line-clamp-1">
                        {post.title}
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {previousPost ? (
            <Link href={`/blog/${previousPost.slug}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 rotate-180" />
                이전 글
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                다음 글
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}