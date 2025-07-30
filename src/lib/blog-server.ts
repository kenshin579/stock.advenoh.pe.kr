// Server-only blog utilities using Node.js modules
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'contents')

import { BlogPost } from '@/types/blog';

// Server-only function for file system access
export async function getAllBlogPostsServer(): Promise<BlogPost[]> {
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

// Server-only function for getting categories
export async function getAllCategoriesServer(): Promise<Array<{ category: string; count: number }>> {
  const posts = await getAllBlogPostsServer()
  const categoryCount: { [key: string]: number } = {}
  
  posts.forEach(post => {
    post.categories.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
  })
  
  return Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count
  })).sort((a, b) => b.count - a.count)
}

// Server-only function for getting single post
export async function getBlogPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPostsServer()
  return posts.find(post => post.slug === slug) || null
}

// Server-only function for getting posts in series
export async function getPostsInSeriesServer(seriesName: string): Promise<BlogPost[]> {
  const posts = await getAllBlogPostsServer()
  return posts
    .filter(post => post.series === seriesName)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
}

function parseMarkdownFile(filePath: string): BlogPost | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Get slug from file path
    const relativePath = path.relative(postsDirectory, filePath)
    const pathParts = relativePath.split(path.sep)
    
    let slug: string
    if (pathParts.length >= 2) {
      slug = pathParts[pathParts.length - 2] // parent directory name
    } else {
      slug = path.basename(filePath, '.md')
    }
    
    // Calculate reading time (approximate)
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    
    // Generate excerpt from content
    const excerpt = content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3)
      .join(' ')
      .substring(0, 200) + '...'
    
    // Format date
    const formattedDate = data.date 
      ? new Date(data.date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : ''
    
    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || excerpt,
      content,
      date: data.date || '',
      formattedDate,
      author: data.author || 'Frank Oh',
      categories: Array.isArray(data.categories) ? data.categories : [data.category || 'etc'].filter(Boolean),
      tags: Array.isArray(data.tags) ? data.tags : [],
      featuredImage: data.featuredImage,
      readingTime,
      series: data.series,
      seriesOrder: data.seriesOrder,
      views: data.views || 0,
      likes: data.likes || 0
    }
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error)
    return null
  }
}