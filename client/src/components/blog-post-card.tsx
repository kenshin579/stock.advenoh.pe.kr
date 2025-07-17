import { Link } from "wouter";
import { Eye, Heart, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@shared/schema";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "stocks":
        return "bg-primary text-primary-foreground";
      case "etf":
        return "bg-success text-success-foreground";
      case "bonds":
        return "bg-purple-500 text-white";
      case "funds":
        return "bg-orange-500 text-white";
      case "analysis":
        return "bg-info text-info-foreground";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "stocks":
        return "주식";
      case "etf":
        return "ETF";
      case "bonds":
        return "채권";
      case "funds":
        return "펀드";
      case "analysis":
        return "시장분석";
      default:
        return category;
    }
  };

  return (
    <Card className="card-hover overflow-hidden">
      <div className="relative">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        )}
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
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.createdAt!).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.likes || 0}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
