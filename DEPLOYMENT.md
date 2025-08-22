# 🚀 Deploy to Netlify - Step by Step Guide

## Prerequisites
- ✅ Your Supabase project is set up and working
- ✅ Your `.env` file has the correct Supabase credentials
- ✅ Your app runs locally without errors

## Step 1: Prepare Your Environment Variables

### 1.1 Get Your Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key

### 1.2 Update Supabase Site URL
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your Netlify URL (you'll get this after deployment):
   - `https://your-app-name.netlify.app`
   - `https://your-custom-domain.com` (if you have one)

## Step 2: Deploy to Netlify

### Method 1: Deploy via Netlify UI (Recommended)

#### 2.1 Connect Your Repository
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub/GitLab/Bitbucket account
4. Select your repository: `focusflow-organize-main`

#### 2.2 Configure Build Settings
Netlify will auto-detect these settings, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (or higher)

#### 2.3 Set Environment Variables
1. In the deploy settings, go to **Environment variables**
2. Add these variables:
   ```
   VITE_SUPABASE_URL = your-supabase-project-url
   VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```

#### 2.4 Deploy
1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be live at: `https://random-name.netlify.app`

### Method 2: Deploy via Netlify CLI

#### 2.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2.2 Login to Netlify
```bash
netlify login
```

#### 2.3 Deploy
```bash
# Build your project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## Step 3: Configure Your Domain (Optional)

### 3.1 Custom Domain
1. In Netlify Dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS configuration instructions

### 3.2 Update Supabase Site URL
1. Go back to Supabase Dashboard
2. Update the Site URL with your custom domain
3. Save the changes

## Step 4: Test Your Deployment

### 4.1 Verify Features
1. **Authentication**: Sign up/sign in should work
2. **Todo Creation**: Create new todos
3. **Sub-todos**: Add sub-todos with due dates
4. **Auto-complete**: Check that completed todos move to completed section
5. **Real-time**: Changes should sync across browser tabs

### 4.2 Common Issues & Fixes

#### Issue: "Database connection issue"
**Solution**: Check your environment variables in Netlify

#### Issue: "Authentication error"
**Solution**: Update Supabase Site URL with your Netlify domain

#### Issue: "Build fails"
**Solution**: 
1. Check build logs in Netlify
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

## Step 5: Continuous Deployment

### 5.1 Automatic Deploys
- Every push to `main` branch will trigger a new deployment
- Pull requests will create preview deployments

### 5.2 Environment-Specific Variables
You can set different environment variables for:
- **Production**: Main branch deployments
- **Preview**: Pull request deployments
- **Branch**: Specific branch deployments

## 🎉 Your App is Live!

Your FocusFlow Todo app is now deployed and accessible worldwide!

**Features Working:**
- ✅ User authentication with Supabase
- ✅ Create, edit, delete todos
- ✅ Add sub-todos with due dates
- ✅ Auto-complete when all sub-todos are done
- ✅ Completed todos section
- ✅ Priority filtering
- ✅ Search functionality
- ✅ Real-time synchronization

**Next Steps:**
1. Share your app with friends and family
2. Monitor usage in Netlify Analytics
3. Set up custom domain (optional)
4. Configure backups for your Supabase database

## 🔧 Maintenance

### Update Your App
1. Make changes locally
2. Test thoroughly
3. Push to your repository
4. Netlify will automatically deploy the updates

### Monitor Performance
- Use Netlify Analytics to track usage
- Monitor Supabase dashboard for database performance
- Set up alerts for any issues

---

**Need Help?**
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Documentation](https://supabase.com/docs)
- Check build logs in Netlify Dashboard for specific errors
















