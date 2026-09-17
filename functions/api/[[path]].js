export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(context.request.url);
    const path = url.pathname.replace('/api/', '');
    const queryString = url.search;
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_ACCESS_TOKEN = context.env.VITE_TMDB_READ_ACCESS_TOKEN;

    if (!TMDB_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({
          success: false,
          status_code: 401,
          status_message: "TMDB Access Token not configured in environment variables"
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    // Cloudflare Edge Cache check for GET requests
    const cache = typeof caches !== 'undefined' ? caches.default : null;
    const cacheKey = new Request(url.toString(), context.request);

    if (cache && context.request.method === 'GET') {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const hitHeaders = new Headers(cachedResponse.headers);
        hitHeaders.set('X-Cache-Status', 'HIT');
        Object.entries(corsHeaders).forEach(([k, v]) => hitHeaders.set(k, v));
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: hitHeaders,
        });
      }
    }

    const fullURL = `${TMDB_BASE_URL}/${path}${queryString}`;

    const response = await fetch(fullURL, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify(errorData),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          }
        }
      );
    }

    const data = await response.json();
    const responseHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Cache-Status': 'MISS',
      ...corsHeaders,
    };

    const edgeResponse = new Response(JSON.stringify(data), {
      status: 200,
      headers: responseHeaders,
    });

    // Store in Cloudflare Edge cache for subsequent hits
    if (cache && context.request.method === 'GET') {
      context.waitUntil(cache.put(cacheKey, edgeResponse.clone()));
    }

    return edgeResponse;
  } catch (error) {
    console.error('API Proxy Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        status_code: 500,
        status_message: "Internal server error: " + error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
}