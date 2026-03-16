import { readFileSync } from 'fs';

const API_URL = process.env.BLOG_API_URL ?? 'https://xmr402.org/api/blog/publish';
const API_KEY = readFileSync(
  new URL('../.blog-api-key', import.meta.url),
  'utf-8'
).trim();

const postFile = process.argv[2];
if (!postFile) {
  console.error('Usage: npx tsx scripts/publish-post.ts <post.json>');
  process.exit(1);
}

const post = JSON.parse(readFileSync(postFile, 'utf-8'));

console.log(`Publishing "${post.title?.en}" to ${API_URL}...`);

const res = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify(post),
});

const body = await res.json();
if (res.ok) {
  console.log(`Published successfully: /blog/${body.slug}`);
} else {
  console.error(`Failed (${res.status}):`, body);
  process.exit(1);
}
