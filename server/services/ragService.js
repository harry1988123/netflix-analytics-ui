import { generateEmbedding } from './embeddingService.js'
import { queryCollection } from './chromadbService.js'
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
const GENERATION_MODEL = 'gemini-2.5-flash-lite'

let genAI = null

/**
 * Initialize Gemini client for generation
 */
function initializeGemini() {
  if (genAI) {
    return genAI
  }

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.')
  }

  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  return genAI
}

/**
 * Perform RAG query: retrieve relevant documents and generate answer
 * @param {string} query - User's natural language query
 * @param {Object} options - Query options (nResults, filters, etc.)
 * @returns {Promise<Object>} - Response with answer and sources
 */
export async function performRAGQuery(query, options = {}) {
  const {
    nResults = 10,
    where = undefined,
    stream = false
  } = options

  try {
    // Step 1: Generate embedding for the query
    console.log('Generating query embedding...')
    const queryEmbedding = await generateEmbedding(query)

    // Step 2: Search for similar documents in ChromaDB
    console.log('Searching ChromaDB for similar documents...')
    const searchResults = await queryCollection(queryEmbedding, {
      nResults,
      where,
      include: ['metadatas', 'documents', 'distances']
    })

    if (!searchResults.documents || searchResults.documents.length === 0) {
      return {
        answer: "I couldn't find any relevant viewing history data to answer your question. Please try rephrasing your query or check if the data has been indexed.",
        sources: [],
        relevantEntries: []
      }
    }

    // Step 3: Prepare context from retrieved documents
    const contextEntries = searchResults.documents.map((doc, index) => ({
      title: searchResults.metadatas[index]?.title || doc,
      date: searchResults.metadatas[index]?.date || '',
      profile: searchResults.metadatas[index]?.profile || '',
      mainTitle: searchResults.metadatas[index]?.mainTitle || '',
      distance: searchResults.distances[index] || 0,
      document: doc
    }))

    // Step 4: Build prompt with context
    const contextText = contextEntries
      .map((entry, idx) => {
        return `${idx + 1}. Title: ${entry.title}\n   Date: ${entry.date}\n   Profile: ${entry.profile}\n   Main Title: ${entry.mainTitle || entry.title}`
      })
      .join('\n\n')

    const prompt = `You are a helpful assistant analyzing Netflix viewing history data. Answer the user's question based on the following viewing history entries.

Viewing History Context:
${contextText}

User Question: ${query}

Instructions:
1. Analyze the viewing history entries above to answer the user's question
2. Provide a clear, concise answer based on the data
3. If the question asks about trends (like "Christmas trend"), identify patterns in the dates and titles
4. Mention specific titles, dates, or profiles when relevant
5. If the data doesn't contain enough information to fully answer, say so
6. Format your response in a friendly, conversational manner

Answer:`

    // Step 5: Generate answer using Gemini
    console.log('Generating answer with Gemini...')
    const ai = initializeGemini()
    const model = ai.getGenerativeModel({
      model: GENERATION_MODEL,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    })

    if (stream) {
      // Return a streaming response
      const result = await model.generateContentStream(prompt)
      return {
        stream: result.stream,
        sources: contextEntries,
        relevantEntries: contextEntries
      }
    } else {
      // Return a complete response
      const result = await model.generateContent(prompt)
      let answer = ''

      try {
        answer = result.response.text()
      } catch (error) {
        // Fallback extraction
        if (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          answer = result.response.candidates[0].content.parts[0].text
        } else {
          answer = 'Failed to generate a response. Please try again.'
        }
      }

      return {
        answer,
        sources: contextEntries,
        relevantEntries: contextEntries
      }
    }
  } catch (error) {
    console.error('RAG query error:', error)
    throw new Error(`RAG query failed: ${error.message}`)
  }
}

/**
 * Format sources for display
 * @param {Array} sources - Array of source entries
 * @returns {Array} - Formatted sources
 */
export function formatSources(sources) {
  return sources.map(source => ({
    title: source.title,
    date: source.date,
    profile: source.profile,
    mainTitle: source.mainTitle || source.title,
    relevance: source.distance ? (1 - source.distance).toFixed(2) : 'N/A'
  }))
}

