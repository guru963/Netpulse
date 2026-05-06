const dns = require('dns').promises;

exports.measure = async () => {
  const domain = 'google.com';
  const resolvers = [
    { name: 'isp', label: 'Your ISP DNS', ip: null },
    { name: 'cloudflare_1_1_1_1', label: 'Cloudflare 1.1.1.1', ip: '1.1.1.1' },
    { name: 'google_8_8_8_8', label: 'Google 8.8.8.8', ip: '8.8.8.8' },
    { name: 'quad9', label: 'Quad9 9.9.9.9', ip: '9.9.9.9' },
  ];

  const results = {};
  const labels = {};

  for (const resolver of resolvers) {
    let resolverInstance = dns;
    if (resolver.ip) {
      const { Resolver } = require('dns').promises;
      resolverInstance = new Resolver();
      resolverInstance.setServers([resolver.ip]);
    }

    // Run 3 trials and take the median for accuracy
    const trials = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      try {
        await resolverInstance.resolve(domain);
        trials.push(Date.now() - start);
      } catch {
        trials.push(-1);
      }
    }

    const valid = trials.filter(t => t !== -1);
    results[resolver.name] = valid.length > 0
      ? Math.round(valid.sort((a, b) => a - b)[Math.floor(valid.length / 2)])
      : -1;
    labels[resolver.name] = resolver.label;
  }

  // Determine fastest resolver
  const best = Object.entries(results)
    .filter(([, v]) => v !== -1)
    .sort(([, a], [, b]) => a - b)[0];

  return {
    module: 'dns',
    status: 'success',
    data: results,
    labels,
    fastest: best ? best[0] : null,
    recommendation: results.isp > 80 && results.cloudflare_1_1_1_1 !== -1
      ? 'Switch to 1.1.1.1 for faster DNS — it\'s free and takes 30 seconds to set up.'
      : null
  };
};