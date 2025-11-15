/**
 * Frontend API client for RAG-based smart search
 */

const API_BASE_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:3001/api'

/**
 * Perform a smart search query
 * @param {string} query - Natural language query
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Response with answer and sources
 */
export async function performSmartSearch(query, options = {}) {
  const { nResults = 10, where, stream = false } = options

  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        nResults,
        where,
        stream
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || `API error: ${response.status}`)
    }

    if (stream) {
      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      return {
        async *[Symbol.asyncIterator]() {
          let buffer = ''
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  yield data
                } catch (e) {
                  console.warn('Failed to parse SSE data:', e)
                }
              }
            }
          }
          
          // Process remaining buffer
          if (buffer.startsWith('data: ')) {
            try {
              const data = JSON.parse(buffer.slice(6))
              yield data
            } catch (e) {
              console.warn('Failed to parse final SSE data:', e)
            }
          }
        }
      }
    } else {
      // Handle regular response
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error('Smart search error:', error)
    throw error
  }
}

/**
 * Check if the RAG API is available
 * @returns {Promise<boolean>}
 */
export async function checkRAGAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Get indexing status
 * @returns {Promise<Object>} - Status with count
 */
export async function getIndexingStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/index/status`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to get indexing status:', error)
    throw error
  }
}

/**
 * Trigger data indexing
 * @param {boolean} clear - Whether to clear existing data first
 * @returns {Promise<Object>} - Indexing result
 */
export async function indexData(clear = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clear })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || `API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Indexing error:', error)
    throw error
  }
}

