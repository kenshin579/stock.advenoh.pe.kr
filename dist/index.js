// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import { z } from "zod";

// server/storage.ts
var MemStorage = class {
  users;
  blogPosts;
  newsletterSubscribers;
  userIdCounter;
  blogPostIdCounter;
  subscriberIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.blogPosts = /* @__PURE__ */ new Map();
    this.newsletterSubscribers = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.subscriberIdCounter = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getBlogPosts(published) {
    const posts = Array.from(this.blogPosts.values());
    if (published !== void 0) {
      return posts.filter((post) => post.published === published);
    }
    return posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getBlogPost(slug) {
    return Array.from(this.blogPosts.values()).find((post) => post.slug === slug);
  }
  async getBlogPostById(id) {
    return this.blogPosts.get(id);
  }
  async createBlogPost(insertPost) {
    const id = this.blogPostIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const post = {
      ...insertPost,
      id,
      views: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
      published: insertPost.published ?? false,
      tags: insertPost.tags ?? [],
      featuredImage: insertPost.featuredImage ?? null,
      seoTitle: insertPost.seoTitle ?? null,
      seoDescription: insertPost.seoDescription ?? null,
      seoKeywords: insertPost.seoKeywords ?? null
    };
    this.blogPosts.set(id, post);
    return post;
  }
  async updateBlogPost(id, updatePost) {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      throw new Error("Blog post not found");
    }
    const updatedPost = {
      ...existingPost,
      ...updatePost,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }
  async deleteBlogPost(id) {
    this.blogPosts.delete(id);
  }
  async incrementViews(id) {
    const post = this.blogPosts.get(id);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.blogPosts.set(id, post);
    }
  }
  async incrementLikes(id) {
    const post = this.blogPosts.get(id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.blogPosts.set(id, post);
    }
  }
  async getNewsletterSubscribers() {
    return Array.from(this.newsletterSubscribers.values());
  }
  async addNewsletterSubscriber(insertSubscriber) {
    const id = this.subscriberIdCounter++;
    const subscriber = {
      ...insertSubscriber,
      id,
      subscribedAt: /* @__PURE__ */ new Date(),
      active: true
    };
    this.newsletterSubscribers.set(id, subscriber);
    return subscriber;
  }
  async removeNewsletterSubscriber(email) {
    const subscriber = Array.from(this.newsletterSubscribers.values()).find((s) => s.email === email);
    if (subscriber) {
      this.newsletterSubscribers.delete(subscriber.id);
    }
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  featuredImage: text("featured_image"),
  published: boolean("published").default(false),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords")
});
var newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true)
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true
});
var insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
  active: true
});

// server/services/rss.ts
function generateRssFeed(posts) {
  const baseUrl = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000";
  const siteUrl = `https://${baseUrl}`;
  const rssItems = posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <category>${post.category}</category>
      ${post.tags?.map((tag) => `<category><![CDATA[${tag}]]></category>`).join("") || ""}
    </item>
  `).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>\uD22C\uC790 \uC778\uC0AC\uC774\uD2B8 \uBE14\uB85C\uADF8</title>
    <link>${siteUrl}</link>
    <description>\uAD6D\uB0B4\uC678 \uC8FC\uC2DD, ETF, \uCC44\uAD8C, \uD380\uB4DC\uC5D0 \uB300\uD55C \uC804\uBB38\uC801\uC778 \uD22C\uC790 \uC815\uBCF4\uC640 \uBD84\uC11D</description>
    <language>ko</language>
    <lastBuildDate>${(/* @__PURE__ */ new Date()).toUTCString()}</lastBuildDate>
    <generator>Investment Insights Blog</generator>
    ${rssItems}
  </channel>
</rss>`;
}

// server/services/sitemap.ts
function generateSitemap(posts) {
  const baseUrl = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000";
  const siteUrl = `https://${baseUrl}`;
  const staticPages = [
    { url: siteUrl, changefreq: "daily", priority: "1.0" },
    { url: `${siteUrl}/admin`, changefreq: "weekly", priority: "0.5" }
  ];
  const postUrls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: new Date(post.updatedAt).toISOString().split("T")[0]
  }));
  const allUrls = [...staticPages, ...postUrls];
  const urlEntries = allUrls.map((page) => `
    <url>
      <loc>${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
      ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
    </url>
  `).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
}

// server/services/robots.ts
function generateRobotsTxt() {
  const baseUrl = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000";
  const siteUrl = `https://${baseUrl}`;
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/api/sitemap.xml

# Investment Insights Blog
# Professional financial blog about stocks, ETFs, bonds, and funds`;
}

// server/services/contentImporter.ts
import { readFile, readdir, stat } from "fs/promises";
import { join } from "path";
function parseMarkdownFile(content) {
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontMatterMatch) {
    throw new Error("No front matter found in markdown file");
  }
  const frontMatterText = frontMatterMatch[1];
  const markdownContent = frontMatterMatch[2];
  const frontMatter = {};
  const lines = frontMatterText.split("\n");
  let currentKey = "";
  let inArray = false;
  let arrayItems = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("- ")) {
      if (inArray) {
        arrayItems.push(trimmed.substring(2));
      }
    } else if (trimmed.includes(":")) {
      if (inArray && currentKey) {
        frontMatter[currentKey] = arrayItems;
        inArray = false;
        arrayItems = [];
      }
      const colonIndex = trimmed.indexOf(":");
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      currentKey = key;
      if (value === "") {
        inArray = true;
        arrayItems = [];
      } else {
        frontMatter[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  }
  if (inArray && currentKey) {
    frontMatter[currentKey] = arrayItems;
  }
  return {
    frontMatter,
    content: markdownContent.trim()
  };
}
function createSlug(title) {
  return title.toLowerCase().replace(/[가-힣]/g, (char) => {
    return char;
  }).replace(/[^a-z0-9가-힣\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
function extractExcerpt(content) {
  const plainText = content.replace(/^#+ .+$/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[(.+?)\]\(.+?\)/g, "$1").replace(/\n+/g, " ").trim();
  return plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;
}
async function importMarkdownFiles(storage2, contentDir = "contents") {
  try {
    const etfDir = join(contentDir, "etf");
    const etfStat = await stat(etfDir);
    if (!etfStat.isDirectory()) {
      console.log("ETF directory not found");
      return;
    }
    const folders = await readdir(etfDir);
    for (const folder of folders) {
      const folderPath = join(etfDir, folder);
      const folderStat = await stat(folderPath);
      if (folderStat.isDirectory()) {
        const markdownPath = join(folderPath, "index.md");
        try {
          const content = await readFile(markdownPath, "utf-8");
          const { frontMatter, content: markdownContent } = parseMarkdownFile(content);
          const slug = createSlug(frontMatter.title);
          const excerpt = extractExcerpt(markdownContent);
          const blogPost = {
            title: frontMatter.title,
            slug,
            content: markdownContent,
            excerpt,
            category: frontMatter.category || "etf",
            tags: frontMatter.tags || [],
            featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
            published: true,
            seoTitle: `${frontMatter.title} | \uD22C\uC790 \uC778\uC0AC\uC774\uD2B8`,
            seoDescription: frontMatter.description || excerpt,
            seoKeywords: frontMatter.tags?.join(", ") || ""
          };
          await storage2.createBlogPost(blogPost);
          console.log(`\u2713 Imported: ${frontMatter.title}`);
        } catch (error) {
          console.error(`Failed to import ${folder}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error importing markdown files:", error);
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  await importMarkdownFiles(storage);
  app2.get("/api/blog-posts", async (req, res) => {
    try {
      const { published, category, search } = req.query;
      let posts = await storage.getBlogPosts(published === "true" ? true : void 0);
      if (category && category !== "all") {
        posts = posts.filter((post) => post.category === category);
      }
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        posts = posts.filter(
          (post) => post.title.toLowerCase().includes(searchTerm) || post.content.toLowerCase().includes(searchTerm) || post.excerpt.toLowerCase().includes(searchTerm) || post.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
        );
      }
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  app2.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      await storage.incrementViews(post.id);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  app2.post("/api/blog-posts", async (req, res) => {
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
  app2.put("/api/blog-posts/:id", async (req, res) => {
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
  app2.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });
  app2.post("/api/blog-posts/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementLikes(parseInt(id));
      const post = await storage.getBlogPostById(parseInt(id));
      res.json({ likes: post?.likes || 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to like blog post" });
    }
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
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
  app2.delete("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      await storage.removeNewsletterSubscriber(email);
      res.json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });
  app2.get("/api/rss", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      const rss = generateRssFeed(posts);
      res.set("Content-Type", "application/rss+xml");
      res.send(rss);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate RSS feed" });
    }
  });
  app2.get("/api/sitemap.xml", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      const sitemap = generateSitemap(posts);
      res.set("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate sitemap" });
    }
  });
  app2.get("/robots.txt", (req, res) => {
    try {
      const robots = generateRobotsTxt();
      res.set("Content-Type", "text/plain");
      res.send(robots);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate robots.txt" });
    }
  });
  app2.use("/contents", express.static("contents", {
    setHeaders: (res, path3) => {
      if (path3.endsWith(".png") || path3.endsWith(".jpg") || path3.endsWith(".jpeg") || path3.endsWith(".gif") || path3.endsWith(".svg")) {
        res.set("Cache-Control", "public, max-age=31536000");
      }
    }
  }));
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
