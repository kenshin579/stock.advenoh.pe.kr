import { getAllBlogPostsServer } from '@/lib/blog-server'
import { handleApiErrorWithPerformance } from '@/lib/error-handling'

export const dynamic = 'force-static'

export async function GET() {
  return handleApiErrorWithPerformance(
    async () => {
      const posts = await getAllBlogPostsServer()
      return posts
    },
    'getAllBlogPosts',
    '블로그 포스트를 불러오는데 실패했습니다.'
  )
}