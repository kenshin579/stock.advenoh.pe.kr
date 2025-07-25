import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertBlogPostSchema, insertNewsletterSubscriberSchema } from "@shared/schema";
import { generateRssFeed } from "./services/rss";
import { generateSitemap } from "./services/sitemap";
import { generateRobotsTxt } from "./services/robots";
import { importMarkdownFiles } from "./services/contentImporter";
import { generateStaticImageSitemap } from "./services/image-sitemap";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clear existing blog posts and import markdown files on startup
  (storage as any).clearBlogPosts();
  await importMarkdownFiles(storage);

  // Blog posts routes
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const { published, category, search, series } = req.query;
      let posts = await storage.getBlogPosts(published === 'true' ? true : undefined);

      if (category && category !== 'all') {
        posts = posts.filter(post => post.category === category);
      }

      if (series) {
        posts = posts.filter(post => post.series === series);
      }

      if (search) {
        const searchTerm = search.toString().toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          post.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);

      // Count posts by category
      const categoryCount: { [key: string]: number } = {};
      posts.forEach(post => {
        const category = post.category || 'uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Sort by post count and take top 5
      const sortedCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      res.json(sortedCategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Series routes
  app.get("/api/series", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      
      // Filter posts that have series
      const seriesPosts = posts.filter(post => post.series);
      
      // Group posts by series
      const seriesMap = new Map();
      seriesPosts.forEach(post => {
        if (!seriesMap.has(post.series)) {
          seriesMap.set(post.series, []);
        }
        seriesMap.get(post.series).push({
          title: post.title,
          slug: post.slug,
          date: post.createdAt
        });
      });
      
      // Create series info array
      const series = Array.from(seriesMap.entries()).map(([seriesName, seriesPosts]) => {
        const sortedPosts = seriesPosts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
          name: seriesName,
          count: seriesPosts.length,
          latestDate: sortedPosts[0].date,
          posts: sortedPosts
        };
      });

      res.json(series);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch series" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);

      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Increment views
      await storage.incrementViews(post.id);

      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog-posts", async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(parseInt(id), validatedData);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  app.post("/api/blog-posts/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementLikes(parseInt(id));
      const post = await storage.getBlogPostById(parseInt(id));
      res.json({ likes: post?.likes || 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to like blog post" });
    }
  });

  // Newsletter subscription routes
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.addNewsletterSubscriber(validatedData);
      res.status(201).json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.delete("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      await storage.removeNewsletterSubscriber(email);
      res.json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });

  // RSS feed
  app.get("/rss.xml", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      const rss = generateRssFeed(posts);
      res.set('Content-Type', 'application/rss+xml');
      res.send(rss);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate RSS feed" });
    }
  });

  // Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      const sitemap = generateSitemap(posts);
      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate sitemap" });
    }
  });

  // Image sitemap
  app.get("/image-sitemap.xml", async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;
      
      const imageSitemap = await generateStaticImageSitemap(baseUrl);
      res.set('Content-Type', 'application/xml');
      res.send(imageSitemap);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate image sitemap" });
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    try {
      const robots = generateRobotsTxt();
      res.set('Content-Type', 'text/plain');
      res.send(robots);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate robots.txt" });
    }
  });

  // Serve images from contents directory
  app.use('/contents', express.static('contents', {
    setHeaders: (res, path) => {
      if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif') || path.endsWith('.svg')) {
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      }
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}