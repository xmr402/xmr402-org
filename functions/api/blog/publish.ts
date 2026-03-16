import type { Env, BlogPost, BlogPostMeta } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${context.env.BLOG_API_KEY}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const post: BlogPost = await context.request.json();

  if (!post.slug || !post.title?.en || !post.content?.en || !post.date) {
    return Response.json({ error: 'Missing required fields: slug, title.en, content.en, date' }, { status: 400 });
  }

  await context.env.BLOG_KV.put(`post:${post.slug}`, JSON.stringify(post));

  const currentIndex: BlogPostMeta[] =
    (await context.env.BLOG_KV.get('posts:index', 'json')) ?? [];

  const meta: BlogPostMeta = {
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    date: post.date,
    tags: post.tags,
    ogImage: post.ogImage,
    updatedAt: post.updatedAt,
  };
  const existingIdx = currentIndex.findIndex((p) => p.slug === post.slug);
  if (existingIdx >= 0) {
    currentIndex[existingIdx] = meta;
  } else {
    currentIndex.push(meta);
  }
  currentIndex.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  await context.env.BLOG_KV.put('posts:index', JSON.stringify(currentIndex));

  return Response.json({ success: true, slug: post.slug });
};
