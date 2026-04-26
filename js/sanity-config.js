/**
 * Sanity frontend helpers — loaded before cms.js and blog.js.
 * After running: npm create sanity@latest -- --output-path studio
 * replace YOUR_PROJECT_ID below with the project ID shown in studio/sanity.config.js
 */

const SANITY_PROJECT_ID = 'k8jxztyr'; // ← replace after studio setup
const SANITY_DATASET    = 'production';
const SANITY_API_VER    = '2024-01-01';

async function sanityFetch(groqQuery) {
  const q   = encodeURIComponent(groqQuery);
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}?query=${q}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sanity request failed: ' + res.status);
  const data = await res.json();
  return data.result;
}

function sanityImageUrl(asset, width) {
  if (!asset || !asset._ref) return null;
  // ref format: "image-{id}-{WxH}-{ext}"  e.g. "image-Tb9Ew8CX-2000x3000-jpg"
  const parts = asset._ref.split('-');
  const ext   = parts[parts.length - 1];
  const dims  = parts[parts.length - 2];
  const id    = parts.slice(1, parts.length - 2).join('-');
  let url = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${ext}`;
  if (width) url += `?w=${width}&fit=crop&auto=format`;
  return url;
}
