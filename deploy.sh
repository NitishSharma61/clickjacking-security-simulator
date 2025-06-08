#!/bin/bash

echo "🚀 Starting deployment process..."

# Deploy main application
echo "📦 Deploying main application..."
cd "/home/nitish/clickjacking simulation/clickjacking-clean"
vercel --prod --yes --name clickjacking-security-simulator

echo "📦 Deploying attacker dashboard..."
cd "/home/nitish/clickjacking simulation/clickjacking-clean/attacker-dashboard"
vercel --prod --yes --name clickjacking-attacker-dashboard

echo "✅ Deployment complete!"
echo "🌐 Main app: https://clickjacking-security-simulator.vercel.app"
echo "🔴 Attacker dashboard: https://clickjacking-attacker-dashboard.vercel.app"