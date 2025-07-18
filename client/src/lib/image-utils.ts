/**
 * Extract the first image from markdown content
 * @param content - The markdown content
 * @returns The first image src or null if no images found
 */
export function extractFirstImageFromMarkdown(content: string): string | null {
  // Match markdown image syntax: ![alt text](image.png)
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(imageRegex);
  
  if (match && match[1]) {
    const imageSrc = match[1].trim();
    // Skip if it's a URL (external image)
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    return imageSrc;
  }
  
  return null;
}

/**
 * Get the cover image for a blog post
 * @param post - The blog post object
 * @returns The cover image URL or default image
 */
export function getCoverImage(post: { featuredImage?: string; content: string; category: string; slug: string }): string {
  // First check if there's a featured image
  if (post.featuredImage) {
    return post.featuredImage;
  }
  
  // Extract first image from content
  const firstImage = extractFirstImageFromMarkdown(post.content);
  if (firstImage) {
    // Build the full path for relative images
    if (!firstImage.startsWith('/') && !firstImage.startsWith('http')) {
      // Use category to determine the correct directory
      let categoryDir = 'stock'; // default
      if (post.category) {
        switch (post.category.toLowerCase()) {
          case 'etf':
            categoryDir = 'etf';
            break;
          case 'weekly':
            categoryDir = 'weekly';
            break;
          case 'etc':
            categoryDir = 'etc';
            break;
          case 'stock':
          default:
            categoryDir = 'stock';
            break;
        }
      }
      
      return `/contents/${categoryDir}/${post.slug}/${firstImage}`;
    }
    return firstImage;
  }
  
  // Return default image based on category
  return getDefaultCoverImage(post.category);
}

/**
 * Get default cover image based on category
 * @param category - The post category
 * @returns The default cover image URL
 */
export function getDefaultCoverImage(category: string): string {
  // Create a simple SVG default image based on category
  const categoryColors = {
    stock: '#3B82F6',    // blue
    etf: '#10B981',      // green
    bonds: '#8B5CF6',    // purple
    funds: '#F59E0B',    // orange
    analysis: '#EF4444', // red
    etc: '#6B7280',      // gray
    weekly: '#6366F1',   // indigo
  };
  
  const color = categoryColors[category?.toLowerCase() as keyof typeof categoryColors] || categoryColors.stock;
  const categoryLabel = category || 'Stock';
  
  // Create SVG data URL
  const svg = `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="200" fill="${color}" opacity="0.1"/>
      <rect x="50" y="50" width="300" height="100" fill="${color}" opacity="0.2" rx="10"/>
      <text x="200" y="110" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="${color}">
        ${categoryLabel}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}