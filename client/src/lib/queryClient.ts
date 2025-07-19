import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Detect if we're in static deployment mode
const isStaticDeployment = () => {
  // In development mode, always use the API
  if (import.meta.env.DEV) return false;
  
  // In production, check if we have backend access
  // If VITE_API_BASE_URL is not set and we're in production, use static files
  return import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Static data fetcher for deployment
async function fetchStaticData(path: string, params?: URLSearchParams) {
  if (path === '/api/blog-posts') {
    const response = await fetch('/api/blog-posts.json');
    if (!response.ok) throw new Error('Failed to fetch posts');
    let posts = await response.json();
    
    // Apply filters if present
    if (params) {
      const category = params.get('category');
      const search = params.get('search');
      
      if (category && category !== 'all') {
        posts = posts.filter((post: any) => post.category === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter((post: any) => 
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(searchLower)) ||
          (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
        );
      }
    }
    
    return posts;
  }
  
  if (path === '/api/categories') {
    const response = await fetch('/api/categories.json');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }
  
  if (path.startsWith('/api/blog-posts/')) {
    const slug = path.replace('/api/blog-posts/', '');
    const response = await fetch(`/api/blog-posts/${slug}.json`);
    if (!response.ok) throw new Error('Post not found');
    return response.json();
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
