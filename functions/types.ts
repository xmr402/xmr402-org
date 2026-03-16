export interface BlogPostMeta {
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  author: string;
  date: string;
  tags: string[];
  ogImage: string;
  coverImage?: string;
  updatedAt?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: Record<string, string>;
}

export interface Env {
  BLOG_KV: KVNamespace;
  BLOG_API_KEY: string;
}
