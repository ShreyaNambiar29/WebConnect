# WebConnect Deployment Guide

## Quick Setup for OAuth

### 1. GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: `WebConnect Chat App`
   - Homepage URL: `https://your-domain.com` (or `http://localhost:3000` for local)
   - Authorization callback URL: `https://your-domain.com/auth/github/callback`
4. Copy the Client ID and Client Secret
5. Update your `.env` file in the server directory:

```env
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret
BASE_URL=https://your-domain.com
```

### 2. Environment Variables Setup

Update your `server/.env` file with:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://jainnirdesh1:VQwPWoCeUwoDbUW3@cluster0.bmivfjr.mongodb.net/?retryWrites=true&w=majority

# Session Configuration  
SESSION_SECRET=generate-a-random-32-character-string-here

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_actual_github_client_id
GITHUB_CLIENT_SECRET=your_actual_github_client_secret

# Server Configuration
PORT=3000
NODE_ENV=production

# Base URL for OAuth callbacks
BASE_URL=https://your-domain.com
```

### 3. Quick Deploy Options

#### Option A: Render (Recommended)
1. Push your code to GitHub
2. Connect to Render.com
3. Create a new Web Service
4. Add environment variables in Render dashboard
5. Deploy!

#### Option B: Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`
4. Add environment variables in Railway dashboard

#### Option C: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add environment variables: `heroku config:set KEY=value`
5. Deploy: `git push heroku main`

### 4. Local Testing

```bash
# Install dependencies
npm install

# Start the server
npm start

# Visit http://localhost:3000
```

### 5. Production Checklist
- [ ] Update SESSION_SECRET to a secure random string
- [ ] Set NODE_ENV=production
- [ ] Configure OAuth app with production URL
- [ ] Test all authentication flows
- [ ] Monitor logs for any errors

### 6. Common Issues
- **OAuth2Strategy requires a clientID**: Check GITHUB_CLIENT_ID in .env
- **Callback URL mismatch**: Ensure OAuth app callback matches BASE_URL + /auth/github/callback
- **Environment variables not loading**: Check .env file path and permissions
