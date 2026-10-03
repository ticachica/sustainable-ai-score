// Cloudflare Worker for the SustainableAI Score dashboard.
//
// Static files in this repo (index.html, data/providers.json and everything
// else) are served through the ASSETS binding. Requests that do not match a
// static file fall through to this script, which is how GET /api/providers
// gets answered.
//
// The dataset is not duplicated here. The endpoint reads data/providers.json
// back through the ASSETS binding, so the JSON file remains the single source
// of truth for both the API and the static fallback.

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const DATASET_PATH = '/data/providers.json';
const API_PATHS = ['/api/providers', '/api/providers.json'];

function json(body, status, extraHeaders = {}) {
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (API_PATHS.indexOf(url.pathname) !== -1) {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json(JSON.stringify({ error: 'Method not allowed' }), 405);
      }
      if (!env || !env.ASSETS) {
        return json(JSON.stringify({ error: 'ASSETS binding unavailable' }), 500);
      }

      const assetUrl = new URL(DATASET_PATH, url.origin);
      assetUrl.search = '';
      const assetResponse = await env.ASSETS.fetch(
        new Request(assetUrl.toString(), { method: 'GET' })
      );

      if (!assetResponse.ok) {
        return json(
          JSON.stringify({ error: 'Dataset unavailable', status: assetResponse.status }),
          502
        );
      }

      const body = await assetResponse.text();
      // Fail loudly here rather than letting a broken dataset reach clients.
      try {
        JSON.parse(body);
      } catch (error) {
        return json(
          JSON.stringify({
            error: 'Dataset is malformed',
            detail: String(error && error.message ? error.message : error),
          }),
          500
        );
      }

      return json(body, 200, { 'x-data-source': 'worker-api' });
    }

    // Everything else is a static asset.
    if (!env || !env.ASSETS) {
      return new Response('ASSETS binding unavailable', { status: 500 });
    }
    return env.ASSETS.fetch(request);
  },
};
