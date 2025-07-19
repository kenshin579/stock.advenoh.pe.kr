import { Link } from "wouter";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BlogPost } from "@shared/schema";
import { getCoverImage } from "@/lib/image-utils";

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
          alt={post.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback to default image if cover image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== getCoverImage({ ...post, featuredImage: undefined, content: '' })) {
              target.src = getCoverImage({ ...post, featuredImage: undefined, content: '' });
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
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src="/profile.jpeg" alt="Frank" />
              <AvatarFallback>F</AvatarFallback>
            </Avatar>
            <span>Frank</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.createdAt!).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}