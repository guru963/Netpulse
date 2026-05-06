import React from 'react';
import { Cloud, MapPin } from 'lucide-react';

export default function WorkerBadge({ info }) {
  if (!info) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Cloud size={16} color="var(--accent-primary)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{info.colo}</span>
      </div>
      <div style={{ width: '1px', height: '14px', background: 'var(--card-border)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <MapPin size={14} color="var(--text-dim)" />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{info.city}, {info.country}</span>
      </div>
    </div>
  );
}
