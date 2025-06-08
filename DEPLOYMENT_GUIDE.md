# 🚀 Complete Vercel Deployment Guide

## Step 1: Login to Vercel
```bash
vercel login
```
Choose "Continue with Email" and use: **sharmanitish6116@gmail.com**

## Step 2: Deploy Main Application
```bash
cd "/home/nitish/clickjacking simulation/clickjacking-clean"
vercel --prod --yes --name clickjacking-security-simulator
```

**Expected URL:** `https://clickjacking-security-simulator.vercel.app`

## Step 3: Deploy Attacker Dashboard
```bash
cd "/home/nitish/clickjacking simulation/clickjacking-clean/attacker-dashboard"
vercel --prod --yes --name clickjacking-attacker-dashboard
```

**Expected URL:** `https://clickjacking-attacker-dashboard.vercel.app`

## Step 4: Verify URLs Match Environment Variables

### Main App (.env.local):
```
NEXT_PUBLIC_ATTACKER_DASHBOARD_URL=https://clickjacking-attacker-dashboard.vercel.app
```

### Attacker Dashboard (.env.local):
```
NEXT_PUBLIC_MAIN_APP_URL=https://clickjacking-security-simulator.vercel.app
```

## Step 5: Add Environment Variables in Vercel Dashboard

### For Main App (clickjacking-security-simulator):
1. Go to https://vercel.com/nitishsharma61/clickjacking-security-simulator/settings/environment-variables
2. Add:
   - **Name:** `NEXT_PUBLIC_ATTACKER_DASHBOARD_URL`
   - **Value:** `https://clickjacking-attacker-dashboard.vercel.app`
   - **Environment:** Production

### For Attacker Dashboard (clickjacking-attacker-dashboard):
1. Go to https://vercel.com/nitishsharma61/clickjacking-attacker-dashboard/settings/environment-variables
2. Add:
   - **Name:** `NEXT_PUBLIC_MAIN_APP_URL`
   - **Value:** `https://clickjacking-security-simulator.vercel.app`
   - **Environment:** Production

## Step 6: Redeploy Both Apps
```bash
# Main app
cd "/home/nitish/clickjacking simulation/clickjacking-clean"
vercel --prod --force

# Attacker dashboard
cd "/home/nitish/clickjacking simulation/clickjacking-clean/attacker-dashboard"
vercel --prod --force
```

## Step 7: Test Deployment

1. Visit: https://clickjacking-security-simulator.vercel.app
2. Try the banking simulation
3. Check if data appears in: https://clickjacking-attacker-dashboard.vercel.app

## 🔧 If URLs are Different

If Vercel assigns different URLs, update the environment variables:

### Main App URL Different?
Update attacker dashboard env var:
```bash
cd "/home/nitish/clickjacking simulation/clickjacking-clean/attacker-dashboard"
echo "NEXT_PUBLIC_MAIN_APP_URL=YOUR_ACTUAL_MAIN_APP_URL" > .env.local
vercel --prod --force
```

### Attacker Dashboard URL Different?
Update main app env var:
```bash
cd "/home/nitish/clickjacking simulation/clickjacking-clean"
echo "NEXT_PUBLIC_ATTACKER_DASHBOARD_URL=YOUR_ACTUAL_DASHBOARD_URL" > .env.local
vercel --prod --force
```

## ✅ Success Indicators

1. **Main app loads** without errors
2. **Banking simulation** opens PayPal in new tab
3. **Attacker dashboard** shows captured data in real-time
4. **No CORS errors** in browser console

## 🚨 Troubleshooting

### CORS Errors?
Check that environment variables match actual deployed URLs.

### No Data in Dashboard?
1. Check browser Network tab for failed API calls
2. Verify both apps can communicate
3. Ensure Supabase credentials are correct

### Build Errors?
```bash
# Test local build first
npm run build
```

## 📞 Support
If you encounter issues, the deployment logs in Vercel dashboard will show specific errors.