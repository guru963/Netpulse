export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const edgeStart = Date.now();

    // Ping the backend to measure edge → origin latency
    // Replace BACKEND_URL with your deployed backend URL
    const BACKEND_URL = env.BACKEND_URL || 'https://your-backend.railway.app/api/health';

    let originLatency = null;
    let originReachable = false;
    try {
      const originStart = Date.now();
      const originRes = await fetch(BACKEND_URL, { cf: { cacheTtl: 0 } });
      originLatency = Date.now() - originStart;
      originReachable = originRes.ok;
    } catch {
      originReachable = false;
    }

    const totalEdgeMs = Date.now() - edgeStart;

    const payload = {
      // The latency FROM Cloudflare's edge TO your origin
      edge_latency_ms: originLatency,
      // Total time the worker took (includes fetch overhead)
      worker_latency_ms: totalEdgeMs,
      // Which Cloudflare data-center handled this request
      colo: request.cf?.colo || 'unknown',
      // The city of the CF data-center
      city: request.cf?.city || 'unknown',
      // Country of the end-user
      country: request.cf?.country || 'unknown',
      // Client IP (for display only)
      clientIp: request.headers.get('CF-Connecting-IP') || 'unknown',
      originReachable,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  },
};