#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

interface MarkdownFrontMatter {
  title: string;
  description?: string;
  date: string;
  update?: string;
  category?: string;
  tags?: string[];
  series?: string;
}

function parseMarkdownFile(content: string): { frontMatter: MarkdownFrontMatter; content: string } {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontMatterMatch) {
    throw new Error('No front matter found in markdown file');
  }

  const frontMatterText = frontMatterMatch[1];
  const markdownContent = frontMatterMatch[2];

  // Parse YAML front matter
  const frontMatter: any = {};
  const lines = frontMatterText.split('\n');
  let currentKey = '';
  let inArray = false;
  let arrayItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('- ')) {
      // Array item
      if (inArray) {
        arrayItems.push(trimmed.substring(2));
      }
    } else if (trimmed.includes(':')) {
      // Key-value pair
      if (inArray && currentKey) {
        frontMatter[currentKey] = arrayItems;
        inArray = false;
        arrayItems = [];
      }
      
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      currentKey = key;
      
      if (value === '') {
        // Might be an array
        inArray = true;
        arrayItems = [];
      } else {
        // Regular value
        frontMatter[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
      }
    }
  }

  // Handle last array if any
  if (inArray && currentKey) {
    frontMatter[currentKey] = arrayItems;
  }

  return {
    frontMatter: frontMatter as MarkdownFrontMatter,
    content: markdownContent.trim()
  };
}

function createSlug(folderName: string): string {
  return folderName;
}

function extractExcerpt(content: string): string {
  // Remove markdown headers and formatting
  const plainText = content
    .replace(/^#+ .+$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
}

function extractFirstImageFromMarkdown(content: string): string | null {
  // Enhanced regex patterns to handle various markdown image formats
  const patterns = [
    // Complex nested patterns: ![![alt](img1)](img2)
    /!\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
    // Standard markdown images: ![alt](image.png)
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    // HTML img tags: <img src="..." alt="..." />
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let imageSrc = '';
      
      if (match.length === 4) {
        // For nested patterns: ![![alt](img1)](img2) - use the outer image (img2)
        imageSrc = match[3];
      } else if (pattern.source.includes('img')) {
        // For HTML img tags
        imageSrc = match[1];
      } else {
        // For standard markdown images
        imageSrc = match[2];
      }
      
      if (imageSrc) {
        imageSrc = imageSrc.trim();
        // Skip data URLs, empty strings, or just anchors
        if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('#')) {
          return imageSrc;
        }
      }
    }
  }
  
  return null;
}

async function importAllContent(contentDir: string = 'contents'): Promise<any[]> {
  const posts: any[] = [];
  
  try {
    const categories = await readdir(contentDir);
    
    for (const category of categories) {
      const categoryDir = join(contentDir, category);
      const categoryStat = await stat(categoryDir);
      
      if (!categoryStat.isDirectory()) {
        continue;
      }

      const folders = await readdir(categoryDir);
      
      for (const folder of folders) {
        const folderPath = join(categoryDir, folder);
        const folderStat = await stat(folderPath);
        
        if (folderStat.isDirectory()) {
          const markdownPath = join(folderPath, 'index.md');
          
          try {
            const content = await readFile(markdownPath, 'utf-8');
            const { frontMatter, content: markdownContent } = parseMarkdownFile(content);
            
            const slug = createSlug(folder);
            const excerpt = extractExcerpt(markdownContent);
            const firstImage = extractFirstImageFromMarkdown(markdownContent);
            
            const finalCategory = frontMatter.category || category;
            
            // Build featured image path if found in content
            let featuredImagePath = null;
            if (firstImage && !firstImage.startsWith('http')) {
              featuredImagePath = `/contents/${category}/${folder}/${firstImage}`;
            } else if (firstImage) {
              featuredImagePath = firstImage;
            }
            
            const blogPost = {
              title: frontMatter.title,
              slug,
              content: markdownContent,
              excerpt,
              category: finalCategory,
              tags: frontMatter.tags || [],
              series: frontMatter.series || null,
              featuredImage: featuredImagePath,
              published: true,
              seoTitle: `${frontMatter.title} | 투자 인사이트`,
              seoDescription: frontMatter.description || excerpt,
              seoKeywords: frontMatter.tags?.join(', ') || '',
              date: frontMatter.date,
              createdAt: frontMatter.date,
              updatedAt: frontMatter.update || frontMatter.date,
              views: 0,
              likes: 0
            };
            
            posts.push(blogPost);
            console.log(`✓ Imported: ${frontMatter.title}`);
            
          } catch (error) {
            console.error(`Failed to import ${folder}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error importing markdown files:', error);
  }
  
  return posts;
}

async function generateStaticData() {
  console.log('Generating static data for deployment...');
  
  try {
    // Create public/api directory
    const apiDir = path.join(process.cwd(), 'public', 'api');
    await fs.mkdir(apiDir, { recursive: true });
    
    // Import all blog posts
    const posts = await importAllContent();
    
    // Generate blog posts JSON
    await fs.writeFile(
      path.join(apiDir, 'blog-posts.json'),
      JSON.stringify(posts, null, 2)
    );
    
    // Generate categories JSON
    const categories = Array.from(new Set(posts.map(post => post.category)))
      .filter(Boolean)
      .map(category => ({
        category,
        count: posts.filter(post => post.category === category).length
      }));
      
    await fs.writeFile(
      path.join(apiDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );

    // Generate series JSON
    const seriesPosts = posts.filter(post => post.series);
    const seriesMap = new Map();
    
    seriesPosts.forEach(post => {
      if (!seriesMap.has(post.series)) {
        seriesMap.set(post.series, []);
      }
      seriesMap.get(post.series).push({
        title: post.title,
        slug: post.slug,
        date: post.date
      });
    });
    
    const series = Array.from(seriesMap.entries()).map(([seriesName, seriesPosts]) => {
      const sortedPosts = seriesPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return {
        name: seriesName,
        count: seriesPosts.length,
        latestDate: sortedPosts[0].date,
        posts: sortedPosts
      };
    });
    
    await fs.writeFile(
      path.join(apiDir, 'series.json'),
      JSON.stringify(series, null, 2)
    );
    
    // Generate individual post files
    const postsDir = path.join(apiDir, 'blog-posts');
    await fs.mkdir(postsDir, { recursive: true });
    
    for (const post of posts) {
      await fs.writeFile(
        path.join(postsDir, `${post.slug}.json`),
        JSON.stringify(post, null, 2)
      );
    }
    
    console.log(`Generated static data for ${posts.length} posts`);
    console.log(`Generated ${categories.length} categories`);
    console.log(`Generated ${series.length} series`);
    
  } catch (error) {
    console.error('Error generating static data:', error);
    process.exit(1);
  }
}

generateStaticData();