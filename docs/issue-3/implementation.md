
# Next.js SSR 전환 구현 가이드

## 1. 프로젝트 초기 설정

### 1.1 Next.js 프로젝트 구조 생성

```bash
# 기존 client 디렉토리를 백업 (모든 기존 코드 보존)
cp -r client client_backup

# 별도 디렉토리에 Next.js 프로젝트 초기화
npx create-next-app@latest client_nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 기존 컴포넌트와 로직을 Next.js 호환으로 점진적 이동
cp -r client_backup/src/components client_nextjs/src/
cp -r client_backup/src/lib client_nextjs/src/
cp -r client_backup/src/hooks client_nextjs/src/

# 기존 contents와 assets 연결 (데이터 무손실)
# contents/ 디렉토리는 그대로 유지
# attached_assets/ → public/ 디렉토리로 이동
```

### 1.2 필수 패키지 설치

```json
// package.json에 추가할 의존성
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@next/font": "^14.0.0",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "unified": "^11.0.4"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 1.3 Next.js 설정 파일

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    typedRoutes: true
  },
  env: {
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://stock.advenoh.pe.kr'
  }
}

module.exports = nextConfig
```

## 2. 페이지 구조 구현

### 2.1 App Router 구조

```
app/
├── layout.tsx              # 루트 레이아웃
├── page.tsx               # 홈페이지 (/)
├── blog/
│   └── [slug]/
│       └── page.tsx       # 블로그 포스트 (/blog/:slug)
├── series/
│   ├── page.tsx          # 시리즈 목록 (/series)
│   └── [seriesName]/
│       └── page.tsx      # 시리즈 상세 (/series/:seriesName)
├── api/
│   ├── blog-posts/
│   │   └── route.ts
│   ├── categories/
│   │   └── route.ts
│   ├── series/
│   │   └── route.ts
│   ├── sitemap.xml/
│   │   └── route.ts
│   └── robots.txt/
│       └── route.ts
├── globals.css
└── not-found.tsx          # 404 페이지
```

### 2.2 루트 레이아웃 구현

```typescript
// app/layout.tsx
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
    template: '%s | 투자 인사이트'
  },
  description: '투자에 대한 깊이 있는 인사이트와 실전 경험을 공유하는 전문 금융 블로그입니다.',
  keywords: ['투자', '주식', 'ETF', '채권', '펀드', '금융', '재테크'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.SITE_URL,
    siteName: '투자 인사이트',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.SITE_URL || 'https://stock.advenoh.pe.kr')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2.3 홈페이지 구현

```typescript
// app/page.tsx
import { Metadata } from 'next'
import { getAllBlogPosts, getAllCategories } from '@/lib/blog'
import Hero from '@/components/hero'
import BlogPostCard from '@/components/blog-post-card'
import CategoryFilter from '@/components/category-filter'
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
      <Hero featuredPosts={featuredPosts} />
      
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">최신 포스트</h2>
        <CategoryFilter categories={categories} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {recentPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  )
}
```

### 2.4 블로그 포스트 페이지 구현

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllBlogPosts, getBlogPost } from '@/lib/blog'
import { generateBlogPostStructuredData } from '@/lib/structured-data'
import MarkdownRenderer from '@/components/markdown-renderer'
import TableOfContents from '@/components/table-of-contents'
import RelatedPosts from '@/components/related-posts'
import Breadcrumb from '@/components/breadcrumb'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)
  
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
  const post = await getBlogPost(params.slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.categories)
  const structuredData = generateBlogPostStructuredData(post)

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
            <MarkdownRenderer content={post.content} />
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
            <RelatedPosts posts={relatedPosts} />
          </div>
        </footer>
      </article>
    </>
  )
}
```

## 3. 데이터 레이어 구현

### 3.1 블로그 데이터 처리 라이브러리

```typescript
// lib/blog.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'contents')

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  formattedDate: string
  author: string
  categories: string[]
  tags: string[]
  featuredImage?: string
  readingTime: number
  series?: string
  seriesOrder?: number
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const allPosts: BlogPost[] = []
  
  function traverseDirectory(dir: string) {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        const indexPath = path.join(itemPath, 'index.md')
        if (fs.existsSync(indexPath)) {
          const post = parseMarkdownFile(indexPath)
          if (post) {
            allPosts.push(post)
          }
        } else {
          traverseDirectory(itemPath)
        }
      }
    }
  }
  
  traverseDirectory(postsDirectory)
  
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllBlogPosts()
  return allPosts.find(post => post.slug === slug) || null
}

export async function getAllCategories(): Promise<Array<{category: string, count: number}>> {
  const posts = await getAllBlogPosts()
  const categoryCount: Record<string, number> = {}
  
  posts.forEach(post => {
    post.categories.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
  })
  
  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

function parseMarkdownFile(filePath: string): BlogPost | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const slug = generateSlugFromPath(filePath)
    const processedContent = remark()
      .use(remarkGfm)
      .use(remarkHtml)
      .processSync(content)
      .toString()
    
    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || extractExcerpt(content),
      content: processedContent,
      date: data.date || new Date().toISOString(),
      formattedDate: formatDate(data.date),
      author: data.author || 'Admin',
      categories: data.categories || inferCategoriesFromPath(filePath),
      tags: data.tags || [],
      featuredImage: data.featuredImage,
      readingTime: calculateReadingTime(content),
      series: data.series,
      seriesOrder: data.seriesOrder
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

function generateSlugFromPath(filePath: string): string {
  const relativePath = path.relative(postsDirectory, filePath)
  const dir = path.dirname(relativePath)
  return dir.replace(/\\/g, '-').replace(/\//g, '-')
}

function inferCategoriesFromPath(filePath: string): string[] {
  const relativePath = path.relative(postsDirectory, filePath)
  const pathParts = relativePath.split(path.sep)
  
  const categoryMap: Record<string, string> = {
    'stock': 'Stock',
    'etf': 'ETF',
    'weekly': 'Weekly',
    'etc': 'Etc'
  }
  
  return pathParts
    .filter(part => part !== 'index.md')
    .map(part => categoryMap[part] || part)
    .slice(0, 1)
}

function extractExcerpt(content: string): string {
  const sentences = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[#*`]/g, '')
    .split(/[.!?]/)
    .filter(s => s.trim().length > 0)
  
  return sentences.slice(0, 2).join('. ') + '.'
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

### 3.2 API Routes 구현

```typescript
// app/api/blog-posts/route.ts
import { NextResponse } from 'next/server'
import { getAllBlogPosts } from '@/lib/blog'

export async function GET() {
  try {
    const posts = await getAllBlogPosts()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}
```

```typescript
// app/api/sitemap.xml/route.ts
import { NextResponse } from 'next/server'
import { getAllBlogPosts } from '@/lib/blog'

export async function GET() {
  const posts = await getAllBlogPosts()
  const baseUrl = process.env.SITE_URL || 'https://stock.advenoh.pe.kr'
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/series</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

## 4. 컴포넌트 마이그레이션

### 4.1 SEO 컴포넌트 업데이트

```typescript
// components/seo-head.tsx (삭제 - Next.js Metadata API 사용)

// lib/structured-data.ts
export function generateBlogPostStructuredData(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "투자 인사이트",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.SITE_URL}/logo.png`
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.SITE_URL}/blog/${post.slug}`
    }
  }
}
```

### 4.2 이미지 컴포넌트 업데이트

```typescript
// components/lazy-image.tsx → components/optimized-image.tsx
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 400,
  className = '',
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`duration-700 ease-in-out ${
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        }`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
```

## 5. 빌드 및 배포 설정

### 5.1 빌드 스크립트 업데이트

```bash
#!/bin/bash
# build-static.sh

echo "Building Next.js application for static export..."

# Next.js 빌드 및 정적 파일 생성
npm run build

# 정적 파일이 out/ 디렉토리에 생성됨
echo "Static files generated in out/ directory"

# Replit 배포를 위해 dist/ 디렉토리로 복사
rm -rf dist/
cp -r out/ dist/

echo "Static build completed!"
echo "Files are ready for deployment in dist/"
```

### 5.2 package.json 스크립트 업데이트

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "build:static": "./build-static.sh",
    "lint": "next lint"
  }
}
```

### 5.3 Replit 배포 설정

```toml
# replit.toml
[deployment]
deploymentTarget = "static"
build = ["npm run build"]
publicDir = "out"

[nix]
channel = "stable-23_05"

[[ports]]
localPort = 3000
externalPort = 80
```

## 6. 테스트 및 검증

### 6.1 기능 테스트 체크리스트

- [ ] 홈페이지 로딩 및 렌더링
- [ ] 블로그 포스트 페이지 접근
- [ ] 시리즈 페이지 기능
- [ ] 검색 기능
- [ ] 카테고리 필터링
- [ ] 반응형 디자인
- [ ] 이미지 최적화
- [ ] 메타 태그 생성
- [ ] 구조화된 데이터
- [ ] 사이트맵 생성

### 6.2 SEO 검증

```bash
# 사이트맵 확인
curl https://your-domain/sitemap.xml

# robots.txt 확인
curl https://your-domain/robots.txt

# 메타 태그 확인 (개별 페이지)
curl -s https://your-domain/blog/post-slug | grep -i "<meta"
```

### 6.3 성능 최적화 확인

- Lighthouse 점수 확인
- Core Web Vitals 측정
- 번들 사이즈 분석
- 이미지 최적화 확인

## 7. 마이그레이션 실행 순서

1. **환경 설정**: Next.js 프로젝트 초기화
2. **기본 구조**: App Router 디렉토리 구조 생성
3. **컴포넌트 이동**: 기존 컴포넌트를 Next.js 형식으로 마이그레이션
4. **페이지 구현**: 각 페이지별 SSG 구현
5. **API Routes**: 기존 Express.js 라우트를 API Routes로 변환
6. **데이터 레이어**: 정적 데이터 생성 로직 구현
7. **SEO 최적화**: 메타데이터 및 구조화된 데이터 구현
8. **빌드 설정**: Static export 설정
9. **배포 설정**: Replit Static 배포 구성
10. **테스트 및 검증**: 기능, SEO, 성능 테스트

이 구현 가이드를 따라 단계별로 진행하면 현재 Vite + React 구조를 Next.js SSG 구조로 성공적으로 전환할 수 있습니다.
