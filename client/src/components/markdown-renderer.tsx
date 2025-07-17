import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  slug?: string; // Blog post slug for image path resolution
}

export function MarkdownRenderer({ content, className = "", slug }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\s가-힣]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            return (
              <h1 id={id} className="text-3xl font-bold mb-6 mt-8 text-foreground scroll-mt-8">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\s가-힣]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            return (
              <h2 id={id} className="text-2xl font-semibold mb-4 mt-6 text-foreground scroll-mt-8">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\s가-힣]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            return (
              <h3 id={id} className="text-xl font-semibold mb-3 mt-5 text-foreground scroll-mt-8">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\s가-힣]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            return (
              <h4 id={id} className="text-lg font-semibold mb-2 mt-4 text-foreground scroll-mt-8">
                {children}
              </h4>
            );
          },
          h5: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\s가-힣]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            return (
              <h5 id={id} className="text-base font-semibold mb-2 mt-3 text-foreground scroll-mt-8">
                {children}
              </h5>
            );
          },
          h6: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w\s가-힣]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            return (
              <h6 id={id} className="text-sm font-semibold mb-2 mt-3 text-foreground scroll-mt-8">
                {children}
              </h6>
            );
          },
          p: ({ children }) => (
            <p className="mb-4 text-foreground/80 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 text-foreground/80 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 text-foreground/80 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4 bg-muted/50 py-2">
              {children}
            </blockquote>
          ),
          code: ({ inline, children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={language}
                PreTag="div"
                className="mb-4 rounded-lg"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm">
                {String(children).replace(/`/g, '')}
              </code>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt, title }) => {
            // Handle relative URLs and ensure proper image loading
            if (!src) return null;
            
            let imageSrc = src;
            
            // If it's a relative path and we have a slug, construct the full path
            if (!src.startsWith('/') && !src.startsWith('http') && slug) {
              // Map slug to content directory structure
              const slugToDirectoryMap: { [key: string]: string } = {
                'etf-상장폐지가-되면-어떻게-되나': 'etf-delisting-what-happens',
                'etf-고르는-기준': 'etf-selection-criteria',
                'etf-상품명-이해하기': 'understanding-etf-product-names',
                // Add more mappings as needed
              };
              
              const directoryName = slugToDirectoryMap[slug] || slug;
              imageSrc = `/contents/etf/${directoryName}/${src}`;
            } else if (!src.startsWith('/') && !src.startsWith('http')) {
              imageSrc = `/contents/${src}`;
            }
            
            return (
              <span className="block mb-4 text-center">
                <img
                  src={imageSrc}
                  alt={alt || ''}
                  title={title}
                  className="max-w-full h-auto rounded-lg shadow-md border border-border/20 inline-block"
                  loading="lazy"
                  onError={(e) => {
                    // Handle image loading errors gracefully
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'flex items-center justify-center h-32 bg-muted rounded-lg border border-border/20 text-muted-foreground text-sm';
                    errorDiv.innerHTML = `
                      <div class="text-center">
                        <div>이미지를 불러올 수 없습니다</div>
                        ${alt ? `<div class="text-xs mt-1 opacity-60">${alt}</div>` : ''}
                      </div>
                    `;
                    target.parentNode?.appendChild(errorDiv);
                  }}
                />
              </span>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-border">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
