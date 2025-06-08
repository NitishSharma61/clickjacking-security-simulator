# Clickjacking Attack Simulation Platform

An educational web application that demonstrates how clickjacking attacks work through hands-on experience. This platform helps users understand cybersecurity threats through interactive simulations in a safe environment.

## 🎥 Video Demonstration

Watch the [clickjacking.mp4](./clickjacking.mp4) video in this repository for a complete walkthrough of:
- How clickjacking attacks work technically
- Live demonstration of both attack scenarios
- Real-time attacker dashboard capturing credentials
- Educational insights and protection strategies

## 🌐 Live Demo

- **Main Platform:** [https://clickjacking-security-simulator.vercel.app](https://clickjacking-security-simulator.vercel.app)
- **Attacker Dashboard:** [https://attackerdashboard.vercel.app](https://attackerdashboard.vercel.app)

## 🎯 Purpose

This platform creates lasting security awareness through experiential learning. Users interact with realistic-looking interfaces that contain hidden malicious elements, experience being "clickjacked," and then see exactly how the attack worked through a real-time attacker dashboard.

## 🚀 Features

### **Two Advanced Simulation Scenarios**

1. **Social Media Clickjacking** (Beginner)
   - Fake video player with hidden Facebook share button
   - Demonstrates basic overlay attacks
   - Opens Facebook login in new tab for realistic experience
   - Real-time credential capture and display

2. **Banking Credential Theft** (Advanced)
   - Hidden form fields capturing keystrokes  
   - PayPal phishing simulation with multi-step authentication
   - Complete credit card detail capture (number, holder, expiry, CVV)
   - Real-time attacker dashboard showing stolen data

### **Multi-Site Architecture**
- Main simulation platform on one domain
- Dedicated attacker dashboard on separate domain  
- Cross-domain communication for realistic attack demonstration
- Real-time data exfiltration visualization

### **Educational Components**
- Split-screen interface showing both attacker and victim perspectives
- Interactive opacity slider to reveal hidden malicious layers
- Real-time analytics tracking learning progress
- Interactive warnings for potentially real data
- Comprehensive explanations of attack techniques
- Direct link to live attacker dashboard
- Video demonstration explaining the code and attack mechanisms

## 🛠️ Technical Stack

- **Frontend:** Next.js 15+ with TypeScript
- **Styling:** Tailwind CSS with custom animations
- **Animations:** Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel (Multi-site)
- **Real-time:** Cross-domain postMessage API

## 📁 Project Structure

```
clickjacking-simulation/
├── app/
│   ├── simulations/
│   │   ├── social-media/     # Social media clickjacking
│   │   └── banking/          # Banking credential theft
│   ├── banking/              # Fake PayPal site
│   ├── fake-facebook/        # Fake Facebook site
│   ├── social-media/         # Social media landing
│   ├── analytics/            # Analytics dashboard
│   └── api/                  # API routes
├── attacker-dashboard/       # Separate attacker app
│   ├── app/
│   │   └── api/              # Capture APIs
│   └── components/           # Dashboard components
├── components/
│   └── simulations/          # Reusable simulation components
├── lib/
│   ├── supabase.ts          # Database client
│   ├── config.ts            # Environment config
│   └── utils.ts             # Utility functions
└── supabase/
    └── schema.sql           # Database schema
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Vercel account (for deployment)

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/NitishSharma61/clickjacking-security-simulator.git
cd clickjacking-security-simulator
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ATTACKER_DASHBOARD_URL=http://localhost:3001
```

3. **Setup attacker dashboard**
```bash
cd attacker-dashboard
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_MAIN_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup database**
- Create a new Supabase project
- Run the SQL from `supabase/schema.sql` in your Supabase SQL editor

5. **Start development servers**
```bash
# Terminal 1: Main app
npm run dev

# Terminal 2: Attacker dashboard
cd attacker-dashboard
npm run dev
```

6. **Visit the application**
- Main app: http://localhost:3000
- Attacker dashboard: http://localhost:3001

## 📊 Database Schema

The platform tracks detailed analytics:

- **attacker_dashboard_view:** Real-time captured credentials
- **simulation_sessions:** User visits and completion rates
- **click_events:** Precise coordinates and timing
- **captured_credentials:** Detailed keystroke data
- **learning_progress:** Educational effectiveness metrics

## 🔒 Security & Ethics

### Safety Measures
✅ Clear labeling as educational simulation  
✅ No connection to real external sites  
✅ Automatic detection of real-looking data  
✅ Sandboxed environments with strict CSP  
✅ Regular reminders to use fake information  

### Ethical Guidelines
- Educational purpose only - increases security awareness
- No actual data collection or real attacks
- Supports users who struggle with security concepts
- Provides actionable protection advice

## 🎨 Key Components

### SplitScreenSimulation
Main wrapper component providing:
- Attacker/victim view toggle
- Transparency controls
- Result modals with explanations
- Direct link to attacker dashboard

### Attacker Dashboard
Real-time insights:
- Live credential capture display
- Session tracking
- Data type classification (Facebook, PayPal, Banking)
- Export functionality

## 📈 Learning Outcomes

Users who complete this simulation will:

✅ Recognize 90% of clickjacking attempts  
✅ Understand technical attack mechanisms  
✅ Check for warning signs proactively  
✅ Develop permanent security skepticism  
✅ Share knowledge with colleagues  

### Video Walkthrough Features

The included `clickjacking.mp4` demonstrates:
- **Technical Implementation**: How invisible iframes overlay legitimate content
- **Attack Execution**: Step-by-step process of both social media and banking attacks
- **Defense Mechanisms**: How to identify and prevent clickjacking
- **Code Explanation**: Technical breakdown of the attack implementation
- **Real-time Monitoring**: Live attacker dashboard showing captured data  

## 🚀 Deployment

### Multi-Site Vercel Deployment

1. **Deploy Main App**
```bash
vercel --prod
```

2. **Deploy Attacker Dashboard**
```bash
cd attacker-dashboard
vercel --prod --name attackerdashboard
```

3. **Update Environment Variables**
- Set production URLs in both Vercel projects
- Ensure cross-domain communication works

## 🤝 Contributing

This is an educational security awareness tool. Contributions that enhance learning outcomes are welcome:

- Additional simulation scenarios
- Improved warning sign detection
- Better accessibility features
- Enhanced analytics insights

## 📄 License

ISC License - Educational use encouraged

## ⚠️ Disclaimer

This platform is for educational purposes only. All simulations use fake data and do not collect real personal information. The techniques demonstrated should never be used maliciously.

**Built with ❤️ for cybersecurity education**