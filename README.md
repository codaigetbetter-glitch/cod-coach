# CODCoach — Deploy Guide

## What you need
- A free GitHub account (github.com)
- A free Vercel account (vercel.com)
- Your Anthropic API key (console.anthropic.com)

---

## Step 1 — Put the code on GitHub

1. Go to github.com and sign in
2. Click the green **"New"** button to create a new repository
3. Name it `cod-coach`, leave everything else default, click **Create repository**
4. Click **"uploading an existing file"**
5. Upload all these files keeping the folder structure:
   - `package.json`
   - `pages/index.js`
   - `pages/api/chat.js`
6. Click **Commit changes**

---

## Step 2 — Deploy on Vercel

1. Go to vercel.com and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find your `cod-coach` repository and click **Import**
4. Leave all settings as default
5. Click **Deploy**

Your site will be live in about 60 seconds at a URL like `cod-coach.vercel.app`

---

## Step 3 — Add your API key

1. In Vercel, go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Name: `ANTHROPIC_API_KEY`
5. Value: paste your API key from console.anthropic.com
6. Click **Save**
7. Go to **Deployments** and click **Redeploy** on your latest deployment

---

## Done!

Your CODCoach is live. Share the Vercel URL with anyone.

The image upload (📷 button) works on the real website — users can screenshot their CODM settings and the AI will read every number and tell them exactly what to fix.

---

## Custom domain (optional)

If you want a proper domain like `codcoach.gg`:
1. Buy a domain on Namecheap or GoDaddy (~$10/year)
2. In Vercel → Settings → Domains → Add your domain
3. Follow the DNS instructions Vercel gives you
