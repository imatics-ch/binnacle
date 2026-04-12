import { NextResponse } from 'next/server';

// In-memory cache to prevent destroying the 50 req/hr Unsplash limit
const urlCache = new Map<string, { url: string; expiry: number }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tags = searchParams.get('tags') || 'nature';
  const appName = searchParams.get('app') || 'generic';
  
  const cacheKey = `${appName}-${tags}`;
  const now = Date.now();
  
  // Check if we have a valid cached URL for this app
  if (urlCache.has(cacheKey)) {
    const cached = urlCache.get(cacheKey)!;
    if (now < cached.expiry) {
       return NextResponse.json({ url: cached.url, cached: true });
    }
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
     return NextResponse.json(
       { error: 'UNSPLASH_ACCESS_KEY is required in .env.local to fetch photos' }, 
       { status: 500 }
     );
  }

  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(tags)}&orientation=landscape`, {
       headers: {
         'Authorization': `Client-ID ${accessKey}`
       },
       cache: 'no-store' // Avoid persistent disk caches so we rotate properly when memory cache expires
    });
    
    if (!res.ok) {
       const text = await res.text();
       throw new Error(`Unsplash API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const photoUrl = data.urls.regular;

    // Store in cache for 1 hour (3600000 ms)
    urlCache.set(cacheKey, { url: photoUrl, expiry: now + 3600000 });

    return NextResponse.json({ url: photoUrl, cached: false });
  } catch (err: any) {
    console.error('[Unsplash API]', err);
    // If request fails due to rate limit, fallback to older cache if available (even if expired)
    if (urlCache.has(cacheKey)) {
        return NextResponse.json({ url: urlCache.get(cacheKey)!.url, cached: true, fallback: true });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

