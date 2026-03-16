import type { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const index = await context.env.BLOG_KV.get('posts:index', 'json');
  return Response.json(index ?? [], {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
};
