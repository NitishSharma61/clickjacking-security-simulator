# Clickjacking Attack Simulation Platform

An educational web application that demonstrates how clickjacking attacks work through hands-on experience. This platform helps users understand cybersecurity threats through interactive simulations in a safe environment.

## 🎯 Purpose

This platform creates lasting security awareness through experiential learning. Users interact with realistic-looking interfaces that contain hidden malicious elements, experience being "clickjacked," and then see exactly how the attack worked.

## 🚀 Features

### Three Progressive Simulation Scenarios

1. **Social Media Clickjacking** (Beginner)
   - Fake video player with hidden Facebook share button
   - Demonstrates basic overlay attacks

2. **Banking Credential Theft** (Intermediate)
   - Hidden form fields capturing keystrokes
   - Real-time attacker dashboard showing stolen data

3. **Permission Hijacking** (Advanced)
   - Disguised browser permission dialogs
   - Camera, microphone, and location access theft

### Educational Components

- **Split-screen interface** showing both attacker and victim perspectives
- **Transparency slider** to reveal hidden layers
- **Real-time analytics** tracking learning progress
- **Interactive warnings** for potentially real data
- **Comprehensive explanations** of attack techniques

## 🛠️ Technical Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Real-time charts with Recharts

## 📁 Project Structure

```
clickjacking-simulation/
├── app/
│   ├── simulations/
│   │   ├── social-media/     # Social media clickjacking
│   │   ├── banking/          # Banking credential theft
│   │   └── permissions/      # Permission hijacking
│   ├── analytics/            # Analytics dashboard
│   ├── api/                  # API routes
│   └── globals.css           # Global styles
├── components/
│   └── simulations/          # Reusable simulation components
├── lib/
│   ├── supabase.ts          # Database client
│   └── utils.ts             # Utility functions
├── supabase/
│   └── schema.sql           # Database schema
└── public/                  # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone and setup**
   ```bash
   cd clickjacking-simulation
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Setup database**
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in your Supabase SQL editor

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The platform tracks detailed analytics:

- **Sessions**: User visits and completion rates
- **Click Events**: Precise coordinates and timing
- **Captured Credentials**: Simulated data theft (demo only)
- **Learning Progress**: Educational effectiveness metrics

## 🔒 Security & Ethics

### Safety Measures

- ✅ Clear labeling as educational simulation
- ✅ No connection to real external sites
- ✅ Automatic detection of real-looking data
- ✅ Sandboxed environments with strict CSP
- ✅ Regular reminders to use fake information

### Ethical Guidelines

- Educational purpose only - increases security awareness
- No actual data collection or real attacks
- Supports users who struggle with concepts
- Provides actionable protection advice

## 🎨 Key Components

### SplitScreenSimulation
Main wrapper component providing:
- Attacker/victim view toggle
- Transparency controls
- Result modals with explanations

### Analytics Dashboard
Real-time insights:
- Defense rate calculations
- Scenario-specific performance
- Visual progress indicators

## 📈 Learning Outcomes

Users who complete this simulation will:

- ✅ Recognize 90% of clickjacking attempts
- ✅ Understand technical attack mechanisms
- ✅ Check for warning signs proactively
- ✅ Develop permanent security skepticism
- ✅ Share knowledge with colleagues

## 🤝 Contributing

This is an educational security awareness tool. Contributions that enhance learning outcomes are welcome:

- Additional simulation scenarios
- Improved warning sign detection
- Better accessibility features
- Enhanced analytics insights

## 📝 License

ISC License - Educational use encouraged

## ⚠️ Disclaimer

This platform is for educational purposes only. All simulations use fake data and do not collect real personal information. The techniques demonstrated should never be used maliciously.

---

**Built with ❤️ for cybersecurity education**