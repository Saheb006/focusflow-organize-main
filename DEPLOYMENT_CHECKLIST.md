# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] **Supabase Project**: Database is set up and working
- [ ] **SQL Schema**: Run the updated SQL in Supabase SQL Editor
- [ ] **Environment Variables**: Your `.env` file has correct credentials
- [ ] **Local Testing**: App runs without errors at `http://localhost:8082`
- [ ] **Build Test**: `npm run build` completes successfully

## 🔧 Deployment Steps

### 1. Get Supabase Credentials
- [ ] Go to Supabase Dashboard → Settings → API
- [ ] Copy **Project URL** and **anon public key**

### 2. Deploy to Netlify
- [ ] Go to [netlify.com](https://netlify.com)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect your GitHub account
- [ ] Select your repository: `focusflow-organize-main`

### 3. Configure Build Settings
- [ ] **Build command**: `npm run build`
- [ ] **Publish directory**: `dist`
- [ ] **Node version**: `18`

### 4. Set Environment Variables
Add these in Netlify Dashboard → Site settings → Environment variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

### 5. Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Note your Netlify URL: `https://random-name.netlify.app`

### 6. Update Supabase Site URL
- [ ] Go to Supabase Dashboard → Authentication → Settings
- [ ] Add your Netlify URL to **Site URL** field
- [ ] Save changes

## 🧪 Post-Deployment Testing

- [ ] **Authentication**: Sign up/sign in works
- [ ] **Create Todo**: Add new todos successfully
- [ ] **Sub-todos**: Add sub-todos with due dates
- [ ] **Auto-complete**: Completed todos move to completed section
- [ ] **Real-time**: Changes sync across browser tabs
- [ ] **Mobile**: Test on mobile devices

## 🎉 Success!

Your FocusFlow Todo app is now live and accessible worldwide!

**Your App URL**: `https://your-app-name.netlify.app`

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Netlify
- Verify all dependencies are installed
- Ensure Node.js version is 18+

### Database Connection Error
- Verify environment variables in Netlify
- Check Supabase project is active
- Ensure SQL schema is properly set up

### Authentication Error
- Update Supabase Site URL with your Netlify domain
- Check redirect URLs in Supabase settings

---

**Need Help?** Check the full `DEPLOYMENT.md` guide for detailed instructions.




