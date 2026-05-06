import React from 'react';
import { Route, Server, Home, Database, Globe } from 'lucide-react';

export default function HopVisualizer({ hops = [] }) {
  const getHopIcon = (type) => {
    switch (type) {
      case 'local':  return <Home size={16} />;
      case 'campus': return <Server size={16} />;
      case 'isp':    return <Database size={16} />;
      case 'cdn':    return <Globe size={16} />;
      default:       return <Route size={16} />;
    }
  };

  const getLatencyColor = (ms) => {
    if (ms < 40)  return 'var(--status-success)';
    if (ms < 100) return 'var(--status-warning)';
    return 'var(--status-error)';
  };

  return (
    <div className="card">
      <div className="card-title">
        <Route size={20} color="var(--accent-primary)" />
        Trace Path Analysis
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0 3rem' }}>
        {hops.map((hop, index) => (
          <React.Fragment key={hop.hop}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>
              {/* Node */}
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${hop.latency > 80 ? 'var(--status-warning)' : 'var(--card-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: hop.latency > 80 ? 'var(--status-warning)' : 'var(--text-secondary)',
                  zIndex: 2,
                  boxShadow: hop.latency > 80 ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none'
                }}
              >
                {getHopIcon(hop.type)}
              </div>

              {/* Label */}
              <div style={{ position: 'absolute', top: '50px', textAlign: 'center', width: '100px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hop.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{hop.ip}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: getLatencyColor(hop.latency), fontFamily: 'var(--font-mono)' }}>
                  {hop.latency}ms
                </div>
              </div>

              {/* Connecting Line */}
              {index < hops.length - 1 && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: 'calc(50% + 20px)', 
                    top: '20px', 
                    width: 'calc(100% - 40px)', 
                    height: '2px', 
                    background: `linear-gradient(90deg, ${getLatencyColor(hop.latency)}50, ${getLatencyColor(hops[index+1].latency)}50)`,
                    zIndex: 1
                  }} 
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)', marginTop: '2rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Real-time trace route visualization mapping your data packets from source to destination edge.
        </p>
      </div>
    </div>
  );
}
