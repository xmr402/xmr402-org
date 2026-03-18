#!/bin/bash
# Publish "Why XMR402 Matters Every Day" — deploys cover image + publishes post
set -e
cd "$(dirname "$0")"

echo "=== Step 1: Deploy site (pushes cover SVG to CDN) ==="
npm run deploy

echo ""
echo "=== Step 2: Publish blog post to KV ==="
npm run publish-post -- posts/why-xmr402-matters-every-day.json

echo ""
echo "=== Done! View at: https://xmr402.org/blog/why-xmr402-matters-every-day ==="
