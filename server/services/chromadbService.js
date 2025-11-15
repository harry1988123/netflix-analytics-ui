import { CloudClient } from 'chromadb'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from root .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

const CHROMA_API_KEY = process.env.CHROMA_API_KEY
const CHROMA_TENANT = process.env.CHROMA_TENANT
const CHROMA_DATABASE = process.env.CHROMA_DATABASE
const COLLECTION_NAME = 'netflix_viewing_history'

let client = null
let collection = null

/**
 * Initialize ChromaDB Cloud client
 */
export async function initializeChromaClient() {
  if (client) {
    return client
  }

  if (!CHROMA_API_KEY || !CHROMA_TENANT || !CHROMA_DATABASE) {
    throw new Error('ChromaDB credentials are not configured. Please set CHROMA_API_KEY, CHROMA_TENANT, and CHROMA_DATABASE in your .env file.')
  }

  try {
    console.log(`Initializing ChromaDB Cloud client...`)
    console.log(`Tenant: ${CHROMA_TENANT}`)
    console.log(`Database: ${CHROMA_DATABASE}`)
    console.log(`API Key present: ${!!CHROMA_API_KEY}`)

    // Initialize ChromaDB Cloud client with the correct configuration
    client = new CloudClient({
      apiKey: CHROMA_API_KEY,
      tenant: CHROMA_TENANT,
      database: CHROMA_DATABASE
    })

    console.log(`ChromaDB Cloud client initialized successfully`)
    return client
  } catch (error) {
    console.error('Failed to initialize ChromaDB client:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      tenant: CHROMA_TENANT,
      database: CHROMA_DATABASE,
      hasApiKey: !!CHROMA_API_KEY
    })
    throw new Error(`ChromaDB initialization failed: ${error.message}`)
  }
}

/**
 * Get or create the collection
 */
export async function getCollection() {
  if (collection) {
    return collection
  }

  const client = await initializeChromaClient()

  try {
    // Try to get existing collection
    try {
      collection = await client.getCollection({
        name: COLLECTION_NAME
      })
      console.log(`Using existing collection: ${COLLECTION_NAME}`)
      return collection
    } catch (getError) {
      // Collection doesn't exist, create it
      // Check if error is because collection doesn't exist (404/not found) vs other errors
      const errorMessage = getError.message || ''
      const isNotFound =
        errorMessage.includes('not found') ||
        errorMessage.includes('could not be found') ||
        errorMessage.includes('404') ||
        getError.status === 404 ||
        getError.statusCode === 404

      if (isNotFound) {
        console.log(`Collection ${COLLECTION_NAME} not found, creating new collection...`)
        try {
          collection = await client.createCollection({
            name: COLLECTION_NAME,
            metadata: {
              description: 'Netflix viewing history with embeddings'
            }
          })
          console.log(`Successfully created new collection: ${COLLECTION_NAME}`)
          return collection
        } catch (createError) {
          console.error('Failed to create collection:', createError)
          throw new Error(`Failed to create collection: ${createError.message}`)
        }
      } else {
        // Some other error occurred
        throw getError
      }
    }
  } catch (error) {
    console.error('Failed to get/create collection:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      statusCode: error.statusCode,
      tenant: CHROMA_TENANT,
      database: CHROMA_DATABASE,
      collection: COLLECTION_NAME
    })
    throw new Error(`Collection operation failed: ${error.message}`)
  }
}

/**
 * Add documents to the collection in batches
 * @param {Array} documents - Array of document objects with id, embedding, metadata, and document text
 * @param {number} batchSize - Number of documents to add per batch (default: 100)
 */
export async function addDocuments(documents, batchSize = 100) {
  const coll = await getCollection()

  try {
    let totalAdded = 0
    const totalBatches = Math.ceil(documents.length / batchSize)

    // Process documents in batches to avoid payload size limits
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1

      // Prepare data for ChromaDB
      const ids = batch.map(doc => doc.id)
      const embeddings = batch.map(doc => doc.embedding)
      const metadatas = batch.map(doc => doc.metadata)
      const documents_text = batch.map(doc => doc.document)

      try {
        await coll.add({
          ids,
          embeddings,
          metadatas,
          documents: documents_text
        })

        totalAdded += batch.length
        console.log(`Added batch ${batchNumber}/${totalBatches}: ${batch.length} documents (Total: ${totalAdded}/${documents.length})`)
      } catch (batchError) {
        console.error(`Failed to add batch ${batchNumber}:`, batchError.message)
        // If batch is still too large, try smaller batches
        if (batchError.message && batchError.message.includes('Payload too large')) {
          console.log(`Batch ${batchNumber} too large, trying smaller batch size: ${Math.floor(batchSize / 2)}`)
          // Recursively try with smaller batch size
          await addDocuments(batch, Math.floor(batchSize / 2))
          totalAdded += batch.length
        } else {
          throw batchError
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`Successfully added ${totalAdded} documents to collection`)
    return { success: true, count: totalAdded }
  } catch (error) {
    console.error('Failed to add documents:', error)
    throw new Error(`Failed to add documents: ${error.message}`)
  }
}

/**
 * Query the collection for similar documents
 * @param {Array} queryEmbedding - The query embedding vector
 * @param {Object} options - Query options (nResults, where, etc.)
 */
export async function queryCollection(queryEmbedding, options = {}) {
  const coll = await getCollection()

  const {
    nResults = 10,
    where = undefined,
    include = ['metadatas', 'documents', 'distances']
  } = options

  try {
    const results = await coll.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
      where,
      include
    })

    return {
      ids: results.ids[0] || [],
      embeddings: results.embeddings?.[0] || [],
      documents: results.documents[0] || [],
      metadatas: results.metadatas[0] || [],
      distances: results.distances[0] || []
    }
  } catch (error) {
    console.error('Failed to query collection:', error)
    throw new Error(`Query failed: ${error.message}`)
  }
}

/**
 * Get collection count
 */
export async function getCollectionCount() {
  const coll = await getCollection()
  try {
    const count = await coll.count()
    return count
  } catch (error) {
    console.error('Failed to get collection count:', error)
    throw new Error(`Failed to get count: ${error.message}`)
  }
}

/**
 * Delete all documents from collection (useful for re-indexing)
 */
export async function clearCollection() {
  const coll = await getCollection()
  try {
    // Get all IDs first
    const allData = await coll.get()
    if (allData.ids && allData.ids.length > 0) {
      await coll.delete({ ids: allData.ids })
      console.log(`Deleted ${allData.ids.length} documents from collection`)
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to clear collection:', error)
    throw new Error(`Failed to clear collection: ${error.message}`)
  }
}

