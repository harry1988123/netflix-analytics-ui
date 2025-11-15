import express from 'express'
import { performRAGQuery } from '../services/ragService.js'

export const searchRouter = express.Router()

/**
 * POST /api/search
 * Perform RAG-based smart search
 */
searchRouter.post('/', async (req, res, next) => {
  try {
    const { query, nResults, where, stream } = req.body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required and must be a non-empty string' })
    }

    const result = await performRAGQuery(query, {
      nResults: nResults || 10,
      where,
      stream: stream || false
    })

    if (stream && result.stream) {
      // Set up streaming response
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Send sources first
      res.write(`data: ${JSON.stringify({ type: 'sources', data: result.sources })}\n\n`)

      // Stream the answer
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunkText })}\n\n`)
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
      res.end()
    } else {
      // Send complete response
      res.json(result)
    }
  } catch (error) {
    next(error)
  }
})

