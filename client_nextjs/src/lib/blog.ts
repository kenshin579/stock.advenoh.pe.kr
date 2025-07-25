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

export async function getRelatedPosts(slug: string, categories: string[]): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts()
  const currentPost = allPosts.find(post => post.slug === slug)
  
  if (!currentPost) return []
  
  const relatedPosts = allPosts
    .filter(post => post.slug !== slug)
    .map(post => {
      let score = 0
      
      // Series match (highest priority)
      if (currentPost.series && post.series === currentPost.series) {
        score += 50
      }
      
      // Category match
      const categoryMatches = post.categories.filter(cat => categories.includes(cat)).length
      score += categoryMatches * 20
      
      // Tag match
      const tagMatches = post.tags.filter(tag => currentPost.tags.includes(tag)).length
      score += tagMatches * 10
      
      return { ...post, score }
    })
    .filter(post => post.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  
  return relatedPosts
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
      author: data.author || 'Frank Oh',
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