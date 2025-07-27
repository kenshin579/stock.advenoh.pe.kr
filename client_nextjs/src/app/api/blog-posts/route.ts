import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPostsServer } from '@/lib/blog-server';

/**
 * 블로그 포스트 목록 API
 * 
 * GET /api/blog-posts
 * 
 * 쿼리 파라미터:
 * - category: 카테고리 필터링 (선택사항)
 * - search: 검색어 필터링 (선택사항)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 포스트 수 (기본값: 10)
 * 
 * 응답:
 * - posts: 블로그 포스트 배열
 * - total: 전체 포스트 수
 * - page: 현재 페이지
 * - totalPages: 전체 페이지 수
 * 
 * 예시:
 * GET /api/blog-posts?category=stock&search=투자&page=1&limit=5
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // 유효성 검사
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // 모든 블로그 포스트 가져오기
    const allPosts = await getAllBlogPostsServer();
    
    // 필터링 적용
    let filteredPosts = allPosts;
    
    // 카테고리 필터링
    if (category) {
      filteredPosts = filteredPosts.filter(post => 
        post.categories.some(cat => 
          cat.toLowerCase().includes(category.toLowerCase())
        )
      );
    }
    
    // 검색어 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }
    
    // 페이지네이션 적용
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const posts = filteredPosts.slice(startIndex, endIndex);
    
    // 응답 데이터 구성
    const response = {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        category: category || null,
        search: search || null,
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('API Error in /api/blog-posts:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: '블로그 포스트를 가져오는 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * 블로그 포스트 생성 API (향후 구현 예정)
 * 
 * POST /api/blog-posts
 * 
 * 요청 본문:
 * - title: 포스트 제목
 * - content: 포스트 내용
 * - excerpt: 포스트 요약
 * - categories: 카테고리 배열
 * - tags: 태그 배열
 * - featuredImage: 대표 이미지 URL
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not implemented' },
    { status: 501 }
  );
}