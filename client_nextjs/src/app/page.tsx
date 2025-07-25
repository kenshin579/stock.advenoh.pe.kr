import { Metadata } from 'next'
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero />
      
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">최신 포스트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {recentPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  )
}