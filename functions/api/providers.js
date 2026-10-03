// Cloudflare Pages Function: GET /api/providers
//
// Serves the provider dataset as JSON over an edge API endpoint.
// Pages Functions run on the same Workers runtime that powers Cloudflare's
// edge, so this is a Worker API endpoint colocated with the static site.
//
// The dataset itself lives in /data/providers.json so it stays a single
// source of truth that is also directly fetchable as a static fallback.

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function jsonResponse(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const assetUrl = new URL(request.url);
  assetUrl.pathname = '/data/providers.json';
  assetUrl.search = '';

  try {
    if (!env || !env.ASSETS) {
      throw new Error('ASSETS binding unavailable');
    }
    const assetResponse = await env.ASSETS.fetch(
      new Request(assetUrl.toString(), { method: 'GET' })
    );
    if (!assetResponse.ok) {
      throw new Error(`asset fetch returned ${assetResponse.status}`);
    }
    const body = await assetResponse.text();
    // Validate before serving so a malformed dataset fails loudly here
    // rather than silently in every client.
    JSON.parse(body);
    return jsonResponse(body, 200, { 'x-data-source': 'pages-function' });
  } catch (error) {
    return jsonResponse(
      JSON.stringify({
        error: 'Failed to load provider data',
        detail: String(error && error.message ? error.message : error),
      }),
      500
    );
  }
}
