import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { formatDateSafely } from '@/lib/date-utils';
import { BlogPost } from '@/lib/blog';

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

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          관련 글
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => {
          const coverImage = post.featuredImage || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format';

          return (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="group card-hover-effect cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={coverImage}
                    alt={`${post.title} - ${(post as BlogPost & { categories?: string[] }).categories?.[0] || '투자'} 관련 이미지`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"

                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                      {(post as BlogPost & { categories?: string[] }).categories?.[0] || '투자'}
                    </span>
                    {post.series && (
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                        시리즈
                      </span>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {formatDateSafely(post.date)}
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="h-3 w-3" />
                        <span className="truncate max-w-20">
                          {post.tags[0]}
                        </span>
                        {post.tags.length > 1 && (
                          <span>+{post.tags.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      

    </div>
  );
}