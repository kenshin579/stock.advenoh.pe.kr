// Image sitemap generation service
import { extractImagesFromMarkdown } from '../utils/image-utils';

interface ImageInfo {
  loc: string;
  caption?: string;
  geoLocation?: string;
  title?: string;
  license?: string;
}

interface ImageSitemapEntry {
  pageUrl: string;
  images: ImageInfo[];
}

// Generate image sitemap XML
export function generateImageSitemap(entries: ImageSitemapEntry[], baseUrl: string): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(entry => `  <url>
    <loc>${entry.pageUrl}</loc>
${entry.images.map(img => `    <image:image>
      <image:loc>${img.loc}</image:loc>
${img.caption ? `      <image:caption><![CDATA[${img.caption}]]></image:caption>` : ''}
${img.title ? `      <image:title><![CDATA[${img.title}]]></image:title>` : ''}
${img.license ? `      <image:license>${img.license}</image:license>` : ''}
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

// Extract images from blog posts for sitemap
export function extractBlogPostImages(posts: Array<{
  slug: string;
  title: string;
  content: string;
  featuredImage?: string;
  category?: string;
}>, baseUrl: string): ImageSitemapEntry[] {
  const entries: ImageSitemapEntry[] = [];

  posts.forEach(post => {
    const images: ImageInfo[] = [];
    const pageUrl = `${baseUrl}/${(post.category || 'etc').toLowerCase()}/${post.slug}`;

    // Add featured image if exists
    if (post.featuredImage) {
      images.push({
        loc: post.featuredImage.startsWith('http') 
          ? post.featuredImage 
          : `${baseUrl}${post.featuredImage}`,
        title: `${post.title} - 대표 이미지`,
        caption: `${post.category || '투자'} 관련 ${post.title} 포스트의 대표 이미지`
      });
    }

    // Extract images from markdown content
    const contentImages = extractImagesFromMarkdown(post.content);
    contentImages.forEach((img, index) => {
      const imageUrl = img.src.startsWith('http') 
        ? img.src 
        : `${baseUrl}${img.src}`;
      
      images.push({
        loc: imageUrl,
        caption: img.alt || img.title || `${post.title} 관련 이미지 ${index + 1}`,
        title: img.title || `${post.title} - 이미지 ${index + 1}`
      });
    });

    // Only add entry if there are images
    if (images.length > 0) {
      entries.push({
        pageUrl,
        images
      });
    }
  });

  return entries;
}

// Generate comprehensive image sitemap from static data
export async function generateStaticImageSitemap(baseUrl: string): Promise<string> {
  try {
    // Import static blog data (will be created when needed)
    const posts: Array<{
      slug: string;
      title: string;
      content: string;
      featuredImage?: string;
      category?: string;
    }> = [];

    // Extract image information
    const entries = extractBlogPostImages(posts, baseUrl);

    // Add common site images
    const commonImages: ImageSitemapEntry[] = [
      {
        pageUrl: baseUrl,
        images: [
          {
            loc: `${baseUrl}/og-image.jpg`,
            title: '투자 인사이트 블로그 - 대표 이미지',
            caption: '국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석을 제공하는 블로그'
          },
          {
            loc: `${baseUrl}/logo.png`,
            title: '투자 인사이트 블로그 로고',
            caption: '투자 인사이트 브랜드 로고'
          }
        ]
      }
    ];

    const allEntries = [...entries, ...commonImages];
    return generateImageSitemap(allEntries, baseUrl);
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return generateImageSitemap([], baseUrl);
  }
}

// Validate image URLs for sitemap
export function validateImageUrl(url: string): boolean {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  } catch {
    return false;
  }
}

// Get image metadata for better SEO
export function getImageMetadata(imagePath: string, context?: {
  postTitle?: string;
  category?: string;
}): Partial<ImageInfo> {
  const filename = imagePath.split('/').pop() || '';
  const extension = filename.split('.').pop()?.toLowerCase();
  
  // Generate contextual caption based on filename and context
  let caption = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  
  if (context) {
    if (context.category) {
      caption += ` - ${context.category} 관련`;
    }
    if (context.postTitle) {
      caption += ` (${context.postTitle})`;
    }
  }

  const metadata: Partial<ImageInfo> = {
    caption: caption || '투자 관련 이미지'
  };

  // Add format-specific metadata
  if (extension === 'svg') {
    metadata.title = `${caption} - 벡터 그래픽`;
  } else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
    metadata.title = `${caption} - ${extension?.toUpperCase()} 이미지`;
  }

  return metadata;
}