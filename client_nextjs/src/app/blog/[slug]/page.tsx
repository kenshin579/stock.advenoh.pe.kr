import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from '@/lib/blog'
import { generateStructuredData } from '@/lib/structured-data'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { TableOfContents } from '@/components/table-of-contents'
import { RelatedPosts } from '@/components/related-posts'
import { Breadcrumb } from '@/components/breadcrumb'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

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
      
      <article className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: '홈', href: '/' },
            { label: '블로그', href: '/blog' },
            { label: post.title, href: `/blog/${post.slug}` }
          ]}
        />
        
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
            <time dateTime={post.date}>{post.formattedDate}</time>
            <span>•</span>
            <span>{post.readingTime}분 읽기</span>
            <span>•</span>
            <span>{post.categories.join(', ')}</span>
          </div>
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <div className="markdown-content prose prose-gray dark:prose-invert max-w-none">
              <MarkdownRenderer content={post.content} />
            </div>
          </div>
          
          <aside className="lg:w-1/4">
            <div className="sticky top-8">
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>

        <footer className="mt-12">
          <div className="border-t pt-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <RelatedPosts posts={relatedPosts} currentPost={post} />
          </div>
        </footer>
      </article>
    </>
  )
}