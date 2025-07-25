import { Link } from "wouter";
import { Calendar, Heart, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BlogPost } from "@shared/schema";
import { getCoverImage } from "@/lib/image-utils";
import { formatDateSafely, getBestDateFromPost } from "@/lib/date-utils";
import profileImage from "@assets/profile.jpeg";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
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
    // 마크다운 파일의 category 값을 그대로 사용
    return category;
  };

  // Get cover image using the utility function
  const coverImage = getCoverImage(post);

  return (
    <Card className="card-hover overflow-hidden">
      <div className="relative">
        <img
          src={coverImage}
          alt={`${post.title} - ${post.category} 관련 이미지`}
          className="w-full h-48 object-cover bg-gray-100 dark:bg-gray-800"
          loading="lazy"
          onError={(e) => {
            // Fallback to default image if cover image fails to load
            const target = e.target as HTMLImageElement;
            const defaultImageUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format';
            if (target.src !== defaultImageUrl) {
              target.src = defaultImageUrl;
            }
          }}
        />
        <div className="absolute top-4 left-4">
          <Badge className={getCategoryColor(post.category)}>
            {getCategoryLabel(post.category)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-3 text-card-foreground">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        {/* Author and date info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={profileImage} alt="Frank" />
              <AvatarFallback>F</AvatarFallback>
            </Avatar>
            <span>Frank</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDateSafely(getBestDateFromPost(post))}</span>
          </div>
        </div>

        {/* Engagement metrics */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0}</span>
            </div>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            자세히 보기 →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}