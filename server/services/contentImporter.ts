import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { type IStorage } from '../storage';
import { type InsertBlogPost } from '@shared/schema';

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
  return folderName; // Use folder name as slug directly
}

function extractExcerpt(content: string): string {
  // Remove markdown headers and formatting
  const plainText = content
    .replace(/^#+ .+$/gm, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  // Take first 150 characters
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
}

function extractFirstImageFromMarkdown(content: string): string | null {
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

export async function importMarkdownFiles(storage: IStorage, contentDir: string = 'contents'): Promise<void> {
  try {
    // Get all category directories
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
              // Build full path for relative images
              featuredImagePath = `/contents/${category}/${folder}/${firstImage}`;
            } else if (firstImage) {
              // Use external image URL directly
              featuredImagePath = firstImage;
            }
            
            const blogPost: InsertBlogPost & { markdownDate?: string } = {
              title: frontMatter.title,
              slug,
              content: markdownContent,
              excerpt,
              category: finalCategory,
              tags: frontMatter.tags || [],
              series: frontMatter.series,
              featuredImage: featuredImagePath,
              published: true,
              seoTitle: `${frontMatter.title} | 투자 인사이트`,
              seoDescription: frontMatter.description || excerpt,
              seoKeywords: frontMatter.tags?.join(', ') || '',
              markdownDate: frontMatter.date
            };
            

            
            await storage.createBlogPost(blogPost);
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
}