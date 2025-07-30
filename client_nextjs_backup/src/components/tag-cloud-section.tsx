'use client'

import { TagCloud, extractTagsWithCounts } from './tag-cloud'
import { BlogPost } from '@/types/blog'

interface TagCloudSectionProps {
  posts: BlogPost[]
}

export function TagCloudSection({ posts }: TagCloudSectionProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TagCloud 
          tags={extractTagsWithCounts(posts)}
          maxTags={30}
          showCount={true}
          size="md"
        />
      </div>
    </section>
  )
} 