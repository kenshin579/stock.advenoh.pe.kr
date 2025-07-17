import Fuse from 'fuse.js';
import { BlogPost } from '@shared/schema';

export interface SearchResult {
  item: BlogPost;
  score?: number;
}

export class BlogSearchEngine {
  private fuse: Fuse<BlogPost>;

  constructor(posts: BlogPost[]) {
    const options = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'excerpt', weight: 0.3 },
        { name: 'content', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      shouldSort: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    };

    this.fuse = new Fuse(posts, options);
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.fuse.search(query);
    return results.map(result => ({
      item: result.item,
      score: result.score,
    }));
  }

  updateIndex(posts: BlogPost[]) {
    this.fuse.setCollection(posts);
  }
}
