import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { getCoverImage } from '@/lib/image-utils';
import { formatDateSafely } from '@/lib/date-utils';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  series?: string | null;
  featuredImage?: string | null;
  content?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  maxPosts?: number;
}

export function RelatedPosts({ currentPost, allPosts, maxPosts = 4 }: RelatedPostsProps) {
  // Calculate relevance score for each post
  const getRelevanceScore = (post: BlogPost): number => {
    let score = 0;
    
    // Same series gets highest priority
    if (currentPost.series && post.series === currentPost.series && post.slug !== currentPost.slug) {
      score += 50;
    }
    
    // Same category
    if (post.category === currentPost.category && post.slug !== currentPost.slug) {
      score += 20;
    }
    
    // Common tags
    const currentTags = currentPost.tags || [];
    const postTags = post.tags || [];
    const commonTags = currentTags.filter(tag => postTags.includes(tag));
    score += commonTags.length * 10;
    
    // Recency bonus (newer posts get slight preference)
    const postDateValue = post.date || post.createdAt;
    const currentDateValue = currentPost.date || currentPost.createdAt;
    
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
  const relatedPosts = allPosts
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
          const coverImage = getCoverImage({
            featuredImage: post.featuredImage,
            category: post.category,
            content: post.content,
            slug: post.slug
          });

          const handleClick = () => {
            // Scroll to top when clicking related post
            window.scrollTo({ top: 0, behavior: 'smooth' });
          };

          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} onClick={handleClick}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={coverImage}
                    alt={`${post.title} - ${post.category} 관련 이미지`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const defaultImageUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format';
                      if (target.src !== defaultImageUrl) {
                        target.src = defaultImageUrl;
                      }
                    }}
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
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
                      {formatDateSafely(post.date || post.createdAt)}
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