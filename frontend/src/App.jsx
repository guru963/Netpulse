import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { Activity, Zap, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react'
import HealthScore from './components/HealthScore'
import LatencyGraph from './components/LatencyGraph'
import HopVisualizer from './components/HopVisualizer'
import DiagnosisCard from './components/DiagnosisCard'
import WorkerBadge from './components/WorkerBadge'
import ExperienceGrades from './components/ExperienceGrades'
import './App.css'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://latency-worker.gururaman2006.workers.dev/';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const POLL_MS = 12000;

function App() {
  const [data, setData] = useState(null);
  const [workerInfo, setWorkerInfo] = useState(null);
  const [status, setStatus] = useState('idle');   // idle | scanning | done | error
  const [lastUpdated, setLastUpdated] = useState(null);
  const [scanCount, setScanCount] = useState(0);

  const runDiagnostics = useCallback(async () => {
    setStatus('scanning');

    // 1. Measure CF worker latency in parallel
    let workerLatency = null;
    let workerData = null;

    const workerPromise = axios.get(WORKER_URL, { timeout: 8000 })
      .then(r => { workerData = r.data; workerLatency = r.data.edge_latency_ms; })
      .catch(() => { });

    // 2. Measure direct latency to the backend
    const directStart = Date.now();
    let directLatency = null;
    try {
      await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      directLatency = Date.now() - directStart;
    } catch (err) {
      console.error('Backend unreachable', err);
      setStatus('error');
      return;
    }

    await workerPromise;

    // 3. Run full diagnostic sweep
    try {
      const res = await axios.post(`${BACKEND_URL}/diagnose`, {
        workerLatency,
        directLatency
      }, { timeout: 30000 });

      setData(res.data);
      setWorkerInfo(workerData);
      setLastUpdated(new Date());
      setScanCount(c => c + 1);
      setStatus('done');
    } catch (err) {
      console.error('Diagnosis failed', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    runDiagnostics();
    const id = setInterval(runDiagnostics, POLL_MS);
    return () => clearInterval(id);
  }, [runDiagnostics]);

  const scanning = status === 'scanning';

  return (
    <div className="app-root">
      <div className="bg-grid" aria-hidden="true" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo-section">
            <div className="logo-box">NP</div>
            <div>
              <h1 className="app-title">NetPulse</h1>
              <p className="app-subtitle">Real-time network intelligence dashboard</p>
            </div>
          </div>
          <div className="header-actions">
            {workerInfo && <WorkerBadge info={workerInfo} />}
            <button
              className={`btn-primary ${scanning ? 'loading' : ''}`}
              onClick={runDiagnostics}
              disabled={scanning}
            >
              {scanning ? (
                <><RefreshCw size={18} className="icon-spin" /> Analyzing...</>
              ) : (
                <><Zap size={18} /> Run Diagnostics</>
              )}
            </button>
          </div>
        </header>

        {/* Status indicator */}
        {lastUpdated && (
          <div className="status-indicator">
            <div className={`dot ${scanning ? 'pulsing' : ''}`} />
            <span>
              {scanning ? 'System active: running deep-probe...' : `Last update: ${lastUpdated.toLocaleTimeString()} (#${scanCount})`}
            </span>
          </div>
        )}

        {/* Content */}
        {status === 'idle' || (status === 'scanning' && !data) ? (
          <div className="loader-container">
            <div className="loader-visual">
              <div className="loader-ring" />
              <div className="loader-orb" />
            </div>
            <h2>Building Network Map</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '1rem auto' }}>
              Benchmarking DNS resolvers, analyzing HTTP packet routes, and measuring transit latency...
            </p>
          </div>
        ) : status === 'error' ? (
          <div className="error-view">
            <AlertCircle size={48} color="var(--status-error)" />
            <h2>System Disconnected</h2>
            <p>The NetPulse backend is currently unreachable. Please verify that the server is active on port 3000.</p>
            <button className="btn-primary" onClick={runDiagnostics} style={{ margin: '0 auto' }}>
              <RefreshCw size={18} /> Reconnect
            </button>
          </div>
        ) : data ? (
          <div className="dashboard-grid">
            <HealthScore
              score={data.healthScore}
              grade={data.grade}
              gradeLabel={data.gradeLabel}
              packetLoss={data.diagnostics.packetLoss}
            />
            <DiagnosisCard
              summary={data.summary}
              issues={data.issues}
              network={data.network}
            />
            
            <div className="section-divider full-width" />

            <div className="full-width">
              <ExperienceGrades readiness={data.readiness} />
            </div>

            <div className="section-divider full-width" />
            <div className="full-width">
              <LatencyGraph
                httpData={data.diagnostics.http.data}
                httpMeta={data.diagnostics.http.meta}
                dnsData={data.diagnostics.dns}
                avgLatency={data.diagnostics.http.avg_latency}
              />
            </div>

            <div className="section-divider full-width" />

            <div className="full-width">
              <HopVisualizer hops={data.diagnostics.traceroute} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
