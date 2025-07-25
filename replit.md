# Investment Insights Blog

## Overview

This is a Korean investment blog built with a modern full-stack architecture. The application focuses on providing investment insights about stocks, ETFs, bonds, and funds. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Theme**: Dark/light mode support with custom theme provider

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL session store (connect-pg-simple)
- **Development**: Hot module replacement with Vite integration

## Key Components

### Database Schema
The application uses three main tables:
- **users**: Basic user authentication (id, username, password)
- **blog_posts**: Blog content with SEO fields, categories, tags, and metrics
- **newsletter_subscribers**: Email subscription management

### API Endpoints
- `/api/blog-posts` - CRUD operations for blog posts with filtering and search
- `/api/newsletter/*` - Newsletter subscription management
- `/api/sitemap.xml` - Dynamic sitemap generation
- `/api/rss.xml` - RSS feed generation
- `/api/robots.txt` - Robots.txt generation

### Content Management
- **Categories**: stocks, etf, bonds, funds, analysis
- **Features**: Views/likes tracking, SEO optimization, markdown content
- **Search**: Full-text search across titles, content, excerpts, and tags
- **Admin Interface**: Blog post creation and management

## Data Flow

1. **Content Creation**: Admin interface for creating/editing blog posts
2. **Content Display**: Homepage with category filtering and search
3. **Content Consumption**: Individual blog post pages with engagement tracking
4. **Newsletter**: Email subscription system for regular updates
5. **SEO**: Automatic sitemap, RSS feed, and robots.txt generation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@radix-ui/***: UI component primitives
- **react-markdown**: Markdown rendering
- **wouter**: Lightweight routing

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling framework
- **ESBuild**: Production bundling

## Deployment Strategy

The application is configured for Replit **Static** deployment:
- **Development**: `npm run dev` starts both frontend and backend
- **Build**: `./build-static.sh` creates static frontend build
- **Production**: Static files served directly (no server-side functionality)
- **Database**: Not available in static deployment
- **Deployment Type**: Static - serves only React frontend
- **Configuration**: Both `replit.toml` and `.replit` contain deployment settings
- **Build Output**: Files placed in both `dist/public/` and `dist/` for compatibility
- **Limitations**: API endpoints, database features, and backend functionality not available

## Project Status: Next.js Migration (80% Complete) - TESTING PHASE

### Migration Progress (CSR → SSR)
**✅ Phase 1-2 Complete**: Next.js 15 App Router setup, component migration, blog data processing, build success
**✅ Core Implementation**: All pages, API routes, SEO optimization completed
**🔄 Phase 3 Current**: Performance testing, Next.js version deployment testing

### Project Structure (July 25, 2025)
- **`client/`** = Original **Vite + React + Wouter** version (currently running on port 5000)
- **`client_nextjs/`** = New **Next.js 15** version (build complete, ready for testing)
- **`client_backup/`** = Backup of original client folder

### Testing Next.js Version
To test the Next.js implementation:
1. Current workflow runs Vite version from `client/` folder
2. Next.js version is complete in `client_nextjs/` folder with `.next` build directory
3. **To test Next.js**: Manually run `cd client_nextjs && npm run dev` (port 3000)
4. **Both versions can run simultaneously** for comparison testing

### Target Metrics
- Lighthouse Score: >90 (vs current Vite: ~75)
- LCP (Largest Contentful Paint): <2.5s
- Feature Preservation: 100% (all 90+ posts, 6 series)

### Current Status (July 25, 2025) - Phase 2 Complete, Phase 3 Testing Ready
**Next.js Migration**: Successful complete migration from Vite+React+Wouter to Next.js 15 with App Router and static export mode. Build successful, 90+ blog posts properly parsed and accessible, all SEO features implemented with generateMetadata. **Ready for performance testing and deployment comparison.**

## Recent Changes

### January 25, 2025 - Next.js Migration Phase 2 Complete
- **Complete Architecture Migration**: Successfully migrated from Vite+React+Wouter to Next.js 15 with App Router
- **Core Pages Implemented**: Homepage, blog posts [slug], series pages, 404 page all working with SSG
- **API Routes Built**: /api/blog-posts, /api/categories, /api/sitemap.xml, /api/robots.txt for dynamic data
- **Component Compatibility**: All components updated for Next.js (removed Wouter dependencies, added 'use client')
- **Build Success**: Next.js build passes successfully with static export mode enabled
- **Contents Integration**: All 90+ blog posts from markdown files properly parsed and accessible
- **Routing System**: Dynamic routes working for blog posts and series with generateStaticParams
- **Structured Data**: Schema.org implementation for better SEO (Blog, Article, WebSite schemas)
- **Next.js 15 Compatibility**: Fixed params Promise type issues for dynamic routes
- **SEO Enhancement**: Complete generateMetadata implementation with Open Graph and Twitter Cards

### July 25, 2025
- **Internal Link Structure Enhancement Complete**: Comprehensive internal linking system for improved navigation and SEO
- **Related Posts System**: Implemented intelligent related post recommendations based on series (50pts), category (20pts), and tags (10pts per match)
- **Breadcrumb Navigation**: Added hierarchical navigation showing Home > Category > Series > Post path for better user orientation
- **Tag Cloud Implementation**: Created interactive tag cloud on homepage with 30 most popular tags, click-to-filter functionality
- **Enhanced Series Navigation**: Upgraded series component with previous/next post navigation and optional full series listing
- **Tag Filtering System**: Added client-side tag filtering with URL parameter support and appropriate empty states
- **Static Data Generation**: Updated build process to include series metadata for 6 series across 90 posts
- **Component Architecture**: Created 4 new reusable components (RelatedPosts, Breadcrumb, TagCloud, enhanced SeriesNavigation)
- **SEO Enhancement Phase 2 Complete**: Advanced image SEO optimization implementation
- **Image Utilities Enhancement**: Created contextual alt tag generation with investment-specific terminology
- **Lazy Loading System**: Implemented advanced image lazy loading with WebP support and accessibility features
- **Image Sitemap Generation**: Added `/image-sitemap.xml` endpoint with automatic image extraction from blog content
- **robots.txt Image Integration**: Updated robots.txt to include image sitemap for enhanced search engine discovery
- **SEO Enhancement Phase 1 Complete**: Comprehensive SEO improvements based on documentation analysis
- **Meta Tag Optimization**: Added robots, author, viewport meta tags with automatic description truncation (150-160 chars)
- **robots.txt Enhancement**: Added crawl-delay, additional directory blocking (/api/, /_next/), and host information
- **Sitemap Priority System**: Implemented dynamic priority scoring (recent posts: 0.9, older posts: 0.8) with 30-day recency threshold
- **Structured Data Library**: Created comprehensive structured data system with Blog, Article, Organization, Breadcrumb, and WebSite schemas
- **changefreq Optimization**: Updated sitemap frequencies (homepage: daily, admin: monthly, posts: weekly)
- **SEO Component Enhancement**: Enhanced SEOHead component with intelligent description truncation and additional meta tags
- **Author Information Update**: Changed author information from "투자분석가" to "Frank Oh" in both meta tags and structured data

### July 20, 2025
- **SEO Domain Configuration**: Updated RSS, sitemap, and robots.txt generation to use production domain
- **Custom Domain Priority**: Fixed domain selection to prioritize custom linked domains over `.replit.app` domains
- **Production Domain Support**: RSS feed, sitemap.xml, and robots.txt now automatically use `stock.advenoh.pe.kr` in production
- **Smart Domain Detection**: System filters out `.replit.app` domains from `REPLIT_DOMAINS` to find custom domains
- **Fallback Domain**: Set fallback domain to `stock.advenoh.pe.kr` for cases where `REPLIT_DOMAINS` is not configured
- **Series in Sitemap**: Added `/series` page to sitemap for better SEO coverage of series functionality

### July 19, 2025
- **Series Feature Complete**: Implemented comprehensive series functionality for blog content organization
- **Series Navigation**: Added series icon in header next to dark mode toggle, linking to series overview page
- **Series Pages**: Created main series listing page (/series) and individual series detail pages (/series/[name])
- **Series Integration**: Added series field to blog post schema and content importer
- **Series in Posts**: Implemented series navigation component within blog posts showing related articles
- **Series API**: Added /api/series endpoint with filtering support for blog posts by series
- **Static Series Data**: Generated 6 series from markdown content with proper static deployment support
- **Series Types**: Successfully imported series including "2025년 주간 주식 정리" (11 posts), "ETF 투자 기초가이드" (6 posts), "주식 대가들의 포트폴리오" (4 posts), and others
- **Static Deployment Fix**: Implemented complete static site generation system for deployment
- **Issue Resolved**: Fixed "글을 불러오는 중 오류가 발생했습니다" error in deployed version
- **Root Cause**: Static deployment had no backend API access, causing empty content
- **Static Data Generation**: Created build-time script that generates JSON files from markdown content
- **Smart Query Client**: Updated frontend to auto-detect deployment mode and use static JSON files
- **Search & Filtering**: Fixed header menu category filtering and search functionality navigation
- **Cover Images**: Removed cover images from blog post detail pages, updated default to real investment photo
- **Navigation System**: Fixed wouter routing issues with proper URL parameter handling

### July 18, 2025
- **Deployment Fix**: Updated build-static.sh to copy built files to both `dist/public/` and `dist/` directories
- **Issue Resolved**: Fixed deployment failure due to mismatched public directory configuration
- **Root Cause**: Deployment system expected files in `dist/` but Vite was building to `dist/public/`
- **Solution**: Modified build script to ensure files are available in both expected locations

### File Structure
- `/client` - React frontend application
- `/server` - Express.js backend
- `/shared` - Shared types and database schema
- `/migrations` - Database migration files

### Environment Setup
The application expects:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment setting (development/production)
- Optional: `REPLIT_DOMAINS` for proper URL generation in SEO features

The system uses in-memory storage fallback for development but is designed to work with PostgreSQL in production.