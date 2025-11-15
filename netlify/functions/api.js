// Netlify serverless function wrapper for Express app
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
// In Netlify Functions, environment variables are provided directly via process.env
// Only load .env file if we're not in a Netlify environment
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
        // Only try to load .env in local development
        const currentFile = fileURLToPath(import.meta.url)
        const currentDir = dirname(currentFile)
        dotenv.config({ path: join(currentDir, '../../.env') })
    } catch (e) {
        // If .env file doesn't exist, that's okay
        console.log('No .env file found, using environment variables')
    }
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

