import { getAllCategoriesServer } from '@/lib/blog-server'
import { handleApiErrorWithPerformance } from '@/lib/error-handling'

export const dynamic = 'force-static'

export async function GET() {
  return handleApiErrorWithPerformance(
    async () => {
      const categories = await getAllCategoriesServer()
      return Response.json(categories)
    },
    'getAllCategories',
    '카테고리를 불러오는데 실패했습니다.'
  )
}