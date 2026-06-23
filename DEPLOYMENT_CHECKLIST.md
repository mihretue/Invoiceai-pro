# Pre-Deployment Checklist

## Code Quality
- [ ] `npm run build` completes without TypeScript errors
- [ ] `npm run lint` passes (or warnings reviewed)
- [ ] No `console.log` statements in production paths
- [ ] No unused imports flagged by TypeScript
- [ ] All TODO comments resolved

## Security
- [ ] `.env.local` is in `.gitignore` and NOT committed
- [ ] No API keys or secrets hardcoded in source
- [ ] `NEXT_PUBLIC_API_URL` points to HTTPS endpoint in production
- [ ] Auth token only stored in `localStorage` (not cookies, not logged)

## Environment Variables (Vercel Dashboard)
- [ ] `NEXT_PUBLIC_API_URL` set to production backend URL
- [ ] `NEXT_PUBLIC_APP_NAME` set (optional)

## Production Build Test (local)
```bash
cd frontend
npm run build
npm run start
# Visit http://localhost:3000 and run through TESTING_CHECKLIST.md
```

## Vercel Deployment
```bash
# One-time setup
npm install -g vercel
vercel login
cd frontend
vercel          # follow prompts, sets up project

# Subsequent deploys (or push to main for auto-deploy)
vercel --prod
```

## Post-Deploy Smoke Test
- [ ] Deployed URL loads login page
- [ ] Can log in with test credentials
- [ ] Dashboard charts render
- [ ] Upload a PDF and see extraction
- [ ] Edit an extraction
- [ ] Export CSV downloads
- [ ] No console errors in DevTools
- [ ] Works on mobile Safari

## Rollback
```bash
vercel ls          # list deployments
vercel rollback    # revert to previous deployment
```
