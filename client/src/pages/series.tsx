import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookOpen, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SeriesInfo {
  name: string;
  count: number;
  latestDate: string;
  posts: Array<{
    title: string;
    slug: string;
    date: string;
  }>;
}

export default function SeriesPage() {
  // Fetch series data from API
  const { data: series, isLoading, error } = useQuery<SeriesInfo[]>({
    queryKey: ['/api/series'],
    queryFn: async () => {
      const response = await fetch('/api/series');
      if (!response.ok) {
        throw new Error('Failed to fetch series');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              시리즈를 불러올 수 없습니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              잠시 후 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            시리즈
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {series?.length ? `총 ${series.length}개의 시리즈가 있습니다.` : "시리즈가 없습니다."}
          </p>
        </div>

        {/* Series Grid */}
        {series && series.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {series.map((seriesItem) => (
              <Link key={seriesItem.name} href={`/series/${encodeURIComponent(seriesItem.name)}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-start gap-2">
                      <BookOpen className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                      <span className="line-clamp-2">{seriesItem.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {seriesItem.count}개 게시물
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(seriesItem.latestDate).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      
                      {/* Preview of latest posts */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">최근 게시물:</p>
                        {seriesItem.posts.slice(0, 2).map((post) => (
                          <p key={post.slug} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            • {post.title}
                          </p>
                        ))}
                        {seriesItem.count > 2 && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            외 {seriesItem.count - 2}개 게시물...
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              아직 시리즈가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              시리즈 게시물이 추가되면 여기에 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}