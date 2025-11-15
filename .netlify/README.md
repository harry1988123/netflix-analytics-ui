# Netlify Deployment Guide

## Backend Deployment

The backend Express server is deployed as a Netlify Function. The function is located at `netlify/functions/api.js` and wraps the Express app using `serverless-http`.

## Environment Variables

Make sure to set the following environment variables in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variables:

```
CHROMA_API_KEY=your_chromadb_api_key
CHROMA_TENANT=your_tenant_id
CHROMA_DATABASE=your_database_name
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_RAG_API_URL=https://your-site.netlify.app/api
```

**Note**: For production, set `VITE_RAG_API_URL` to your Netlify site URL (e.g., `https://your-site.netlify.app/api`)

## Build Configuration

The `netlify.toml` file is configured to:
- Build the frontend with `npm run build`
- Deploy serverless functions from `netlify/functions`
- Redirect `/api/*` requests to the serverless function
- Handle SPA routing

## Testing Locally

To test the Netlify Functions locally:

```bash
npm install -g netlify-cli
netlify dev
```

This will start both the frontend and the serverless function locally.

## Deployment

1. **Via Netlify CLI:**
   ```bash
   netlify deploy --prod
   ```

2. **Via Git:**
   - Push to your connected Git repository
   - Netlify will automatically build and deploy

## API Endpoints

After deployment, your API endpoints will be available at:
- `https://your-site.netlify.app/api/health`
- `https://your-site.netlify.app/api/embed`
- `https://your-site.netlify.app/api/index`
- `https://your-site.netlify.app/api/search`
- `https://your-site.netlify.app/api/github-sync`

## Important Notes

- Netlify Functions have a 10-second execution timeout for the free tier (26 seconds for Pro)
- Large operations (like indexing) may need to be split into smaller batches
- Make sure all server dependencies are in the root `package.json` (not just in `server/package.json`)

