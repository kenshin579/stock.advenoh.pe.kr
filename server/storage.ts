import { users, blogPosts, newsletterSubscribers, type User, type InsertUser, type BlogPost, type InsertBlogPost, type NewsletterSubscriber, type InsertNewsletterSubscriber } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  incrementViews(id: number): Promise<void>;
  incrementLikes(id: number): Promise<void>;

  getNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  addNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  removeNewsletterSubscriber(email: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogPosts: Map<number, BlogPost>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private userIdCounter: number;
  private blogPostIdCounter: number;
  private subscriberIdCounter: number;

  constructor() {
    this.users = new Map();
    this.blogPosts = new Map();
    this.newsletterSubscribers = new Map();
    this.userIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.subscriberIdCounter = 1;
  }



  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    const posts = Array.from(this.blogPosts.values());
    if (published !== undefined) {
      return posts.filter(post => post.published === published);
    }
    return posts.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const now = new Date();
    const post: BlogPost = {
      ...insertPost,
      id,
      views: 0,
      likes: 0,
      createdAt: (insertPost as any).markdownDate ? new Date((insertPost as any).markdownDate) : now,
      updatedAt: now,
      published: insertPost.published ?? false,
      tags: insertPost.tags ?? [],
      featuredImage: insertPost.featuredImage ?? null,
      seoTitle: insertPost.seoTitle ?? null,
      seoDescription: insertPost.seoDescription ?? null,
      seoKeywords: insertPost.seoKeywords ?? null,
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: number, updatePost: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      throw new Error('Blog post not found');
    }

    const updatedPost: BlogPost = {
      ...existingPost,
      ...updatePost,
      updatedAt: new Date(),
    };

    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  async incrementViews(id: number): Promise<void> {
    const post = this.blogPosts.get(id);
    if (post) {
      post.views = (post.views || 0) + 1;
      this.blogPosts.set(id, post);
    }
  }

  async incrementLikes(id: number): Promise<void> {
    const post = this.blogPosts.get(id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.blogPosts.set(id, post);
    }
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values());
  }

  async addNewsletterSubscriber(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.subscriberIdCounter++;
    const subscriber: NewsletterSubscriber = {
      ...insertSubscriber,
      id,
      subscribedAt: new Date(),
      active: true,
    };
    this.newsletterSubscribers.set(id, subscriber);
    return subscriber;
  }

  async removeNewsletterSubscriber(email: string): Promise<void> {
    const subscriber = Array.from(this.newsletterSubscribers.values()).find(s => s.email === email);
    if (subscriber) {
      this.newsletterSubscribers.delete(subscriber.id);
    }
  }

  clearBlogPosts(): void {
    this.blogPosts.clear();
    this.blogPostIdCounter = 1;
  }
}

export const storage = new MemStorage();