import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, List, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SeriesPost {
  title: string;
  slug: string;
  date: string;
}

interface SeriesNavigationProps {
  seriesName: string;
  currentPostSlug: string;
  seriesPosts: SeriesPost[];
  showAllPosts?: boolean;
}

export function SeriesNavigation({ 
  seriesName, 
  currentPostSlug, 
  seriesPosts, 
  showAllPosts = false 
}: SeriesNavigationProps) {
  // Sort posts by date (newest first)
  const sortedPosts = Array.isArray(seriesPosts) 
    ? [...seriesPosts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];
  
  const currentIndex = sortedPosts.findIndex(post => post.slug === currentPostSlug);
  const currentPost = sortedPosts[currentIndex];
  const previousPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  if (!currentPost) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Series Header */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                시리즈: {seriesName}
              </CardTitle>
            </div>
            <Link 
              href={`/series/${encodeURIComponent(seriesName)}`}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              전체 보기
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{currentIndex + 1} / {sortedPosts.length}편</span>
            <span>•</span>
            <span>전체 {sortedPosts.length}편의 시리즈</span>
          </div>
        </CardContent>
      </Card>

      {/* Previous/Next Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Post */}
        {previousPost ? (
          <Link href={`/${(previousPost as any).categories?.[0]?.toLowerCase() || 'etc'}/${previousPost.slug}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-dashed hover:border-solid hover:border-blue-300 dark:hover:border-blue-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>이전 글</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {previousPost.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(previousPost.date).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-2">
                <ChevronLeft className="h-4 w-4" />
                <span>이전 글</span>
              </div>
              <p className="text-gray-400 dark:text-gray-500">시리즈의 첫 번째 글입니다</p>
            </CardContent>
          </Card>
        )}

        {/* Next Post */}
        {nextPost ? (
          <Link href={`/${(nextPost as any).categories?.[0]?.toLowerCase() || 'etc'}/${nextPost.slug}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-dashed hover:border-solid hover:border-blue-300 dark:hover:border-blue-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>다음 글</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-right">
                  {nextPost.title}
                </h4>
                <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(nextPost.date).toLocaleDateString('ko-KR')}
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-end gap-2 text-sm text-gray-400 dark:text-gray-500 mb-2">
                <span>다음 글</span>
                <ChevronRight className="h-4 w-4" />
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-right">시리즈의 마지막 글입니다</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Posts in Series (if enabled) */}
      {showAllPosts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              시리즈 전체 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedPosts.map((post, index) => (
                <div
                  key={post.slug}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    post.slug === currentPostSlug
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    post.slug === currentPostSlug
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  
                  {post.slug === currentPostSlug ? (
                    <span className="font-medium text-blue-600 dark:text-blue-400 flex-1">
                      {post.title} (현재 글)
                    </span>
                  ) : (
                    <Link 
                      href={`/${((post as any).categories?.[0] || 'etc').toLowerCase()}/${post.slug}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      {post.title}
                    </Link>
                  )}
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}