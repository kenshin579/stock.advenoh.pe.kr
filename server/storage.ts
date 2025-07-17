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
    
    // Initialize with sample blog posts
    this.initializeSamplePosts();
  }

  private initializeSamplePosts() {
    const samplePosts: InsertBlogPost[] = [
      {
        title: "2024년 테크 주식 전망: AI 혁명이 가져올 투자 기회",
        slug: "2024-tech-stocks-ai-revolution",
        content: "# 2024년 테크 주식 전망\n\n인공지능과 머신러닝 기술의 급속한 발전으로 테크 주식 시장에 새로운 패러다임이 형성되고 있습니다.\n\n## 주요 AI 기업 분석\n\n### 1. 엔비디아 (NVIDIA)\n- GPU 기반 AI 칩 시장 선도\n- 데이터센터 매출 급증\n- 향후 전망: 강세 지속 예상\n\n### 2. 마이크로소프트 (Microsoft)\n- ChatGPT 통합으로 클라우드 사업 확장\n- Azure AI 서비스 성장\n- 향후 전망: 안정적 성장 예상\n\n## 투자 전략\n\n1. **분산 투자**: 여러 AI 관련 기업에 투자\n2. **장기 투자**: 기술 발전 주기 고려\n3. **리스크 관리**: 변동성 대비 포트폴리오 구성\n\n## 결론\n\nAI 기술의 발전은 테크 주식 시장에 새로운 기회를 제공하고 있습니다. 신중한 분석과 분산 투자를 통해 이러한 기회를 활용할 수 있습니다.",
        excerpt: "인공지능과 머신러닝 기술의 급속한 발전으로 테크 주식 시장에 새로운 패러다임이 형성되고 있습니다. 주요 테크 기업들의 AI 투자 현황과 향후 전망을 분석해보겠습니다.",
        category: "stocks",
        tags: ["AI", "테크주식", "엔비디아", "마이크로소프트", "투자전략"],
        featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        published: true,
        seoTitle: "2024년 테크 주식 전망: AI 혁명이 가져올 투자 기회 | 투자 인사이트",
        seoDescription: "AI 기술 발전이 테크 주식 시장에 미치는 영향과 투자 기회를 분석합니다. 엔비디아, 마이크로소프트 등 주요 기업 전망과 투자 전략을 제시합니다.",
        seoKeywords: "AI 주식, 테크 주식, 엔비디아, 마이크로소프트, 인공지능 투자, 2024 주식 전망"
      },
      {
        title: "국내 ETF 시장 동향과 추천 포트폴리오",
        slug: "domestic-etf-market-trends-portfolio",
        content: "# 국내 ETF 시장 동향과 추천 포트폴리오\n\n최근 국내 ETF 시장이 급성장하고 있으며, 다양한 테마 ETF들이 출시되고 있습니다.\n\n## 국내 ETF 시장 현황\n\n### 시장 규모\n- 2024년 1월 기준 약 100조원 규모\n- 전년 대비 25% 성장\n- 개인 투자자 비중 증가\n\n### 인기 ETF 종류\n1. **국내 대형주 ETF**\n   - KODEX 200\n   - TIGER 200\n   - 안정적인 배당 수익\n\n2. **테마 ETF**\n   - 반도체 ETF\n   - 2차전지 ETF\n   - K-뉴딜 ETF\n\n3. **해외 ETF**\n   - S&P 500 ETF\n   - 나스닥 100 ETF\n   - 중국 ETF\n\n## 추천 포트폴리오\n\n### 안정형 포트폴리오\n- 국내 대형주 ETF 40%\n- 채권 ETF 30%\n- 해외 선진국 ETF 20%\n- 현금 10%\n\n### 성장형 포트폴리오\n- 국내 성장주 ETF 30%\n- 테마 ETF 25%\n- 해외 성장주 ETF 25%\n- 국내 대형주 ETF 20%\n\n## 투자 시 고려사항\n\n1. **비용 비율**: 연간 보수 확인\n2. **추적 오차**: 기초지수 추적 정확도\n3. **거래량**: 유동성 확인\n4. **분산 효과**: 포트폴리오 구성\n\n## 결론\n\nETF는 분산 투자와 비용 효율성을 제공하는 훌륭한 투자 도구입니다. 자신의 투자 성향과 목표에 맞는 ETF를 선택하여 포트폴리오를 구성하는 것이 중요합니다.",
        excerpt: "최근 국내 ETF 시장의 급성장과 함께 다양한 테마 ETF들이 출시되고 있습니다. 개인 투자자를 위한 ETF 선택 기준과 포트폴리오 구성 방법을 소개합니다.",
        category: "etf",
        tags: ["ETF", "포트폴리오", "분산투자", "국내ETF", "테마ETF"],
        featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        published: true,
        seoTitle: "국내 ETF 시장 동향과 추천 포트폴리오 | 투자 인사이트",
        seoDescription: "국내 ETF 시장의 최신 동향과 투자자 유형별 추천 포트폴리오를 제시합니다. ETF 선택 기준과 투자 전략을 상세히 설명합니다.",
        seoKeywords: "국내 ETF, ETF 포트폴리오, 테마 ETF, 분산투자, ETF 투자 전략"
      },
      {
        title: "금리 상승기 채권 투자 전략",
        slug: "bond-investment-strategy-rising-rates",
        content: "# 금리 상승기 채권 투자 전략\n\n금리 상승 국면에서 채권 투자자들이 고려해야 할 리스크 관리 방법과 수익률 향상 전략을 살펴보겠습니다.\n\n## 금리와 채권 가격의 관계\n\n### 기본 원리\n- 금리 상승 → 채권 가격 하락\n- 금리 하락 → 채권 가격 상승\n- 듀레이션이 길수록 금리 민감도 높음\n\n### 듀레이션의 이해\n- **단기 채권**: 듀레이션 낮음, 금리 리스크 작음\n- **장기 채권**: 듀레이션 높음, 금리 리스크 큼\n- **플로팅 레이트**: 금리 변동에 따라 이자율 조정\n\n## 금리 상승기 투자 전략\n\n### 1. 듀레이션 단축\n- 단기 채권 비중 확대\n- 장기 채권 비중 축소\n- 평균 듀레이션 2-3년 유지\n\n### 2. 크레딧 리스크 관리\n- 투자등급 채권 중심 투자\n- 정부채권 비중 유지\n- 회사채 선별 투자\n\n### 3. 다각화 전략\n- 만기별 분산 투자\n- 신용등급별 분산 투자\n- 통화별 분산 투자\n\n## 추천 채권 포트폴리오\n\n### 안전형 포트폴리오\n- 국고채 (1-3년) 40%\n- 통안채 30%\n- 회사채 (AA 이상) 20%\n- 해외채권 10%\n\n### 수익추구형 포트폴리오\n- 국고채 (1-3년) 30%\n- 회사채 (A 이상) 40%\n- 하이일드 채권 20%\n- 해외채권 10%\n\n## 리스크 관리 방법\n\n1. **금리 리스크**: 듀레이션 조정\n2. **신용 리스크**: 신용등급 분석\n3. **유동성 리스크**: 거래량 확인\n4. **환율 리스크**: 헤징 전략 고려\n\n## 결론\n\n금리 상승기에는 단기 채권 중심의 포트폴리오 구성과 신용 리스크 관리가 중요합니다. 시장 상황에 따라 유연하게 포트폴리오를 조정하는 것이 성공적인 채권 투자의 핵심입니다.",
        excerpt: "금리 상승 국면에서 채권 투자자들이 고려해야 할 리스크 관리 방법과 수익률 향상 전략을 살펴보겠습니다.",
        category: "bonds",
        tags: ["채권", "금리", "듀레이션", "리스크관리", "포트폴리오"],
        featuredImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
        published: true,
        seoTitle: "금리 상승기 채권 투자 전략 | 투자 인사이트",
        seoDescription: "금리 상승 국면에서의 채권 투자 전략과 리스크 관리 방법을 제시합니다. 듀레이션 조정과 포트폴리오 구성 방법을 상세히 설명합니다.",
        seoKeywords: "채권 투자, 금리 상승, 듀레이션, 채권 전략, 리스크 관리"
      }
    ];

    samplePosts.forEach(post => {
      this.createBlogPost(post);
    });
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
      createdAt: now,
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
}

export const storage = new MemStorage();
