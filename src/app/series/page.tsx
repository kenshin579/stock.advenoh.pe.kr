import { Metadata } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { generateStructuredData } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: '시리즈',
  description: '투자에 대한 체계적인 시리즈별 콘텐츠를 확인해보세요.',
}

interface SeriesData {
  name: string
  count: number
  posts: Array<{
    title: string
    slug: string
    date: string
    excerpt: string
    categories: string[]
  }>
}

export default async function SeriesPage() {
  const posts = await getAllBlogPosts()
  
  // Group posts by series
  const seriesMap = new Map<string, SeriesData>()
  
  posts.forEach(post => {
    if (post.series) {
      if (!seriesMap.has(post.series)) {
        seriesMap.set(post.series, {
          name: post.series,
          count: 0,
          posts: []
        })
      }
      
      const series = seriesMap.get(post.series)!
      series.count++
      series.posts.push({
        title: post.title,
        slug: post.slug,
        date: post.date,
        excerpt: post.excerpt,
        categories: post.categories
      })
    }
  })

  const seriesList = Array.from(seriesMap.values())
    .sort((a, b) => b.count - a.count)

  const structuredData = generateStructuredData('website', {
    name: '투자 인사이트 - 시리즈',
    description: '체계적인 시리즈별 투자 콘텐츠',
    url: process.env.SITE_URL + '/series'
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">투자 시리즈</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            체계적으로 정리된 시리즈별 투자 콘텐츠를 통해 깊이 있는 투자 지식을 습득하세요.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series) => (
            <div
              key={series.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-3">
                <a 
                  href={`/series/${encodeURIComponent(series.name)}`}
                  className="hover:text-primary"
                >
                  {series.name}
                </a>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {series.count}개의 포스트
              </p>
              
              <div className="space-y-3">
                {series.posts.slice(0, 3).map((post) => (
                  <div key={post.slug} className="border-l-2 border-primary pl-3">
                    <h3 className="font-medium text-sm">
                      <a 
                        href={`/${(post.categories[0] || 'etc').toLowerCase()}/${post.slug}`}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </a>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))}
                
                {series.count > 3 && (
                  <div className="text-sm text-gray-500">
                    +{series.count - 3}개 더
                  </div>
                )}
              </div>
              
              <a
                href={`/series/${encodeURIComponent(series.name)}`}
                className="inline-block mt-4 text-primary hover:underline font-medium"
              >
                시리즈 전체보기 →
              </a>
            </div>
          ))}
        </div>

        {seriesList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              아직 등록된 시리즈가 없습니다.
            </p>
          </div>
        )}
      </div>
    </>
  )
}