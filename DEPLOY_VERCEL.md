# Vercel Deployment Checklist (Research Hub)

This project requires a **server runtime** (Next.js API routes). Static hosting will break search and OAuth callbacks.

## 1) Connect repo in Vercel
- Import repo: `NUbivek/searchbar`
- Framework: Next.js (auto)
- Root directory: repository root

## 2) Set Production Domain
- Primary domain: `research.bivek.ai`
- (Optional) add `airesearch.bivek.ai` as alias

## 3) Required Environment Variables (Vercel)
Set these in **Project → Settings → Environment Variables** for Production (and Preview as needed):

### Core app
- `NEXT_PUBLIC_BASE_URL=https://research.bivek.ai`
- `NEXT_PUBLIC_PRODUCTION_URL=https://research.bivek.ai`
- `NEXT_PUBLIC_USE_PRODUCTION_CALLBACKS=true`

### Search providers
- `SERPER_API_KEY=...` (optional if using fallback chain)
- `BRAVE_SEARCH_API_KEY=...` (optional, free tier)

### LLM
- `TOGETHER_API_KEY=...`
- `PERPLEXITY_API_KEY=...`

### LinkedIn OAuth app
- `LINKEDIN_CLIENT_ID=...`
- `LINKEDIN_CLIENT_SECRET=...`
- `LINKEDIN_REDIRECT_URI=https://research.bivek.ai/api/auth/linkedin/callback`

### X/Twitter OAuth app
- `TWITTER_CLIENT_ID=...`
- `TWITTER_CLIENT_SECRET=...`
- `TWITTER_REDIRECT_URI=https://research.bivek.ai/api/auth/twitter/callback`

### Reddit OAuth app (if used)
- `REDDIT_CLIENT_ID=...`
- `REDDIT_CLIENT_SECRET=...`
- `REDDIT_REDIRECT_URI=https://research.bivek.ai/api/auth/reddit/callback`

## 4) OAuth Provider Callback URLs
Configure these in provider dashboards exactly:
- LinkedIn: `https://research.bivek.ai/api/auth/linkedin/callback`
- X/Twitter: `https://research.bivek.ai/api/auth/twitter/callback`
- Reddit: `https://research.bivek.ai/api/auth/reddit/callback`

## 5) Post-deploy verification
- `GET /api/debug/env-check` returns 200
- `POST /api/search` returns non-empty results (or fail-soft with suggestions)
- LinkedIn and X connect flow returns to site without callback error

## Notes
- This repo now removes hardcoded secrets from `vercel.json`.
- GitHub Actions workflow is now **build validation only**; deployment should be from Vercel.
