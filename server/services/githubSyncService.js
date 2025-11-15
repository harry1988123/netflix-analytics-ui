import { CloudClient } from 'chromadb'
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

const CHROMA_API_KEY = process.env.CHROMA_API_KEY
const CHROMA_TENANT = process.env.CHROMA_TENANT
const CHROMA_DATABASE = process.env.CHROMA_DATABASE
const GITHUB_TOKEN = process.env.GITHUB_TOKEN // Optional: for GitHub API access

let client = null

/**
 * Initialize ChromaDB Cloud client
 */
async function getClient() {
  if (client) {
    return client
  }

  if (!CHROMA_API_KEY || !CHROMA_TENANT || !CHROMA_DATABASE) {
    throw new Error('ChromaDB credentials are not configured.')
  }

  client = new CloudClient({
    apiKey: CHROMA_API_KEY,
    tenant: CHROMA_TENANT,
    database: CHROMA_DATABASE
  })

  return client
}

/**
 * Get sync status for a GitHub repository
 * Note: This uses ChromaDB Cloud API directly for sync operations
 * @param {string} repoOwner - GitHub repository owner
 * @param {string} repoName - GitHub repository name
 * @returns {Promise<Object>} - Sync status information
 */
export async function getSyncStatus(repoOwner, repoName) {
  try {
    const client = await getClient()
    
    // ChromaDB Cloud sync API endpoint
    const syncApiUrl = `https://api.trychroma.com/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/syncs/github`
    
    // Note: This would require making direct API calls to ChromaDB's sync endpoint
    // The CloudClient might not have direct sync methods, so we may need to use fetch
    const response = await fetch(`${syncApiUrl}?owner=${repoOwner}&repo=${repoName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get sync status: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting sync status:', error)
    throw new Error(`Failed to get sync status: ${error.message}`)
  }
}

/**
 * Create or update a GitHub sync configuration
 * @param {Object} config - Sync configuration
 * @param {string} config.repoOwner - GitHub repository owner
 * @param {string} config.repoName - GitHub repository name
 * @param {string} config.branch - Branch to sync (default: 'main')
 * @param {string} config.path - Path in repository to sync (optional)
 * @param {string} config.collectionName - Target collection name (optional)
 * @returns {Promise<Object>} - Sync configuration result
 */
export async function createOrUpdateSync(config) {
  try {
    const { repoOwner, repoName, branch = 'main', path = '', collectionName } = config

    if (!repoOwner || !repoName) {
      throw new Error('Repository owner and name are required')
    }

    // ChromaDB Cloud sync API endpoint
    const syncApiUrl = `https://api.trychroma.com/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/syncs/github`
    
    const syncConfig = {
      owner: repoOwner,
      repo: repoName,
      branch: branch,
      path: path,
      collection: collectionName || `github_${repoOwner}_${repoName}`
    }

    const response = await fetch(syncApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(syncConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create sync: ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating sync:', error)
    throw new Error(`Failed to create sync: ${error.message}`)
  }
}

/**
 * Trigger a manual sync for a GitHub repository
 * @param {string} repoOwner - GitHub repository owner
 * @param {string} repoName - GitHub repository name
 * @returns {Promise<Object>} - Sync trigger result
 */
export async function triggerSync(repoOwner, repoName) {
  try {
    const syncApiUrl = `https://api.trychroma.com/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/syncs/github/trigger`
    
    const response = await fetch(syncApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        owner: repoOwner,
        repo: repoName
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to trigger sync: ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error triggering sync:', error)
    throw new Error(`Failed to trigger sync: ${error.message}`)
  }
}

/**
 * List all GitHub syncs for the database
 * @returns {Promise<Array>} - List of sync configurations
 */
export async function listSyncs() {
  try {
    const syncApiUrl = `https://api.trychroma.com/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/syncs/github`
    
    const response = await fetch(syncApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to list syncs: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error listing syncs:', error)
    throw new Error(`Failed to list syncs: ${error.message}`)
  }
}

/**
 * Delete a GitHub sync configuration
 * @param {string} repoOwner - GitHub repository owner
 * @param {string} repoName - GitHub repository name
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteSync(repoOwner, repoName) {
  try {
    const syncApiUrl = `https://api.trychroma.com/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/syncs/github`
    
    const response = await fetch(`${syncApiUrl}?owner=${repoOwner}&repo=${repoName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete sync: ${response.statusText} - ${errorText}`)
    }

    return { success: true, message: 'Sync deleted successfully' }
  } catch (error) {
    console.error('Error deleting sync:', error)
    throw new Error(`Failed to delete sync: ${error.message}`)
  }
}

