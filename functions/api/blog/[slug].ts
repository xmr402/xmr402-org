import type { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  const post = await context.env.BLOG_KV.get(`post:${slug}`, 'json');

  if (!post) {
    return Response.json({ error: 'Post not found' }, { status: 404 });
  }

  return Response.json(post, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
};
