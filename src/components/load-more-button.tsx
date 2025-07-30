'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface LoadMoreButtonProps {
  currentPage: number
  hasMore: boolean
  selectedCategory: string
  searchTerm: string
  selectedTags: string[]
}

export function LoadMoreButton({
  currentPage,
  hasMore,
  selectedCategory,
  searchTerm,
  selectedTags
}: LoadMoreButtonProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = () => {
    if (isLoading) return

    setIsLoading(true)
    
    // 현재 스크롤 위치 저장
    const currentScrollY = window.scrollY
    
    // 새로운 URL 생성
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('page', (currentPage + 1).toString())
    
    // URL 업데이트 (스크롤 위치 유지)
    router.push(`/?${newSearchParams.toString()}`, { scroll: false })
    
    // 스크롤 위치 복원 및 로딩 상태 해제
    setTimeout(() => {
      window.scrollTo(0, currentScrollY)
      setIsLoading(false)
    }, 500)
  }

  if (!hasMore) return null

  return (
    <div className="text-center mt-12">
      <button
        onClick={handleLoadMore}
        disabled={isLoading}
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '로딩 중...' : '더 보기'}
      </button>
    </div>
  )
} 