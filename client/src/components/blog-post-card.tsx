import { Link } from "wouter";
import { Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@shared/schema";

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
  };용
    return category;
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
        </div>
      </CardContent>
    </Card>
  );
}