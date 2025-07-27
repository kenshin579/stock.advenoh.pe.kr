// Server-side image utilities

// Extract images from markdown content
export function extractImagesFromMarkdown(content: string): Array<{
  src: string;
  alt?: string;
  title?: string;
}> {
  if (!content) return [];

  const images: Array<{
    src: string;
    alt?: string;
    title?: string;
  }> = [];

  // Match markdown image syntax: ![alt](src "title")
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const [, alt, src, title] = match;
    images.push({
      src: src.trim(),
      alt: alt?.trim() || undefined,
      title: title?.trim() || undefined,
    });
  }

  // Also match HTML img tags
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImgRegex.exec(content)) !== null) {
    const imgTag = match[0];
    const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
    const altMatch = imgTag.match(/alt=["']([^"']+)["']/);
    const titleMatch = imgTag.match(/title=["']([^"']+)["']/);

    if (srcMatch) {
      images.push({
        src: srcMatch[1],
        alt: altMatch?.[1] || undefined,
        title: titleMatch?.[1] || undefined,
      });
    }
  }

  return images;
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

// Validate image URL
export function validateImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid URL or relative path
  try {
    if (url.startsWith('http')) {
      new URL(url);
      return true;
    }
    // For relative paths, check if it looks like an image file
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url);
  } catch {
    return false;
  }
}

// Get image metadata
export function getImageMetadata(imagePath: string, context?: {
  postTitle?: string;
  category?: string;
}): {
  title?: string;
  caption?: string;
} {
  const filename = imagePath.split('/').pop() || '';
  const baseAlt = generateAltFromFilename(filename);
  
  if (context?.postTitle) {
    return {
      title: `${context.postTitle} - ${baseAlt}`,
      caption: `${context.category || '투자'} 관련 ${baseAlt}`,
    };
  }
  
  return {
    title: baseAlt,
    caption: baseAlt,
  };
} 