import { NextResponse } from 'next/server'
import { getAllCategoriesServer } from '@/lib/blog-server'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const categories = await getAllCategoriesServer()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}