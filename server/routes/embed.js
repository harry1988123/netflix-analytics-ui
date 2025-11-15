import express from 'express'
import { generateEmbedding, generateEmbeddingsBatch } from '../services/embeddingService.js'

export const embedRouter = express.Router()

/**
 * POST /api/embed
 * Generate embedding for a single text
 */
embedRouter.post('/', async (req, res, next) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' })
    }

    const embedding = await generateEmbedding(text)
    res.json({ embedding })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/embed/batch
 * Generate embeddings for multiple texts
 */
embedRouter.post('/batch', async (req, res, next) => {
  try {
    const { texts, batchSize } = req.body

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Texts must be a non-empty array' })
    }

    const embeddings = await generateEmbeddingsBatch(texts, batchSize || 10)
    res.json({ embeddings })
  } catch (error) {
    next(error)
  }
})

