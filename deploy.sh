#!/bin/bash

# WebConnect Deployment Script
# This script helps deploy the WebConnect chat application

echo "🚀 WebConnect Deployment Helper"
echo "================================"

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "❌ No .env file found in server directory!"
    echo "📝 Creating template .env file..."
    
    cat > server/.env << EOF
# Database Configuration
MONGODB_URI=mongodb+srv://jainnirdesh1:VQwPWoCeUwoDbUW3@cluster0.bmivfjr.mongodb.net/?retryWrites=true&w=majority

# Session Configuration
SESSION_SECRET=change-this-to-a-secure-random-string-in-production

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Server Configuration
PORT=3000
NODE_ENV=development

# Base URL for OAuth callbacks
BASE_URL=http://localhost:3000
EOF
    
    echo "✅ Template .env file created. Please update with your actual values."
    echo "📋 Required steps:"
    echo "   1. Set up GitHub OAuth app at https://github.com/settings/developers"
    echo "   2. Update GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET"
    echo "   3. Update BASE_URL for production deployment"
    echo "   4. Generate a secure SESSION_SECRET"
    exit 1
fi

# Check if required environment variables are set
echo "🔍 Checking environment configuration..."

source server/.env

missing_vars=()

if [ -z "$MONGODB_URI" ]; then
    missing_vars+=("MONGODB_URI")
fi

if [ -z "$GITHUB_CLIENT_ID" ] || [ "$GITHUB_CLIENT_ID" = "your-github-client-id" ]; then
    missing_vars+=("GITHUB_CLIENT_ID")
fi

if [ -z "$GITHUB_CLIENT_SECRET" ] || [ "$GITHUB_CLIENT_SECRET" = "your-github-client-secret" ]; then
    missing_vars+=("GITHUB_CLIENT_SECRET")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing or incomplete environment variables:"
    printf '   - %s\n' "${missing_vars[@]}"
    echo "📝 Please update server/.env file with proper values"
    exit 1
fi

echo "✅ Environment configuration looks good!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Option to start the server
echo ""
echo "🎯 Ready to deploy! Choose an option:"
echo "1. Start local development server"
echo "2. Start production server"
echo "3. Show deployment instructions"
echo "4. Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔧 Starting development server..."
        npm run dev
        ;;
    2)
        echo "🚀 Starting production server..."
        NODE_ENV=production npm start
        ;;
    3)
        echo "📚 Deployment Instructions:"
        echo ""
        echo "🌐 For Render.com:"
        echo "   1. Push code to GitHub"
        echo "   2. Connect GitHub repo to Render"
        echo "   3. Add environment variables in Render dashboard"
        echo "   4. Deploy!"
        echo ""
        echo "🚂 For Railway:"
        echo "   1. npm i -g @railway/cli"
        echo "   2. railway login"
        echo "   3. railway up"
        echo ""
        echo "🟣 For Heroku:"
        echo "   1. heroku create your-app-name"
        echo "   2. heroku config:set GITHUB_CLIENT_ID=your_value"
        echo "   3. git push heroku main"
        echo ""
        echo "📱 Don't forget to update your GitHub OAuth app callback URL!"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
