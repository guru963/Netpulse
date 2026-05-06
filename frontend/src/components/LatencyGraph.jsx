import React from 'react';
import { BarChart2, Globe, Server } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

function latencyColor(ms) {
  if (ms <= 0 || ms === -1) return '#1e293b';
  if (ms < 80)  return 'var(--status-success)';
  if (ms < 150) return 'var(--status-warning)';
  return 'var(--status-error)';
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#0f172a', border: '1px solid var(--card-border)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.9rem' }}>{d.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: latencyColor(d.raw), fontFamily: 'var(--font-mono)' }}>
          {d.raw === -1 ? 'Timeout' : `${d.raw}ms`}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
          {d.type}
        </div>
      </div>
    </div>
  );
};

export default function LatencyGraph({ httpData = {}, httpMeta = {}, dnsData = {}, avgLatency }) {
  const rows = [];

  // HTTP
  Object.entries(httpData).forEach(([key, latency]) => {
    const label = httpMeta[key]?.label || key;
    rows.push({ name: label, latency: latency === -1 ? 5 : latency, raw: latency, type: 'HTTP' });
  });

  // DNS
  const dnsLabels = dnsData.labels || {};
  const dnsValues = { isp: dnsData.isp, cloudflare_1_1_1_1: dnsData.cloudflare_1_1_1_1, google_8_8_8_8: dnsData.google_8_8_8_8 };
  Object.entries(dnsValues).forEach(([key, latency]) => {
    if (latency === undefined) return;
    rows.push({
      name: dnsLabels[key] || key,
      latency: latency === -1 ? 5 : latency,
      raw: latency,
      type: 'DNS',
    });
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div className="card-title" style={{ margin: 0 }}>
          <BarChart2 size={20} color="var(--accent-primary)" />
          Latency Distribution
        </div>
        
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={14} color="var(--text-dim)" />
            <span style={{ color: 'var(--text-secondary)' }}>Avg Response: </span>
            <span style={{ color: latencyColor(avgLatency), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{avgLatency}ms</span>
          </div>
        </div>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 40 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontWeight: 500 }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              tickFormatter={v => `${v}ms`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={80} stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="5 5" />
            <ReferenceLine y={150} stroke="rgba(245, 158, 11, 0.2)" strokeDasharray="5 5" />
            <Bar dataKey="latency" radius={[6, 6, 0, 0]}>
              {rows.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={latencyColor(entry.raw)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
        {[
          { label: 'Optimal', color: 'var(--status-success)', range: '< 80ms' },
          { label: 'Moderate', color: 'var(--status-warning)', range: '80-150ms' },
          { label: 'Critical', color: 'var(--status-error)', range: '> 150ms' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{item.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
