import { NextResponse } from 'next/server'
import { getAllBlogPosts } from '@/lib/blog'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const posts = await getAllBlogPosts()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}