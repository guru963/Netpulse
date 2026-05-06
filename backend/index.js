const express = require('express');
const cors = require('cors');
const axios = require('axios');

const dnsProber = require('./probers/dns');
const httpProber = require('./probers/http');
const tracerouteProber = require('./probers/traceroute');
const packetlossProber = require('./probers/packetloss');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NetPulse backend is running.' });
});

// ── Individual probes ─────────────────────────────────────────────────────────
app.get('/api/probe/dns', async (req, res) => runProbe(dnsProber, res));
app.get('/api/probe/http', async (req, res) => runProbe(httpProber, res));
app.get('/api/probe/packetloss', async (req, res) => runProbe(packetlossProber, res));
app.get('/api/probe/traceroute', async (req, res) => runProbe(tracerouteProber, res));

async function runProbe(prober, res) {
  try { res.json(await prober.measure()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

// ── Full diagnostic sweep ─────────────────────────────────────────────────────
app.post('/api/diagnose', async (req, res) => {
  try {
    const { workerLatency, directLatency } = req.body || {};

    const [dnsResult, httpResult, packetResult, traceResult, geoResult] = await Promise.all([
      dnsProber.measure(),
      httpProber.measure(),
      packetlossProber.measure(),
      tracerouteProber.measure(),
      axios.get('http://ip-api.com/json?fields=status,message,country,city,isp,org,as,query').catch(() => ({ data: {} }))
    ]);

    const geoInfo = geoResult.data;

    // ── Score & issue cards ───────────────────────────────────────────────────
    let healthScore = 100;
    const issues = [];   // each: { id, severity, title, plain, fix }

    // --- DNS ---
    const ispDns = dnsResult.data.isp;
    const cfDns = dnsResult.data.cloudflare_1_1_1_1;
    if (ispDns === -1) {
      healthScore -= 20;
      issues.push({
        id: 'dns_fail',
        severity: 'critical',
        title: 'DNS Not Responding',
        plain: 'Your internet provider\'s name-lookup service is broken. This means websites take much longer to open.',
        fix: 'Go to Wi-Fi Settings → DNS → type 1.1.1.1',
      });
    } else if (ispDns > 120) {
      healthScore -= 15;
      issues.push({
        id: 'dns_slow',
        severity: 'warning',
        title: 'Slow DNS — Pages Load Late',
        plain: `Your college's DNS takes ${ispDns}ms to respond. Every website you open starts with this delay. Cloudflare's DNS takes only ${cfDns}ms.`,
        fix: 'Change DNS to 1.1.1.1 in Wi-Fi settings — free, takes 30 seconds.',
      });
    }

    // --- Packet Loss ---
    const loss = packetResult.data.loss_percentage;
    if (loss >= 20) {
      healthScore -= 30;
      issues.push({
        id: 'packetloss_high',
        severity: 'critical',
        title: 'Severe Packet Loss — Connection Dropping',
        plain: `${loss}% of data packets are being lost. Think of it like sending 10 WhatsApp messages and 2 never arriving. This causes calls to cut out, games to lag, and pages to fail to load.`,
        fix: 'Try moving closer to the Wi-Fi router, or switch to a wired LAN connection.',
      });
    } else if (loss >= 5) {
      healthScore -= 20;
      issues.push({
        id: 'packetloss_moderate',
        severity: 'warning',
        title: 'Unstable Connection — Packet Loss Detected',
        plain: `${loss}% of your data is dropping mid-air. You\'ll notice video calls freezing, games rubber-banding, and files downloading slowly.`,
        fix: 'Restart your router, reduce the number of connected devices, or move closer to the access point.',
      });
    }

    // --- Campus / ISP spike in traceroute ---
    const hops = traceResult.data;
    const campusSpike = hops.find(h => h.type === 'campus' && h.latency > 60);
    const ispSpike = hops.find(h => h.type === 'isp' && h.latency > 80);

    if (campusSpike) {
      healthScore -= 20;
      issues.push({
        id: 'campus_congestion',
        severity: 'warning',
        title: 'Campus Network Congested',
        plain: `Your data is getting stuck inside your college's own network at "${campusSpike.label}" (${campusSpike.latency}ms). This happens when too many students are online or the campus switch is overloaded.`,
        fix: 'Nothing you can do directly — this needs the college IT team. Try off-peak hours (late night).',
      });
    }

    if (ispSpike) {
      healthScore -= 15;
      issues.push({
        id: 'isp_routing',
        severity: 'warning',
        title: 'ISP Routing Delay',
        plain: `After leaving your campus, data slows down at your internet provider's backbone (${ispSpike.latency}ms). Your ISP may be routing traffic inefficiently or has congestion on their end.`,
        fix: 'Using a trusted VPN can sometimes bypass bad ISP routing.',
      });
    }

    // --- CDN benefit ---
    if (workerLatency && directLatency && directLatency > workerLatency * 1.4) {
      const savings = Math.round(directLatency - workerLatency);
      issues.push({
        id: 'cdn_benefit',
        severity: 'info',
        title: `CDN Would Save You ${savings}ms`,
        plain: `Cloudflare's edge server in your region reaches you in ${Math.round(workerLatency)}ms, but going directly to the origin server takes ${Math.round(directLatency)}ms. A CDN acts like a content shortcut near you.`,
        fix: 'Websites using Cloudflare CDN will load faster for you automatically.',
      });
    }

    // --- High overall HTTP ---
    const avgHttp = httpResult.avg_latency;
    if (avgHttp > 200) {
      healthScore -= 15;
      issues.push({
        id: 'http_high',
        severity: 'warning',
        title: 'High Overall Web Latency',
        plain: `On average, websites are taking ${avgHttp}ms just to respond. This compounds with DNS delays and makes everything feel sluggish.`,
        fix: 'Check if your router firmware is up to date, or contact your ISP.',
      });
    }

    // ── Clamp score ───────────────────────────────────────────────────────────
    healthScore = Math.max(0, healthScore);

    // ── Grade ─────────────────────────────────────────────────────────────────
    let grade, gradeLabel;
    if (healthScore >= 85) { grade = 'A'; gradeLabel = 'Excellent'; }
    else if (healthScore >= 70) { grade = 'B'; gradeLabel = 'Good'; }
    else if (healthScore >= 55) { grade = 'C'; gradeLabel = 'Fair'; }
    else if (healthScore >= 35) { grade = 'D'; gradeLabel = 'Poor'; }
    else { grade = 'F'; gradeLabel = 'Critical'; }

    // ── Summary sentence ──────────────────────────────────────────────────────
    let summary;
    if (issues.length === 0) {
      summary = 'Your network is performing well. No major issues detected.';
    } else {
      const critical = issues.filter(i => i.severity === 'critical').length;
      const warnings = issues.filter(i => i.severity === 'warning').length;
      summary = critical > 0
        ? `${critical} critical problem${critical > 1 ? 's' : ''} detected that are heavily impacting your network.`
        : `${warnings} issue${warnings > 1 ? 's' : ''} found that are slowing your connection.`;
    }

    // ── Readiness Grades (Gaming, Streaming, Meetings) ────────────────────────
    const readiness = {
      gaming: { score: 100, label: 'Excellent', color: 'var(--status-success)' },
      streaming: { score: 100, label: 'Excellent', color: 'var(--status-success)' },
      meetings: { score: 100, label: 'Excellent', color: 'var(--status-success)' },
    };

    // Gaming Logic (Highly sensitive to jitter/latency/loss)
    const gamingPing = avgHttp + (loss * 20);
    if (loss > 2 || gamingPing > 150) { readiness.gaming = { score: 40, label: 'Poor (Laggy)', color: 'var(--status-error)' }; }
    else if (loss > 0 || gamingPing > 80) { readiness.gaming = { score: 75, label: 'Fair', color: 'var(--status-warning)' }; }

    // Streaming Logic (Sensitive to bandwidth/loss, less to latency)
    if (loss > 5 || avgHttp > 300) { readiness.streaming = { score: 50, label: 'Buffering', color: 'var(--status-error)' }; }
    else if (loss > 1) { readiness.streaming = { score: 80, label: 'Good', color: 'var(--status-warning)' }; }

    // Meetings Logic (Sensitive to loss and upload/latency)
    if (loss > 3 || avgHttp > 250) { readiness.meetings = { score: 45, label: 'Unstable', color: 'var(--status-error)' }; }
    else if (loss > 0.5) { readiness.meetings = { score: 85, label: 'Stable', color: 'var(--status-warning)' }; }

    res.json({
      healthScore,
      grade,
      gradeLabel,
      summary,
      issues,
      readiness,
      network: {
        isp: geoInfo.isp || 'Unknown ISP',
        org: geoInfo.org || 'Local Campus Network',
        city: geoInfo.city || 'Unknown',
        country: geoInfo.country || 'India',
        ip: geoInfo.query || '0.0.0.0'
      },
      diagnostics: {
        dns: { ...dnsResult.data, labels: dnsResult.labels, fastest: dnsResult.fastest, recommendation: dnsResult.recommendation },
        http: { data: httpResult.data, meta: httpResult.meta, avg_latency: httpResult.avg_latency },
        packetLoss: packetResult.data,
        traceroute: traceResult.data,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NetPulse Backend listening on port ${PORT}`);
});