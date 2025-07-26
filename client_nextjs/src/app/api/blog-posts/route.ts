import { NextResponse } from 'next/server'
import { getAllBlogPostsServer } from '@/lib/blog-server'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const posts = await getAllBlogPostsServer()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}