const axios = require('axios');

const ENDPOINTS = [
  { key: 'google', label: 'Google', url: 'https://www.google.com', category: 'global' },
  { key: 'cloudflare', label: 'Cloudflare', url: 'https://www.cloudflare.com', category: 'cdn' },
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com', category: 'streaming' },
  { key: 'jio_cdn', label: 'Jio CDN', url: 'https://www.jio.com', category: 'india' },
  { key: 'amazon', label: 'Amazon India', url: 'https://www.amazon.in', category: 'india' },
  { key: 'cf_trace', label: 'CF Edge (trace)', url: 'https://1.1.1.1/cdn-cgi/trace', category: 'cdn' },
  { key: 'github', label: 'GitHub', url: 'https://github.com', category: 'global' },
  { key: 'hotstar', label: 'Hotstar', url: 'https://www.hotstar.com', category: 'streaming' },
];

exports.measure = async () => {
  const results = {};
  const meta = {};

  const probes = ENDPOINTS.map(async ({ key, label, url, category }) => {
    const start = Date.now();
    try {
      await axios.get(url, {
        timeout: 6000,
        headers: { 'User-Agent': 'NetPulse/1.0 (network-diagnostic-tool)' },
        maxRedirects: 3,
      });
      results[key] = Date.now() - start;
    } catch {
      results[key] = -1;
    }
    meta[key] = { label, category };
  });

  await Promise.all(probes);

  const valid = Object.values(results).filter(v => v !== -1);
  const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : -1;

  return {
    module: 'http',
    status: 'success',
    data: results,
    meta,
    avg_latency: avg,
  };
};