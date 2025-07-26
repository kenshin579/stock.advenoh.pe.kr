import { NextResponse } from 'next/server'
import { getAllCategories } from '@/lib/blog'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const categories = await getAllCategories()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}