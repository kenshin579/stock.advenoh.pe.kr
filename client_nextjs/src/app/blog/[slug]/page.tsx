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
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
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
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.categories)
  const structuredData = generateStructuredData('article', post)

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
                  <AvatarImage src="/images/profile.jpg" alt="Frank Oh" />
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
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
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
            
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <div className="markdown-content max-w-none">
                <MarkdownRenderer content={post.content} />
              </div>
            </div>
            
            <aside className="lg:w-1/4">
              <div className="sticky top-8 space-y-6">
                <TableOfContents content={post.content} />
                
                {/* Share buttons could go here */}
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">이 글이 도움이 되셨나요?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    더 많은 투자 인사이트를 받아보세요
                  </p>
                  <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
                    뉴스레터 구독하기
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer className="mt-12 border-t border-border pt-8">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">태그</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
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
      </article>
    </>
  )
}