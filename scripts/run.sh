#!/bin/bash
# /root/tabletop/Frontend_TableTopLeo_Dev/script/run.sh

APP_NAME="table_top_frontend"

echo "--------------------------------------------------"
echo "🚀 Running Frontend Deploy Script"
echo "--------------------------------------------------"

pwd
cd ..

echo "📂 Working directory: $(pwd)"

# Pull latest code
echo "⬇️  Pulling latest changes from main..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "❌ git pull failed"
  exit 1
fi

echo "✅ Git pull successful"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi

# Build the app
echo "🔨 Building production build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ npm run build failed"
  exit 1
fi

echo "✅ Build successful"

# Check if PM2 app exists
sudo pm2 describe $APP_NAME > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "🔄 PM2 app exists. Restarting..."
  sudo pm2 restart $APP_NAME
else
  echo "🆕 PM2 app not found. Starting..."
  sudo pm2 start npm --name "$APP_NAME" -- run start
fi


echo "--------------------------------------------------"
echo "✅ Frontend Deploy Script Finished Successfully"
echo "--------------------------------------------------"