import type { Env, BlogPostMeta } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '6', 10)));

  const allPosts: BlogPostMeta[] =
    (await context.env.BLOG_KV.get('posts:index', 'json')) ?? [];

  const total = allPosts.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const posts = allPosts.slice(start, start + limit);

  return Response.json(
    { posts, page, limit, total, totalPages },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
};
