// Image SEO utilities for alt tag generation and optimization

interface ImageOptimizationOptions {
  enableWebP?: boolean;
  enableLazyLoading?: boolean;
  quality?: number;
}

// Generate alt text from filename
export function generateAltFromFilename(filename: string): string {
  if (!filename) return '';
  
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Convert underscores and hyphens to spaces
  let alt = nameWithoutExt.replace(/[_-]/g, ' ');
  
  // Remove common prefixes/suffixes
  alt = alt.replace(/^(img|image|pic|picture|photo)[\s_-]*/i, '');
  alt = alt.replace(/[\s_-]*(img|image|pic|picture|photo)$/i, '');
  
  // Convert camelCase to spaces
  alt = alt.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Clean up multiple spaces
  alt = alt.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  alt = alt.charAt(0).toUpperCase() + alt.slice(1);
  
  return alt || 'Image';
}

// Generate contextual alt text based on content
export function generateContextualAlt(
  filename: string, 
  context?: {
    postTitle?: string;
    category?: string;
    tags?: string[];
    caption?: string;
  }
): string {
  if (context?.caption) {
    return context.caption;
  }
  
  const baseAlt = generateAltFromFilename(filename);
  
  if (!context) return baseAlt;
  
  // Add context from category if relevant to investments
  const investmentTerms = ['stock', 'etf', 'bond', 'fund', 'chart', 'graph', 'analysis'];
  const categoryContext = context.category?.toLowerCase();
  
  if (categoryContext && investmentTerms.some(term => 
    categoryContext.includes(term) || baseAlt.toLowerCase().includes(term)
  )) {
    return `${baseAlt} - ${context.category} 관련 이미지`;
  }
  
  // Add context from tags
  if (context.tags && context.tags.length > 0) {
    const relevantTag = context.tags.find(tag => 
      investmentTerms.some(term => tag.toLowerCase().includes(term))
    );
    if (relevantTag) {
      return `${baseAlt} - ${relevantTag} 관련`;
    }
  }
  
  return baseAlt;
}

// Check if browser supports WebP
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Generate responsive image srcset
export function generateSrcSet(baseUrl: string, sizes: number[] = [400, 800, 1200]): string {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
}

// Optimize image loading attributes
export function getOptimizedImageProps(
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) {
  const {
    enableWebP = true,
    enableLazyLoading = true,
    quality = 85
  } = options;
  
  const props: Record<string, string> = {
    src,
    alt,
    loading: enableLazyLoading ? 'lazy' : 'eager',
    decoding: 'async'
  };
  
  // Add quality parameter if supported
  if (src.includes('?')) {
    props.src = `${src}&q=${quality}`;
  } else {
    props.src = `${src}?q=${quality}`;
  }
  
  return props;
}

// Extract images from markdown content for sitemap generation
export function extractImagesFromMarkdown(content: string): Array<{
  src: string;
  alt?: string;
  title?: string;
}> {
  const images: Array<{ src: string; alt?: string; title?: string }> = [];
  
  // Handle complex nested patterns like ![![alt](img1)](img2)
  // First, extract all image references from nested patterns
  const nestedImageRegex = /!\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = nestedImageRegex.exec(content)) !== null) {
    // For nested patterns, use the first image (img1) as it's usually the actual content image
    images.push({
      src: match[2],
      alt: match[1] || undefined
    });
  }
  
  // Match standard ![alt](src "title") and ![alt](src) patterns
  // But skip content that's already been processed by nested regex
  const processedContent = content.replace(nestedImageRegex, '');
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  
  while ((match = imageRegex.exec(processedContent)) !== null) {
    images.push({
      src: match[2],
      alt: match[1] || undefined,
      title: match[3] || undefined
    });
  }
  
  // Also match HTML img tags
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  
  while ((match = htmlImageRegex.exec(processedContent)) !== null) {
    images.push({
      src: match[1],
      alt: match[2] || undefined
    });
  }
  
  return images;
}

// Validate image accessibility
export function validateImageAccessibility(img: HTMLImageElement): {
  hasAlt: boolean;
  altQuality: 'good' | 'poor' | 'missing';
  suggestions: string[];
} {
  const suggestions: string[] = [];
  const alt = img.alt;
  
  if (!alt) {
    return {
      hasAlt: false,
      altQuality: 'missing',
      suggestions: ['Add descriptive alt text for screen readers']
    };
  }
  
  // Check alt text quality
  const altLength = alt.length;
  const hasGenericTerms = /^(image|picture|photo|img)$/i.test(alt.trim());
  const hasGoodDescription = altLength > 5 && altLength < 125 && !hasGenericTerms;
  
  if (hasGenericTerms) {
    suggestions.push('Use more descriptive alt text instead of generic terms');
  }
  
  if (altLength > 125) {
    suggestions.push('Alt text is too long (>125 characters), consider shortening');
  }
  
  if (altLength < 5) {
    suggestions.push('Alt text is too short, add more description');
  }
  
  return {
    hasAlt: true,
    altQuality: hasGoodDescription ? 'good' : 'poor',
    suggestions
  };
}

// Get cover image for blog post
export function getCoverImage(post?: { featuredImage?: string | null; category?: string; content?: string; slug?: string; categories?: string[] }): string {
  // Use featured image if available and not null
  if (post?.featuredImage && post.featuredImage !== null && post.featuredImage !== '') {
    return post.featuredImage;
  }
  
  // Extract first image from content if available
  if (post?.content && post.slug) {
    const images = extractImagesFromMarkdown(post.content);
    
    if (images.length > 0) {
      let imageSrc = images[0].src;
      
      // Convert relative image paths to absolute paths
      if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
        // For contents directory images, construct the full path
        const category = post.category || post.categories?.[0] || 'stock';
        imageSrc = `/contents/${category.toLowerCase()}/${post.slug}/${imageSrc}`;
      } else if (imageSrc.startsWith('/contents/')) {
        // Ensure proper path for contents images
        imageSrc = imageSrc;
      } else if (imageSrc.startsWith('http')) {
        // External image URLs
        return imageSrc;
      }
      
      return imageSrc;
    }
  }
  
  // Always return default image for consistent display
  // Use a reliable investment-themed stock chart image as default
  return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format';
}