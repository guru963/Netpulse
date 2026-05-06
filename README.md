# ⚡ NetPulse

**Real-time network intelligence and diagnostic dashboard tailored for Indian college campuses.**

NetPulse is a full-stack diagnostic tool designed to help students identify, analyze, and report network issues in high-density environments like college hostels and campuses. It benchmarks DNS speed, measures HTTP latency across global CDNs, detects packet loss, and generates professional IT support reports.

**Live Backend:** [https://netpulse-rht0.onrender.com/](https://netpulse-rht0.onrender.com/)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61dafb.svg)
![Node](https://img.shields.io/badge/backend-Node.js-339933.svg)
![Cloudflare](https://img.shields.io/badge/edge-Cloudflare_Workers-f38020.svg)

---

## ✨ Features

- **🛡️ Network Vitality Score**: A real-time health grade (A-F) based on packet loss, latency, and DNS performance.
- **🚀 Experience Readiness**: Instant grades for real-world activities:
  - **Gaming**: Competitive readiness for Valorant, CS, and Mobile Legends.
  - **Streaming**: 4K readiness for YouTube, Netflix, and Twitch.
  - **Meetings**: Stability check for Zoom, Google Meet, and Discord.
- **🗺️ Trace Path Analysis**: Visualize the journey of your data from your room through the campus switch to the ISP backbone and Cloudflare edge.
- **📊 Latency Distribution**: Compare response times for global services (Google, GitHub) vs local Indian CDNs.
- **📝 Automated IT Reporting**: 
  - One-click **Copy to Clipboard** for quick support chats.
  - Professional **PDF Report Generation** with auto-detected ISP/College info to send to campus admins.
- **🌐 Cloudflare Edge Benchmarking**: Compare your direct connection speed against Cloudflare's regional edge POPs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Recharts (Data Viz), Lucide React (Icons), jsPDF.
- **Backend**: Node.js, Express, Axios, Ping (ICMP diagnostics).
- **Edge**: Cloudflare Workers (Latency benchmarking & GeoIP detection).
- **Styling**: Premium CSS with Glassmorphism and Animated Backgrounds.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/guru963/Netpulse.git
cd Netpulse
```

### 2. Setup Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:3000`*

### 3. Setup Frontend
```bash
cd ../frontend
npm install
# Update .env with your backend/worker URLs
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📁 Project Structure

```text
├── backend/            # Express server & network probers
│   ├── probers/        # DNS, HTTP, Packet Loss logic
│   └── index.js        # API endpoints & scoring engine
├── frontend/           # React dashboard
│   ├── src/
│   │   ├── components/ # Modular UI components
│   │   ├── App.jsx     # Main dashboard logic
│   │   └── index.css   # Premium design system
├── worker/             # Cloudflare Worker script
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.

---

## 🤝 Contributing
Feel free to fork this project and submit PRs! Whether it's adding new probers or improving the UI, all contributions are welcome.

**Made for students, by students.** 🎓⚡
