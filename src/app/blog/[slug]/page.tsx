import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from '@/lib/blog'
import { generateStructuredData } from '@/lib/structured-data'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { TableOfContents } from '@/components/table-of-contents'
import { RelatedPosts } from '@/components/related-posts'
import { Breadcrumb } from '@/components/breadcrumb'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

// ISR 설정: 1시간마다 재생성
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const posts = await getAllBlogPosts()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getBlogPost(slug)
    
    if (!post) {
      return {}
    }

    return {
      title: post.title,
      description: post.excerpt,
      keywords: [...post.tags, ...post.categories],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.date,
        authors: [post.author],
        tags: post.tags,
        images: post.featuredImage ? [
          {
            url: post.featuredImage,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {}
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params
    const post = await getBlogPost(slug)
    
    if (!post) {
      notFound()
    }

    const relatedPosts = await getRelatedPosts(post.slug, post.categories)
    const structuredData = generateStructuredData('article', post)

    const getCategoryColor = (category: string) => {
      switch (category?.toLowerCase()) {
        case "stock":
          return "bg-blue-500 text-white";
        case "etf":
          return "bg-green-500 text-white";
        case "bonds":
          return "bg-purple-500 text-white";
        case "funds":
          return "bg-orange-500 text-white";
        case "analysis":
          return "bg-red-500 text-white";
        case "etc":
          return "bg-gray-500 text-white";
        case "weekly":
          return "bg-indigo-500 text-white";
        default:
          return "bg-slate-500 text-white";
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        <article className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto px-4 py-8">
            <Breadcrumb
              items={[
                { label: '홈', href: '/' },
                { label: '블로그', href: '/blog' },
                { label: post.title, href: `/blog/${post.slug}` }
              ]}
            />
            
            <header className="mb-8 pb-8 border-b border-border">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight">{post.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/profile.jpeg" alt="Frank Oh" />
                    <AvatarFallback>FO</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Frank Oh</span>
                </div>
                <span>•</span>
                <time dateTime={post.date} className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{post.formattedDate}</span>
                </time>
                <span>•</span>
                <span>📖 {post.readingTime}분 읽기</span>
                <span>•</span>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Badge key={category} className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                  ))}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {post.featuredImage && (
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-3/4 order-2 lg:order-1">
                <div className="markdown-content max-w-none">
                  <MarkdownRenderer 
                    content={post.content} 
                    slug={post.slug}
                    category={post.categories[0]}
                  />
                </div>
              </div>
              
              <aside className="lg:w-1/4 order-1 lg:order-2">
                <div className="sticky top-8 space-y-6">
                  <TableOfContents content={post.content} />
                </div>
              </aside>
            </div>

            <footer className="mt-12 border-t border-border pt-8">
              <RelatedPosts posts={relatedPosts} currentPost={post} />
              
              {/* Author bio */}
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="/profile.jpeg" alt="Frank Oh" />
                    <AvatarFallback>FO</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Frank Oh</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      투자 분석가로서 국내외 주식, ETF, 채권, 펀드에 대한 깊이 있는 분석과 
                      실전 투자 경험을 바탕으로 한 인사이트를 공유합니다. 
                      데이터 기반의 객관적 분석을 통해 투자자들에게 도움이 되는 정보를 전달하고자 합니다.
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </article>
      </>
    )
  } catch (error) {
    console.error('Error rendering blog post:', error)
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">포스트를 불러올 수 없습니다</h1>
            <p className="text-muted-foreground mb-4">
              요청하신 포스트를 불러오는 중 오류가 발생했습니다.
            </p>
            <a 
              href="/blog" 
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              블로그 목록으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }
}