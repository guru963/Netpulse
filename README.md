# NetPulse: Advanced Network Intelligence for Educational Campuses

NetPulse is a sophisticated, full-stack network diagnostic platform engineered to provide real-time visibility into complex network environments. While optimized for Indian college campuses and high-density hostel networks, its architecture is robust enough for any distributed enterprise environment.

**Live Backend Instance:** [https://netpulse-rht0.onrender.com/](https://netpulse-rht0.onrender.com/)

---

## Executive Overview

NetPulse addresses the critical visibility gap in managed network infrastructures. By combining low-level ICMP diagnostics with application-layer performance probing, the platform translates raw network telemetry into actionable intelligence. It enables end-users to quantify their network experience and provides administrators with standardized diagnostic reports for rapid troubleshooting.

---

## Core Capabilities

### Performance Benchmarking
- **DNS Resolver Analytics**: Comparative analysis of ISP-provided name resolution versus global public resolvers (Cloudflare, Google, Quad9) to identify resolution bottlenecks.
- **Multi-Layer Latency Probing**: Simultaneous HTTP/HTTPS RTT measurement across a diverse array of global CDNs and local infrastructure endpoints.
- **ICMP Packet Analysis**: High-precision packet loss detection with statistical quality grading (Excellent to Critical).

### Intelligent Diagnostics
- **Experience Readiness Scoring**: Algorithmic evaluation of network suitability for specific high-bandwidth and low-latency workloads, including Competitive Gaming, 4K Media Streaming, and Real-time Teleconferencing.
- **Network Path Visualization**: A visual representation of the data transit path, identifying specific congestion points across local switches, campus firewalls, and ISP backbones.
- **Edge Performance Delta**: Integration with Cloudflare Workers to measure the performance benefit of edge computing versus direct origin transit.

### Administrative Support Tools
- **Automated Incident Reporting**: Generation of standardized diagnostic reports in both plaintext and PDF formats, facilitating formal communication with IT departments.
- **Infrastructure Fingerprinting**: Automated detection of ISP, Organization (ASN), and geographic data-center routing.

---

## Technical Architecture

### Frontend
Built with React and Vite, the interface utilizes a high-performance rendering engine for data visualization. 
- **Data Viz**: Custom implementations using Recharts for latency distribution.
- **Iconography**: Minimalist vector assets via Lucide React.
- **Reporting**: Client-side PDF generation using the jsPDF library.

### Backend
A Node.js/Express microservice designed for concurrent diagnostic execution.
- **Diagnostic Engine**: Modular prober architecture utilizing native system calls for ICMP and asynchronous HTTP/DNS resolution.
- **Scoring Logic**: A weighted heuristic engine that evaluates network health based on multi-dimensional telemetry.

### Edge
Cloudflare Workers integration providing global latency benchmarks and geographic routing intelligence.

---

## Implementation Guide

### Installation

Clone the repository and install dependencies for both segments:

```bash
# Backend Setup
cd backend
npm install
npm start

# Frontend Setup
cd ../frontend
npm install
npm run dev
```

### Configuration
Environment variables should be configured in the `frontend/.env` file to point to your respective backend and worker instances.

---

## License
Distributed under the MIT License.

---

**NetPulse** | Providing transparency to managed network environments.
