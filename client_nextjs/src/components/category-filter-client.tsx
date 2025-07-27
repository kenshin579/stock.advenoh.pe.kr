'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BlogPostCard } from '@/components/blog-post-card'
import { BlogPost } from '@/lib/blog'

interface Category {
  category: string;
  count: number;
}

interface CategoryFilterClientProps {
  categories: Category[];
  initialPosts: BlogPost[];
}

export function CategoryFilterClient({ categories, initialPosts }: CategoryFilterClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const allCategories = [
    { id: "all", label: "전체" },
    ...categories.map(({ category }) => ({
      id: category,
      label: category
    }))
  ]

  const filteredPosts = selectedCategory === 'all' 
    ? initialPosts 
    : initialPosts.filter(post => post.categories?.includes(selectedCategory))

  const displayPosts = filteredPosts.slice(0, 12)

  return (
    <>
      {/* Category Filter Section */}
      <section className="bg-background py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {allCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`category-filter px-6 py-2 rounded-full font-medium ${
                  selectedCategory === category.id 
                    ? "active bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Posts Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">최신 투자 인사이트</h2>
          <p className="text-muted-foreground">
            {selectedCategory === 'all' 
              ? '투자에 대한 깊이 있는 분석과 인사이트를 만나보세요' 
              : `${selectedCategory} 카테고리의 최신 포스트`}
          </p>
        </div>
        
        {displayPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
            
            {filteredPosts.length > 12 && (
              <div className="text-center mt-12">
                <Link 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  더 많은 포스트 보기
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {selectedCategory === 'all' 
                ? '포스트를 불러오는 중입니다...' 
                : `${selectedCategory} 카테고리에 포스트가 없습니다.`}
            </p>
          </div>
        )}
      </section>
    </>
  )
}