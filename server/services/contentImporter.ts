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
            
            const finalCategory = frontMatter.category || category;
            
            const blogPost: InsertBlogPost = {
              title: frontMatter.title,
              slug,
              content: markdownContent,
              excerpt,
              category: finalCategory,
              tags: frontMatter.tags || [],
              featuredImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
              published: true,
              seoTitle: `${frontMatter.title} | 투자 인사이트`,
              seoDescription: frontMatter.description || excerpt,
              seoKeywords: frontMatter.tags?.join(', ') || ''
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