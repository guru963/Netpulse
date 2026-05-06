import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

export default function HealthScore({ score, grade, gradeLabel, packetLoss }) {
  const getStatusColor = () => {
    if (score >= 85) return 'var(--status-success)';
    if (score >= 70) return 'var(--status-warning)';
    return 'var(--status-error)';
  };

  const getIcon = () => {
    if (score >= 85) return <ShieldCheck size={20} color="var(--status-success)" />;
    if (score >= 70) return <AlertTriangle size={20} color="var(--status-warning)" />;
    return <AlertCircle size={20} color="var(--status-error)" />;
  };

  return (
    <div className="card">
      <div className="card-title">
        <Activity size={20} color="var(--accent-primary)" />
        Network Vitality
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={getStatusColor()}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{score}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Grade {grade}</span>
            {getIcon()}
          </div>
          <p style={{ color: getStatusColor(), fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>{gradeLabel} Connection</p>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Packet Loss</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${100 - packetLoss.loss_percentage}%`, height: '100%', background: packetLoss.loss_percentage > 5 ? 'var(--status-error)' : 'var(--status-success)' }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{packetLoss.loss_percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
