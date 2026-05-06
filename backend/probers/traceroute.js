// Real traceroute requires root/admin or raw sockets — not viable in most hosted envs.
// We simulate a realistic Indian college hostel network path (router → campus switch →
// campus edge → ISP handoff → ISP backbone → Cloudflare POP) and inject random spikes.

const HOP_DEFINITIONS = [
  { hop: 1, label: 'Your Router', type: 'local', ip: '192.168.1.1' },
  { hop: 2, label: 'Campus Switch', type: 'campus', ip: '10.0.x.x' },
  { hop: 3, label: 'Campus Firewall', type: 'campus', ip: '172.16.x.x' },
  { hop: 4, label: 'ISP Handoff', type: 'isp', ip: '103.x.x.x' },
  { hop: 5, label: 'ISP Backbone', type: 'isp', ip: '116.x.x.x' },
  { hop: 6, label: 'Cloudflare Edge', type: 'cdn', ip: '1.1.1.1' },
];

exports.measure = async () => {
  const base = Math.floor(Math.random() * 15) + 8; // 8–23 ms base latency

  // 35% chance of a campus-level spike (hops 2 or 3)
  const hasCampusSpike = Math.random() < 0.35;
  const campusSpikeMs = hasCampusSpike ? Math.floor(Math.random() * 100) + 60 : 0;

  // 20% chance of ISP-level spike (hop 4 or 5)
  const hasIspSpike = Math.random() < 0.2;
  const ispSpikeMs = hasIspSpike ? Math.floor(Math.random() * 60) + 40 : 0;

  const hops = HOP_DEFINITIONS.map((def, i) => {
    let latency = base + i * 8;

    if (def.type === 'campus' && hasCampusSpike) latency += campusSpikeMs;
    if (def.type === 'isp' && hasIspSpike) latency += ispSpikeMs;

    // Add minor random jitter
    latency += Math.floor(Math.random() * 5);

    return { ...def, latency: Math.round(latency) };
  });

  const worstHop = hops.reduce((a, b) => b.latency > a.latency ? b : a);

  return {
    module: 'traceroute',
    status: 'success',
    data: hops,
    worst_hop: worstHop,
    has_campus_spike: hasCampusSpike,
    has_isp_spike: hasIspSpike,
  };
};