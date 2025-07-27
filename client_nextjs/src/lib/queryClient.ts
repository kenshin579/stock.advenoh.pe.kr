import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Detect if we're in static deployment mode
const isStaticDeployment = () => {
  // For autoscale deployment, always use the API (never static files)
  // Only use static files if explicitly forced via environment variable
  return import.meta.env.VITE_FORCE_STATIC === 'true';
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Static data fetcher for deployment
async function fetchStaticData(path: string, params?: URLSearchParams) {
  console.log(`Fetching static data for path: ${path}`);
  
  if (path === '/api/blog-posts') {
    // Try multiple possible locations for blog posts JSON
    const possibleUrls = [
      '/api/blog-posts.json',
      './api/blog-posts.json',
      '/blog-posts.json',
      './blog-posts.json'
    ];
    
    for (const url of possibleUrls) {
      try {
        console.log(`Trying to fetch posts from: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          let posts = await response.json();
          console.log(`Successfully fetched ${posts.length} posts from ${url}`);
          
          // Apply filters if present
          if (params) {
            const category = params.get('category');
            const search = params.get('search');
            const series = params.get('series');
            
            if (category && category !== 'all') {
              posts = posts.filter((post: { category: string }) => post.category === category);
            }
            
            if (series) {
              posts = posts.filter((post: { series?: string }) => post.series === series);
            }
            
            if (search) {
              const searchLower = search.toLowerCase();
              posts = posts.filter((post: { 
                title: string; 
                content: string; 
                excerpt?: string; 
                tags?: string[] 
              }) => 
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchLower)) ||
                (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
              );
            }
          }
          
          return posts;
        }
        console.log(`Failed to fetch from ${url}: ${response.status}`);
      } catch (error) {
        console.log(`Error fetching from ${url}:`, error);
      }
    }
    throw new Error('Failed to fetch posts from any location');
  }
  
  if (path === '/api/categories') {
    // Try multiple possible locations for categories JSON
    const possibleUrls = [
      '/api/categories.json',
      './api/categories.json',
      '/categories.json',
      './categories.json'
    ];
    
    for (const url of possibleUrls) {
      try {
        console.log(`Trying to fetch categories from: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          const categories = await response.json();
          console.log(`Successfully fetched categories from ${url}`);
          return categories;
        }
        console.log(`Failed to fetch from ${url}: ${response.status}`);
      } catch (error) {
        console.log(`Error fetching from ${url}:`, error);
      }
    }
    throw new Error('Failed to fetch categories from any location');
  }

  if (path === '/api/series') {
    // Try multiple possible locations for series JSON
    const possibleUrls = [
      '/api/series.json',
      './api/series.json',
      '/series.json',
      './series.json'
    ];
    
    for (const url of possibleUrls) {
      try {
        console.log(`Trying to fetch series from: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          const series = await response.json();
          console.log(`Successfully fetched series from ${url}`);
          return series;
        }
        console.log(`Failed to fetch from ${url}: ${response.status}`);
      } catch (error) {
        console.log(`Error fetching from ${url}:`, error);
      }
    }
    throw new Error('Failed to fetch series from any location');
  }
  
  if (path.startsWith('/api/blog-posts/')) {
    const slug = path.replace('/api/blog-posts/', '');
    // Try multiple possible locations for individual post JSON
    const possibleUrls = [
      `/api/blog-posts/${slug}.json`,
      `./api/blog-posts/${slug}.json`,
      `/blog-posts/${slug}.json`,
      `./blog-posts/${slug}.json`
    ];
    
    for (const url of possibleUrls) {
      try {
        console.log(`Trying to fetch post from: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
          const post = await response.json();
          console.log(`Successfully fetched post ${slug} from ${url}`);
          return post;
        }
        console.log(`Failed to fetch from ${url}: ${response.status}`);
      } catch (error) {
        console.log(`Error fetching from ${url}:`, error);
      }
    }
    throw new Error(`Post not found: ${slug}`);
  }
  
  throw new Error(`Static route not supported: ${path}`);
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Try API first, fallback to static data if it fails (especially in production)
    try {
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // If API fails and we're in production, try static files
      if (import.meta.env.PROD) {
        console.log(`API failed, trying static files for ${url}:`, error);
        try {
          const urlObj = new URL(url, window.location.origin);
          return await fetchStaticData(urlObj.pathname, urlObj.searchParams);
        } catch (staticError) {
          console.error(`Static data also failed for ${url}:`, staticError);
          throw error; // Throw original API error
        }
      }
      
      // In development, just throw the original error
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
