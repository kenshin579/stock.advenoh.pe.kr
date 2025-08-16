'use client'

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Heart, Eye } from "lucide-react";
import { BlogPost } from "@/lib/blog";
import { OptimizedImage } from "@/components/image";
import { getCoverImage } from "@/lib/image-utils";

interface BlogPostCardProps {
  post: BlogPost;
}

function formatDateSafely(date: string | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return '';
  }
}

function getBestDateFromPost(post: BlogPost): string {
  return post.date || post.formattedDate || '';
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "stock":
        return "bg-blue-500 text-white";
      case "etf":
        return "bg-green-500 text-white";
      case "bonds":
        return "bg-purple-500 text-white";
      case "funds":
        return "bg-orange-500 text-white";
      case "analysis":
        return "bg-red-500 text-white";
      case "etc":
        return "bg-gray-500 text-white";
      case "weekly":
        return "bg-indigo-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category || "기타";
  };

  // Use getCoverImage function for better image handling
  const coverImage = getCoverImage(post);

  const bestDate = getBestDateFromPost(post);
  const formattedDate = formatDateSafely(bestDate);

  return (
    <Card className="card-hover overflow-hidden bg-card text-card-foreground border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative">
        <OptimizedImage
          src={coverImage}
          alt={`${post.title} - ${post.categories?.[0] || 'investment'} 관련 이미지`}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className={getCategoryColor(post.categories?.[0] || 'default')}>
            {getCategoryLabel(post.categories?.[0] || 'General')}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <CardTitle className="mb-3 text-lg font-semibold leading-tight">
          <Link 
            href={`/${(post.categories?.[0] || 'etc').toLowerCase()}/${post.slug}`} 
            className="hover:text-primary transition-colors duration-200 line-clamp-2"
          >
            {post.title}
          </Link>
        </CardTitle>
        
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0}</span>
            </div>
            {post.likes && post.likes > 0 && (
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likes}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src="/profile.jpeg" alt="Frank Oh" />
              <AvatarFallback>FO</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Frank</span>
          </div>
        </div>
        
        {post.readingTime && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-muted-foreground">
              📖 {post.readingTime}분 읽기
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}