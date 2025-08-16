import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Tag, ArrowRight, Eye, Heart } from 'lucide-react';
import { formatDateSafely } from '@/lib/date-utils';
import { BlogPost } from '@/lib/blog';
import { getCoverImage } from '@/lib/image-utils';

interface RelatedPostsProps {
  posts: BlogPost[];
  currentPost: BlogPost;
  maxPosts?: number;
}

export function RelatedPosts({ posts, currentPost, maxPosts = 4 }: RelatedPostsProps) {
  // Safety check
  if (!currentPost || !posts) {
    return null;
  }

  // Calculate relevance score for each post
  const getRelevanceScore = (post: BlogPost): number => {
    let score = 0;
    
    // Same series gets highest priority
    if (currentPost.series && post.series === currentPost.series && post.slug !== currentPost.slug) {
      score += 50;
    }
    
    // Same category (using categories array)
    const postCategories = (post as BlogPost & { categories?: string[] }).categories || [];
    const currentCategories = (currentPost as BlogPost & { categories?: string[] }).categories || [];
    if (postCategories.some((cat: string) => currentCategories.includes(cat))) {
      score += 20;
    }
    
    // Common tags
    const currentTags = currentPost.tags || [];
    const postTags = post.tags || [];
    const commonTags = currentTags.filter(tag => postTags.includes(tag));
    score += commonTags.length * 10;
    
    // Recency bonus (newer posts get slight preference)
    const postDateValue = post.date;
    const currentDateValue = currentPost.date;
    
    if (postDateValue && currentDateValue) {
      const postDate = new Date(postDateValue);
      const currentDate = new Date(currentDateValue);
      
      if (!isNaN(postDate.getTime()) && !isNaN(currentDate.getTime())) {
        const daysDiff = Math.abs((currentDate.getTime() - postDate.getTime()) / (1000 * 3600 * 24));
        if (daysDiff < 30) score += 5;
        if (daysDiff < 7) score += 3;
      }
    }
    
    return score;
  };

  // Get related posts sorted by relevance
  const relatedPosts = posts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => ({
      ...post,
      relevanceScore: getRelevanceScore(post)
    }))
    .filter(post => post.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxPosts);

  if (relatedPosts.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "stock":
        return "bg-blue-500 text-white";
      case "etf":
        return "bg-green-500 text-white";
      case "bonds":
        return "bg-purple-500 text-white";
      case "funds":
        return "bg-orange-500 text-white";
      case "analysis":
        return "bg-red-500 text-white";
      case "etc":
        return "bg-gray-500 text-white";
      case "weekly":
        return "bg-indigo-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category || "기타";
  };

  return (
    <div className="mt-12 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          관련 글
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => {
          let coverImage = getCoverImage(post);
          
          // 이미지 경로가 유효하지 않거나 빈 문자열인 경우 기본 이미지 사용
          if (!coverImage || coverImage === '' || coverImage === 'undefined') {
            coverImage = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format';
          }

          return (
            <Link key={post.slug} href={`/${((post as BlogPost & { categories?: string[] }).categories?.[0] || 'etc').toLowerCase()}/${post.slug}`}>
              <Card className="card-hover overflow-hidden bg-card text-card-foreground border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative">
                  <img
                    src={coverImage}
                    alt={`${post.title} - ${(post as BlogPost & { categories?: string[] }).categories?.[0] || '투자'} 관련 이미지`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryColor((post as BlogPost & { categories?: string[] }).categories?.[0] || 'default')}>
                      {getCategoryLabel((post as BlogPost & { categories?: string[] }).categories?.[0] || 'General')}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <CardTitle className="mb-3 text-lg font-semibold leading-tight">
                    <span className="hover:text-primary transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </span>
                  </CardTitle>
                  
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateSafely(post.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views || 0}</span>
                      </div>
                      {post.likes && post.likes > 0 && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src="/profile.jpeg" alt="Frank Oh" />
                        <AvatarFallback>FO</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Frank</span>
                    </div>
                  </div>
                  
                  {post.readingTime && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-muted-foreground">
                        📖 {post.readingTime}분 읽기
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}