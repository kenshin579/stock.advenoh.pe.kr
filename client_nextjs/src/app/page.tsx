import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts, getAllCategories } from '@/lib/blog'
import { Hero } from '@/components/hero'
import { BlogPostCard } from '@/components/blog-post-card'
import { CategoryFilter } from '@/components/category-filter'
import { generateStructuredData } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
  description: '투자에 대한 깊이 있는 인사이트와 실전 경험을 공유하는 전문 금융 블로그입니다.',
}

export default async function HomePage() {
  const posts = await getAllBlogPosts()
  const categories = await getAllCategories()
  const featuredPosts = posts.slice(0, 6)
  const recentPosts = posts.slice(0, 10)

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
      
      {/* Featured Posts Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">최신 포스트</h2>
          <p className="text-muted-foreground">투자에 대한 깊이 있는 인사이트를 만나보세요</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
        
        {posts.length > 10 && (
          <div className="text-center mt-12">
            <Link 
              href="/blog" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              더 많은 포스트 보기
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </section>
      
      {/* Newsletter Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">투자 인사이트 뉴스레터</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            매주 엄선된 투자 정보와 시장 분석을 이메일로 받아보세요. 
            전문가의 시각으로 바라본 투자 인사이트를 놓치지 마세요.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
            />
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              구독하기
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}