import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts, getAllCategories } from '@/lib/blog'
import { Hero } from '@/components/hero'
import { BlogPostCard } from '@/components/blog-post-card'
import { CategoryFilterClient } from '@/components/category-filter-client'
import { TagCloudSection } from '@/components/tag-cloud-section'
import { LoadMoreButton } from '@/components/load-more-button'
import { generateStructuredData } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
  description: '투자에 대한 깊이 있는 인사이트와 실전 경험을 공유하는 전문 금융 블로그입니다.',
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; tags?: string; page?: string }>
}) {
  const posts = await getAllBlogPosts()
  let categories = await getAllCategories()
  
  // Ensure categories is an array
  if (!Array.isArray(categories)) {
    console.error('getAllCategories returned non-array:', categories)
    categories = []
  }
  const params = await searchParams
  
  // 필터링 로직
  const selectedCategory = params.category || 'all'
  const searchTerm = params.search || ''
  const selectedTags = params.tags ? [params.tags] : []
  const currentPage = parseInt(params.page || '1')
  const postsPerPage = 9

  // 카테고리 필터링
  let filteredPosts = posts
  if (selectedCategory !== 'all') {
    const selectedLower = selectedCategory.toLowerCase()
    filteredPosts = posts.filter(post =>
      post.categories.some(c => c.toLowerCase() === selectedLower)
    )
  }

  // 검색 필터링
  if (searchTerm) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // 태그 필터링
  if (selectedTags.length > 0) {
    filteredPosts = filteredPosts.filter(post => 
      selectedTags.some(tag => post.tags.includes(tag))
    )
  }

  // 날짜순 정렬
  const sortedPosts = filteredPosts.sort((a, b) => {
    const dateA = new Date(a.date || 0)
    const dateB = new Date(b.date || 0)
    return dateB.getTime() - dateA.getTime()
  })

  // 페이지네이션
  const paginatedPosts = sortedPosts.slice(0, currentPage * postsPerPage)
  const hasMore = sortedPosts.length > currentPage * postsPerPage

  const structuredData = generateStructuredData('website', {
    name: '투자 인사이트',
    description: '투자에 대한 깊이 있는 인사이트와 실전 경험을 공유하는 전문 금융 블로그입니다.',
    url: process.env.SITE_URL
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Hero />
      
      {/* Category Filter */}
      <CategoryFilterClient 
        categories={categories}
        selectedCategory={selectedCategory}
        searchTerm={searchTerm}
        selectedTags={selectedTags}
      />

      {/* Main Content */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-center">
              {searchTerm ? `"${searchTerm}" 검색 결과` : 
               selectedTags.length > 0 ? `"${selectedTags[0]}" 태그 글` : 
               '최신 투자 인사이트'}
            </h2>
            {(searchTerm || selectedTags.length > 0) && (
              <p className="text-muted-foreground">
                {sortedPosts.length}개의 글을 찾았습니다
              </p>
            )}
          </div>

          {sortedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? '검색 결과가 없습니다.' : 
                 selectedTags.length > 0 ? '해당 태그의 글이 없습니다.' : 
                 '아직 게시된 글이 없습니다.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>

              <LoadMoreButton
                currentPage={currentPage}
                hasMore={hasMore}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                selectedTags={selectedTags}
              />
            </>
          )}
        </div>
      </main>

      {/* Tag Cloud Section */}
      <TagCloudSection posts={posts} />
    </div>
  )
}