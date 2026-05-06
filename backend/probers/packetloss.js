const ping = require('ping');

exports.measure = async () => {
  const targets = [
    { ip: '8.8.8.8', label: 'Google DNS' },
    { ip: '1.1.1.1', label: 'Cloudflare' },
  ];

  const target = targets[0]; // primary
  const COUNT = 10;

  try {
    const isWindows = process.platform === 'win32';
    const extra = isWindows ? ['-n', String(COUNT)] : ['-c', String(COUNT)];

    const res = await ping.promise.probe(target.ip, { timeout: 10, extra });

    const lossPct = parseFloat(res.packetLoss) || 0;
    const received = COUNT - Math.round((lossPct * COUNT) / 100);
    const avgMs = parseFloat(res.avg) || null;

    let quality = 'excellent';
    if (lossPct > 20) quality = 'critical';
    else if (lossPct > 10) quality = 'poor';
    else if (lossPct > 3) quality = 'fair';
    else if (lossPct > 0) quality = 'good';

    return {
      module: 'packetloss',
      status: 'success',
      data: {
        sent: COUNT,
        received,
        loss_percentage: lossPct,
        avg_rtt_ms: avgMs,
        quality,
        target: target.label,
      },
    };
  } catch (err) {
    return {
      module: 'packetloss',
      status: 'error',
      data: { loss_percentage: 100, sent: COUNT, received: 0, quality: 'critical' },
    };
  }
};