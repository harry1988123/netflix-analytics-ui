// Netlify serverless function wrapper for Express app
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') })

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

