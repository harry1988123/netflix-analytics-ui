// Netlify serverless function wrapper for Express app
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get directory path - Netlify Functions may already provide __dirname
// Use a different variable name to avoid conflicts
let currentDir
if (typeof __dirname !== 'undefined') {
    // Use provided __dirname if available
    currentDir = __dirname
} else {
    // Otherwise, construct it from import.meta.url
    const currentFile = fileURLToPath(import.meta.url)
    currentDir = dirname(currentFile)
}

// Load environment variables
// In Netlify, environment variables are available via process.env
// We still load .env for local development
try {
    dotenv.config({ path: join(currentDir, '../../.env') })
} catch (e) {
    // If .env file doesn't exist, that's okay - use environment variables from Netlify
    console.log('No .env file found, using environment variables from Netlify')
}

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RAG API server is running' })
})

// Import routes
import { embedRouter } from '../../server/routes/embed.js'
import { indexRouter } from '../../server/routes/index.js'
import { searchRouter } from '../../server/routes/search.js'
import { githubSyncRouter } from '../../server/routes/githubSync.js'

app.use('/api/embed', embedRouter)
app.use('/api/index', indexRouter)
app.use('/api/search', searchRouter)
app.use('/api/github-sync', githubSyncRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    })
})

// Export the serverless handler
export const handler = serverless(app)

