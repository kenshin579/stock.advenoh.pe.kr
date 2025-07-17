import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { CategoryFilter } from "@/components/category-filter";
import { BlogPostCard } from "@/components/blog-post-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Footer } from "@/components/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogPost } from "@shared/schema";
import { generateBlogStructuredData, getBaseUrl } from "@/lib/seo";

export default function Home() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const category = urlParams.get('category') || 'all';
    const search = urlParams.get('search') || '';
    
    setSelectedCategory(category);
    setSearchTerm(search);
    setPage(1); // Reset page when filters change
  }, [location]);

  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts', { published: true, category: selectedCategory !== 'all' ? selectedCategory : undefined, search: searchTerm }],
    queryFn: async ({ queryKey }) => {
      const [path, params] = queryKey;
      const searchParams = new URLSearchParams();
      
      if (params.published) {
        searchParams.append('published', 'true');
      }
      if (params.category) {
        searchParams.append('category', params.category);
      }
      if (params.search) {
        searchParams.append('search', params.search);
      }
      
      const response = await fetch(`${path}?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const url = category === 'all' ? '/' : `/?category=${category}`;
    window.history.pushState({}, '', url);
  };

  const paginatedPosts = posts?.slice(0, page * postsPerPage) || [];
  const hasMore = posts && posts.length > page * postsPerPage;

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const baseUrl = getBaseUrl();
  const structuredData = generateBlogStructuredData(baseUrl);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="투자 인사이트 블로그 - 주식, ETF, 채권, 펀드 전문 블로그"
        description="국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석을 제공하는 개인 블로그입니다."
        keywords="주식, ETF, 채권, 펀드, 투자, 재테크, 금융, 투자분석, 포트폴리오"
        ogTitle="투자 인사이트 블로그"
        ogDescription="국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석"
        ogUrl={baseUrl}
        canonicalUrl={baseUrl}
        structuredData={structuredData}
      />
      
      <Header />
      <Hero />
      
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-center">
              {searchTerm ? `"${searchTerm}" 검색 결과` : '최신 투자 인사이트'}
            </h2>
            {searchTerm && (
              <p className="text-muted-foreground">
                {posts?.length || 0}개의 글을 찾았습니다
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">
                글을 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? '검색 결과가 없습니다.' : '아직 게시된 글이 없습니다.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
                  <Button 
                    onClick={loadMore}
                    className="btn-primary"
                  >
                    더 많은 글 보기
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <NewsletterSignup />
      <Footer />
    </div>
  );
}
