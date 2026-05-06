import React from 'react';
import { Gamepad2, Tv, Video, Sparkles } from 'lucide-react';

export default function ExperienceGrades({ readiness }) {
  if (!readiness) return null;

  const categories = [
    { 
      id: 'gaming', 
      label: 'Gaming', 
      icon: <Gamepad2 size={20} />, 
      data: readiness.gaming,
      desc: 'Valorant, CS, Mobile Legends' 
    },
    { 
      id: 'streaming', 
      label: 'Streaming', 
      icon: <Tv size={20} />, 
      data: readiness.streaming,
      desc: 'YouTube 4K, Netflix, Twitch' 
    },
    { 
      id: 'meetings', 
      label: 'Meetings', 
      icon: <Video size={20} />, 
      data: readiness.meetings,
      desc: 'Zoom, Google Meet, Discord' 
    },
  ];

  return (
    <div className="card">
      <div className="card-title">
        <Sparkles size={20} color="var(--accent-primary)" />
        Experience Readiness
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {categories.map(cat => (
          <div 
            key={cat.id}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '3px', 
                background: cat.data.color 
              }} 
            />
            
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: `${cat.data.color}15`, 
                color: cat.data.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              {cat.icon}
            </div>

            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{cat.label}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{cat.desc}</div>

            <div 
              style={{ 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                color: cat.data.color, 
                background: `${cat.data.color}10`,
                padding: '4px 10px',
                borderRadius: '99px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {cat.data.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
