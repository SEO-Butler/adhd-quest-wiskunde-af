# 🚀 Deployment Guide: GitHub + Vercel

This guide will walk you through deploying your ADHD Quest web app to GitHub and Vercel for free hosting.

## 📋 Prerequisites

Before you begin, ensure you have:
- [x] Node.js 18+ installed
- [x] Git installed
- [x] A GitHub account
- [x] A Vercel account (sign up at https://vercel.com)

## 🎯 Step 1: Set Up GitHub Repository

### 1.1 Initialize Git Repository

Open your terminal in the project directory and run:

```bash
cd "C:\Claude\ADHD_Quest_Wiskunde_AF_Lazybird_LANG"
git init
git add .
git commit -m "Initial commit: ADHD Quest Wiskunde AF with Parent Portal"
```

### 1.2 Create GitHub Repository

1. **Go to GitHub**: Visit https://github.com and sign in
2. **Create New Repository**:
   - Click the "+" icon in the top right
   - Select "New repository"
   - Repository name: `adhd-quest-wiskunde-af`
   - Description: `Gamified math education app for ADHD learners in Afrikaans with TTS support`
   - Make it **Public** (for free Vercel hosting)
   - ✅ Add a README file (we already have one)
   - ✅ Add .gitignore (we already have one)
   - License: MIT License (optional)

### 1.3 Connect Local Repository to GitHub

Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/adhd-quest-wiskunde-af.git
git branch -M main
git push -u origin main
```

**✅ Checkpoint**: Your code should now be visible on GitHub at `https://github.com/YOUR_USERNAME/adhd-quest-wiskunde-af`

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel

1. **Go to Vercel**: Visit https://vercel.com and sign in
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Choose "Import Git Repository"
   - Select your GitHub account if prompted
   - Find and select `adhd-quest-wiskunde-af`
   - Click "Import"

### 2.2 Configure Deployment Settings

Vercel should automatically detect this is a Vite project. Verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables (Optional)

If you're using the Lazybird TTS API:

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Environment Variables"
3. Add: `VITE_LAZYBIRD_API_KEY` = `your_api_key_here`

### 2.4 Deploy

Click "Deploy" and wait for the build to complete (2-5 minutes).

**✅ Checkpoint**: Your app should be live at `https://your-project-name.vercel.app`

## 🔧 Step 3: Configure Custom Domain (Optional)

### 3.1 Add Custom Domain in Vercel

1. Go to Project Settings → "Domains"
2. Add your custom domain (e.g., `adhd-quest.yourdomain.com`)
3. Follow DNS configuration instructions

### 3.2 Update Package.json

Update the homepage URL in `package.json`:

```json
{
  "homepage": "https://your-custom-domain.com"
}
```

## 🔄 Step 4: Set Up Continuous Deployment

Good news! This is already configured. Every time you push to the `main` branch, Vercel will automatically rebuild and deploy your app.

### Workflow:
1. Make changes locally
2. Test with `npm run dev`
3. Build and test with `npm run build`
4. Commit changes: `git add . && git commit -m "Your message"`
5. Push to GitHub: `git push`
6. Vercel automatically deploys the changes

## 📊 Step 5: Monitor Your Deployment

### 5.1 Vercel Analytics (Free)

1. Go to your Vercel project dashboard
2. Navigate to "Analytics"
3. Monitor traffic, performance, and user engagement

### 5.2 Performance Optimization

Your app is already optimized, but monitor these metrics:
- **Core Web Vitals**: Should be green
- **Bundle Size**: Current: ~890KB (good for a React app)
- **Loading Speed**: Should be under 3 seconds

## 🛠️ Troubleshooting Common Issues

### Build Failures

**Problem**: Build fails with linting errors
```bash
# Fix locally:
npm run lint
# Fix any issues, then redeploy
```

**Problem**: Environment variables not working
- Ensure they're prefixed with `VITE_`
- Check they're added in Vercel dashboard
- Redeploy after adding env vars

### Runtime Issues

**Problem**: TTS not working in production
- Check browser compatibility
- Verify API keys are set correctly
- Check network requests in browser dev tools

**Problem**: IndexedDB not working
- This is browser-specific; ensure you're testing in supported browsers
- Check browser storage permissions

### Performance Issues

**Problem**: Large bundle size warnings
```bash
# Analyze bundle:
npm run build
# The warnings are informational; 890KB is acceptable for this feature set
```

## 🔐 Security Considerations

### Production Checklist

- [x] **API Keys**: Stored as environment variables in Vercel
- [x] **HTTPS**: Automatically provided by Vercel
- [x] **Security Headers**: Configured in `vercel.json`
- [x] **Content Security**: No inline scripts or dangerous content
- [x] **Dependencies**: All packages are from trusted sources

### Regular Maintenance

1. **Update Dependencies**: Monthly
   ```bash
   npm audit
   npm update
   ```

2. **Monitor Vercel Logs**: Check for any runtime errors

3. **GitHub Security Alerts**: Keep an eye on dependency vulnerabilities

## 📈 Going Further

### Add Custom Features

1. **Backend Integration**: Add a Node.js API for user accounts
2. **Database**: Connect to PostgreSQL or MongoDB for persistent data
3. **Analytics**: Add Google Analytics or Mixpanel
4. **PWA**: Convert to Progressive Web App for offline functionality

### Scale Your Deployment

1. **Multiple Environments**: 
   - `main` branch → Production
   - `develop` branch → Staging
   - `feature/*` branches → Preview deployments

2. **Team Collaboration**: Invite collaborators to your GitHub repo

## ✅ Final Checklist

Before going live:

- [ ] Test all features work in production
- [ ] Verify TTS functionality
- [ ] Test Parent Portal features
- [ ] Check responsive design on mobile
- [ ] Verify PDF upload and processing
- [ ] Test question editing functionality
- [ ] Ensure audio caching works properly
- [ ] Check IndexedDB functionality

## 🎉 You're Live!

Congratulations! Your ADHD Quest app is now deployed and accessible worldwide. Share your creation:

- **Production URL**: `https://your-app.vercel.app`
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/adhd-quest-wiskunde-af`

### Next Steps

1. Share with educators and parents for feedback
2. Monitor usage patterns in Vercel analytics
3. Iterate based on user feedback
4. Consider monetization if you want to expand features

---

**Need Help?** 
- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com
- React/Vite Docs: https://vitejs.dev

**Emergency Rollback**: If something goes wrong, you can instantly rollback to a previous deployment in the Vercel dashboard.
