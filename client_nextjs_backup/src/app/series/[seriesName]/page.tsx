import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBlogPosts } from '@/lib/blog'
import { generateStructuredData } from '@/lib/structured-data'
import { BlogPostCard } from '@/components/blog-post-card'
import { Breadcrumb } from '@/components/breadcrumb'

interface SeriesDetailPageProps {
  params: Promise<{
    seriesName: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  const seriesSet = new Set<string>()
  
  posts.forEach(post => {
    if (post.series) {
      seriesSet.add(post.series)
    }
  })
  
  return Array.from(seriesSet).map((series) => ({
    seriesName: encodeURIComponent(series),
  }))
}

export async function generateMetadata({ params }: SeriesDetailPageProps): Promise<Metadata> {
  const { seriesName: rawSeriesName } = await params
  const seriesName = decodeURIComponent(rawSeriesName)
  const posts = await getAllBlogPosts()
  const seriesPosts = posts.filter(post => post.series === seriesName)
  
  if (seriesPosts.length === 0) {
    return {}
  }

  return {
    title: `${seriesName} 시리즈`,
    description: `${seriesName} 시리즈의 모든 포스트를 확인해보세요. 총 ${seriesPosts.length}개의 포스트가 있습니다.`,
  }
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { seriesName: rawSeriesName } = await params
  const seriesName = decodeURIComponent(rawSeriesName)
  const posts = await getAllBlogPosts()
  const seriesPosts = posts.filter(post => post.series === seriesName)
  
  if (seriesPosts.length === 0) {
    notFound()
  }

  // Sort by series order if available, otherwise by date
  seriesPosts.sort((a, b) => {
    if (a.seriesOrder && b.seriesOrder) {
      return a.seriesOrder - b.seriesOrder
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const structuredData = generateStructuredData('website', {
    name: `${seriesName} 시리즈`,
    description: `${seriesName} 시리즈의 모든 포스트`,
    url: process.env.SITE_URL + `/series/${encodeURIComponent(seriesName)}`
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: '홈', href: '/' },
            { label: '시리즈', href: '/series' },
            { label: seriesName, href: `/series/${encodeURIComponent(seriesName)}` }
          ]}
        />
        
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{seriesName}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            총 {seriesPosts.length}개의 포스트
          </p>
          
          {/* Series description from first post if available */}
          {seriesPosts[0]?.excerpt && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300">
                {seriesPosts[0].excerpt}
              </p>
            </div>
          )}
        </header>

        <div className="space-y-6">
          {seriesPosts.map((post, index) => (
            <div key={post.slug} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {post.seriesOrder || index + 1}
              </div>
              <div className="flex-1">
                <BlogPostCard post={post} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/series"
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            ← 다른 시리즈 보기
          </Link>
        </div>
      </div>
    </>
  )
}