import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonicalUrl?: string;
  structuredData?: object;
  author?: string;
  robots?: string;
}

// Helper function to truncate description to optimal length
function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  // Try to cut at the last complete sentence within limit
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If we find a period within reasonable distance, cut there
  if (lastPeriod > maxLength - 30) {
    return text.substring(0, lastPeriod + 1);
  }
  
  // Otherwise cut at last space and add ellipsis
  if (lastSpace > 0) {
    return text.substring(0, lastSpace) + '...';
  }
  
  // Fallback: hard cut with ellipsis
  return truncated + '...';
}

export function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  canonicalUrl,
  structuredData,
  author = "Frank Oh",
  robots = "index, follow",
}: SEOHeadProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", property);
        } else {
          meta.setAttribute("name", property);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Truncate description to optimal length
    const optimizedDescription = truncateDescription(description);

    // Set basic meta tags
    setMetaTag("description", optimizedDescription);
    setMetaTag("robots", robots);
    setMetaTag("author", author);
    setMetaTag("viewport", "width=device-width, initial-scale=1.0");
    
    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    // Set Open Graph tags
    setMetaTag("og:title", ogTitle || title, true);
    setMetaTag("og:description", ogDescription || optimizedDescription, true);
    setMetaTag("og:type", "article", true);
    
    if (ogImage) {
      setMetaTag("og:image", ogImage, true);
    }
    
    if (ogUrl) {
      setMetaTag("og:url", ogUrl, true);
    }

    // Set Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", ogTitle || title);
    setMetaTag("twitter:description", ogDescription || optimizedDescription);
    
    if (ogImage) {
      setMetaTag("twitter:image", ogImage);
    }

    // Set canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // Set structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonicalUrl, structuredData]);

  return null;
}
