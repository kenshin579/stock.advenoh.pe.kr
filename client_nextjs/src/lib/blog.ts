// Re-export types and functions from appropriate modules
export type { BlogPost } from '@/types/blog'

// For server components, import from blog-server
export {
  getAllBlogPostsServer as getAllBlogPosts,
  getAllCategoriesServer as getAllCategories,
  getBlogPostBySlugServer as getBlogPostBySlug,
  getPostsInSeriesServer as getPostsInSeries
} from './blog-server'

// Utility function to get related posts
export async function getRelatedPosts(slug: string, categories: string[]): Promise<import('@/types/blog').BlogPost[]> {
  const { getAllBlogPostsServer } = await import('./blog-server')
  const allPosts = await getAllBlogPostsServer()
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
    .filter((post: { score: number }) => post.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 3)
  
  return relatedPosts.map(({ score, ...post }) => post)
}

// Simple wrapper for getBlogPostBySlug
export async function getBlogPost(slug: string): Promise<import('@/types/blog').BlogPost | null> {
  const { getBlogPostBySlugServer } = await import('./blog-server')
  return getBlogPostBySlugServer(slug)
}