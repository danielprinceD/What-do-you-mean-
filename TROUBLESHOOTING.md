# Troubleshooting NOT_FOUND Error on Vercel

If you're getting a `NOT_FOUND` (404) error when deploying to Vercel, follow these steps:

## Common Causes & Solutions

### 1. Check Deployment URL
- Ensure the deployment URL is correct
- Check for typos in the URL
- Verify the deployment exists in your Vercel dashboard

### 2. Verify File Structure

Your project should have this structure:
```
.
├── api/
│   └── index.js          ✅ Must exist
├── public/
│   ├── index.html        ✅ Must exist
│   ├── styles.css        ✅ Must exist
│   └── app.js            ✅ Must exist
├── routes/
│   └── dictionary.js     ✅ Must exist
├── services/
│   └── dictionaryService.js ✅ Must exist
├── vercel.json           ✅ Must exist
└── package.json          ✅ Must exist
```

### 3. Check vercel.json Configuration

The `vercel.json` should route:
- `/api/*` → `/api/index.js` (serverless function)
- `/health` → `/api/index.js` (serverless function)
- Everything else → `/api/index.js` (which serves static files)

### 4. Verify All Files Are Committed

Make sure all files are committed to Git:
```bash
git status
git add .
git commit -m "Fix deployment"
git push
```

### 5. Check Build Logs

1. Go to your Vercel dashboard
2. Click on the failed deployment
3. Check the "Build Logs" tab
4. Look for any errors or warnings

### 6. Test API Routes

After deployment, test these URLs:
- `https://your-project.vercel.app/` - Should show the UI
- `https://your-project.vercel.app/health` - Should return JSON
- `https://your-project.vercel.app/api/dictionary/hello` - Should return word data

### 7. Common Issues

#### Issue: Root route (/) returns 404
**Solution:** The `api/index.js` now serves `index.html` for the root route. Make sure the file exists in `public/index.html`.

#### Issue: Static files (CSS/JS) not loading
**Solution:** 
- Verify files are in `public/` directory
- Check that file paths in HTML are correct (e.g., `href="styles.css"` not `href="/styles.css"`)
- Clear browser cache

#### Issue: API routes return 404
**Solution:**
- Verify `api/index.js` exists and exports the Express app
- Check that routes are properly defined
- Ensure `vercel.json` routes `/api/*` to `/api/index.js`

### 8. Redeploy

After making changes:
```bash
# Redeploy
vercel --prod

# Or push to Git (if auto-deploy is enabled)
git push
```

### 9. Check Environment Variables

This app doesn't require environment variables, but if you add any:
- Go to Project Settings → Environment Variables
- Add variables for Production, Preview, and Development
- Redeploy after adding variables

### 10. Verify Node.js Version

Check `package.json` has:
```json
"engines": {
  "node": ">=14.0.0"
}
```

## Still Having Issues?

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check logs for runtime errors

2. **Test Locally with Vercel:**
   ```bash
   vercel dev
   ```
   This runs a local server that mimics Vercel's environment.

3. **Contact Support:**
   - [Vercel Support](https://vercel.com/help)
   - Include deployment URL and error logs

## Quick Fix Checklist

- [ ] All files committed to Git
- [ ] `api/index.js` exists and exports Express app
- [ ] `public/index.html` exists
- [ ] `vercel.json` is in project root
- [ ] No build errors in Vercel dashboard
- [ ] Deployment completed successfully
- [ ] Tested root URL (`/`)
- [ ] Tested API endpoint (`/api/dictionary/hello`)

## Expected Behavior

After successful deployment:
- ✅ Root URL (`/`) shows the dictionary UI
- ✅ API routes (`/api/dictionary/:word`) return JSON
- ✅ Static files (CSS, JS) load correctly
- ✅ Health check (`/health`) returns JSON

If all these work, your deployment is successful! 🎉
