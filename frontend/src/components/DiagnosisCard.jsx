import React, { useState } from 'react';
import { ClipboardList, AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, Copy, Check, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function DiagnosisCard({ summary, issues = [], network = {} }) {
  const getIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertCircle size={18} color="var(--status-error)" />;
      case 'warning':  return <AlertTriangle size={18} color="var(--status-warning)" />;
      case 'info':     return <Info size={18} color="var(--status-info)" />;
      default:         return <CheckCircle2 size={18} color="var(--status-success)" />;
    }
  };

  const getBorderColor = (severity) => {
    switch (severity) {
      case 'critical': return 'rgba(239, 68, 68, 0.2)';
      case 'warning':  return 'rgba(245, 158, 11, 0.2)';
      case 'info':     return 'rgba(59, 130, 246, 0.2)';
      default:         return 'var(--card-border)';
    }
  };

  const [copied, setCopied] = useState(false);

  const copyReport = () => {
    const report = `NetPulse Diagnostic Report\n` +
      `----------------------------\n` +
      `Summary: ${summary}\n\n` +
      `Issues Found:\n` +
      issues.map(i => `- [${i.severity.toUpperCase()}] ${i.title}: ${i.plain}`).join('\n') +
      `\n\nGenerated on: ${new Date().toLocaleString()}`;
    
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    const title = "NetPulse Network Diagnostic Report";
    const date = new Date().toLocaleString();
    
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text(title, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${date}`, 20, 30);
    doc.text(`Network: ${network.org || network.isp || 'Campus Network'} (${network.ip || 'Local'})`, 20, 35);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary:", 20, 50);
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(summary, 170), 20, 60);
    
    let y = 80;
    doc.setFontSize(14);
    doc.text("Technical Issues Detected:", 20, y);
    y += 10;
    
    issues.forEach((issue, index) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`, 20, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(issue.plain, 160);
      doc.text(lines, 25, y);
      y += (lines.length * 5) + 5;
    });
    
    doc.save(`NetPulse_Report_${network.org || 'Campus'}.pdf`);
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClipboardList size={20} color="var(--accent-primary)" />
          System Analysis
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={copyReport}
            title="Copy Text Report"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '8px', 
              padding: '6px 10px',
              color: copied ? 'var(--status-success)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button 
            onClick={downloadPdf}
            title="Download PDF Report"
            style={{ 
              background: 'var(--accent-primary)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '6px 12px',
              color: 'white',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FileDown size={14} />
            PDF Report
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <CheckCircle2 size={12} color="var(--status-success)" />
          Detected: {network.org || network.isp || 'Campus Network'}
        </div>
      </div>

      <div className="separator" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--card-border), transparent)', margin: '0 0 1.5rem' }} />


      <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>{summary}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)' }}>
            <CheckCircle2 size={32} color="var(--status-success)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p>No network issues detected. Your connection is optimal.</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div 
              key={issue.id} 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: `1px solid ${getBorderColor(issue.severity)}`,
                borderRadius: '16px',
                padding: '1.25rem',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {getIcon(issue.severity)}
                <h4 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{issue.title}</h4>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                {issue.plain}
              </p>

              {issue.fix && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '10px' }}>
                  <ArrowRight size={14} color="var(--status-success)" style={{ marginTop: '3px' }} />
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--status-success)', display: 'block', marginBottom: '2px' }}>Recommended Fix</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{issue.fix}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
