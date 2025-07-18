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
  // Use the original investment-related stock chart image as default
  return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600';
}