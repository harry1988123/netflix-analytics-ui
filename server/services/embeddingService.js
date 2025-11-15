import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from root .env file
// In Netlify Functions, environment variables are provided directly via process.env
// Only load .env file if we're not in a Netlify environment
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  let currentDir
  if (typeof __dirname !== 'undefined') {
    currentDir = __dirname
  } else {
    const currentFile = fileURLToPath(import.meta.url)
    currentDir = dirname(currentFile)
  }
  try {
    dotenv.config({ path: join(currentDir, '../../.env') })
  } catch (e) {
    // .env file not found, that's okay
  }
}

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
const EMBEDDING_MODEL = 'models/text-embedding-004' // Gemini embedding model

let genAI = null

/**
 * Initialize Gemini client
 */
function initializeGemini() {
  if (genAI) {
    return genAI
  }

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY or GEMINI_API_KEY in your .env file.')
  }

  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  return genAI
}

/**
 * Generate embedding for a single text
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} - Embedding vector
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Text must be a non-empty string')
  }

  const ai = initializeGemini()

  try {
    // Use the embedding model
    const model = ai.getGenerativeModel({ model: EMBEDDING_MODEL })
    
    // Generate embedding using embedContent
    const result = await model.embedContent(text)
    
    // Extract embedding values
    let embedding
    if (result.embedding && result.embedding.values) {
      embedding = result.embedding.values
    } else if (Array.isArray(result.embedding)) {
      embedding = result.embedding
    } else if (result.embedding) {
      // Try to extract from response structure
      embedding = result.embedding
    } else {
      throw new Error('Unexpected embedding response structure')
    }

    if (!embedding || embedding.length === 0) {
      throw new Error('Failed to generate embedding: empty result')
    }

    return embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    
    // Check if it's a model not found error - try alternative
    if (error.message && error.message.includes('not found')) {
      console.warn(`Model ${EMBEDDING_MODEL} not found, trying alternative approach...`)
      // Try with gemini-embedding-001 as fallback
      try {
        const fallbackModel = ai.getGenerativeModel({ model: 'models/gemini-embedding-001' })
        const result = await fallbackModel.embedContent(text)
        const embedding = result.embedding?.values || result.embedding
        if (embedding && embedding.length > 0) {
          return embedding
        }
      } catch (fallbackError) {
        console.error('Fallback embedding model also failed:', fallbackError)
      }
      throw new Error(`Embedding model ${EMBEDDING_MODEL} is not available. Please check available models.`)
    }
    
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {Array<string>} texts - Array of texts to embed
 * @param {number} batchSize - Number of texts to process at once (default: 10)
 * @returns {Promise<Array<Array<number>>>} - Array of embedding vectors
 */
export async function generateEmbeddingsBatch(texts, batchSize = 10) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error('Texts must be a non-empty array')
  }

  const embeddings = []
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    console.log(`Processing embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`)
    
    const batchPromises = batch.map(text => 
      generateEmbedding(text).catch(error => {
        console.error(`Failed to generate embedding for text: ${text.substring(0, 50)}...`, error)
        return null
      })
    )
    
    const batchResults = await Promise.all(batchPromises)
    embeddings.push(...batchResults)
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Filter out any null results
  const validEmbeddings = embeddings.filter(emb => emb !== null)
  
  if (validEmbeddings.length !== texts.length) {
    console.warn(`Generated ${validEmbeddings.length} embeddings out of ${texts.length} texts`)
  }

  return validEmbeddings
}

