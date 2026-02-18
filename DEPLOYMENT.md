# Vercel Deployment Guide

This guide will help you deploy the Bilingual Dictionary application to Vercel.

## Quick Start

### Method 1: Deploy via Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

### Method 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click "Deploy" (no configuration needed!)

## Project Configuration

The project is pre-configured for Vercel with:

- ✅ `vercel.json` - Routing configuration
- ✅ `api/index.js` - Serverless function entry point
- ✅ `public/` - Static files directory

## File Structure

```
.
├── api/
│   └── index.js          # Serverless function (Express app)
├── routes/
│   └── dictionary.js     # API routes
├── services/
│   └── dictionaryService.js
├── public/
│   ├── index.html        # Frontend UI
│   ├── styles.css
│   └── app.js
├── vercel.json           # Vercel configuration
├── package.json
└── README.md
```

## How It Works

1. **Static Files**: Files in `public/` are served directly from Vercel's CDN
2. **API Routes**: All `/api/*` routes are handled by the Express app in `api/index.js`
3. **Root Route**: `/` serves `public/index.html`
4. **Serverless**: The Express app runs as a serverless function

## Environment Variables

**No environment variables are required!** The app uses free public APIs:
- Free Dictionary API (no key needed)
- MyMemory Translation API (free tier)
- Datamuse API (no key needed)

## Testing Locally with Vercel

You can test the Vercel configuration locally:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run local development server
vercel dev
```

This will start a local server that mimics Vercel's production environment.

## Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] `vercel.json` exists in project root
- [ ] `api/index.js` exists and exports Express app
- [ ] `public/` directory contains frontend files
- [ ] `package.json` has all dependencies listed
- [ ] No sensitive data in code (use environment variables if needed)

## Post-Deployment

After deployment, you'll receive:
- **Production URL**: `https://your-project.vercel.app`
- **Preview URLs**: For each branch/PR

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## Troubleshooting

### API Routes Return 404

- Check that `api/index.js` exists
- Verify `vercel.json` routes configuration
- Ensure routes start with `/api/`

### Static Files Not Loading

- Verify files are in `public/` directory
- Check that files are committed to Git
- Clear browser cache

### Build Fails

- Check Node.js version (requires >= 14.0.0)
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

### CORS Issues

- CORS is already configured in `api/index.js`
- If issues persist, check Vercel function logs

## Performance Tips

- ✅ Static files are automatically cached on CDN
- ✅ API responses can be cached (add cache headers if needed)
- ✅ Serverless functions scale automatically
- ✅ No server maintenance required

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

For app-specific issues:
- Check the main README.md
- Review error logs in Vercel dashboard

## Next Steps

1. **Monitor**: Check Vercel dashboard for analytics
2. **Optimize**: Add caching if needed
3. **Scale**: Vercel handles scaling automatically
4. **Custom Domain**: Add your own domain

Happy deploying! 🚀
