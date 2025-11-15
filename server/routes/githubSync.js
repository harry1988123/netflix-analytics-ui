import express from 'express'
import {
  getSyncStatus,
  createOrUpdateSync,
  triggerSync,
  listSyncs,
  deleteSync
} from '../services/githubSyncService.js'

export const githubSyncRouter = express.Router()

/**
 * GET /api/github-sync
 * List all GitHub syncs
 */
githubSyncRouter.get('/', async (req, res, next) => {
  try {
    const syncs = await listSyncs()
    res.json({ success: true, syncs })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/github-sync/status
 * Get sync status for a specific repository
 */
githubSyncRouter.get('/status', async (req, res, next) => {
  try {
    const { owner, repo } = req.query

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Repository owner and name (repo) are required as query parameters'
      })
    }

    const status = await getSyncStatus(owner, repo)
    res.json({ success: true, status })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/github-sync
 * Create or update a GitHub sync configuration
 */
githubSyncRouter.post('/', async (req, res, next) => {
  try {
    const { repoOwner, repoName, branch, path, collectionName } = req.body

    if (!repoOwner || !repoName) {
      return res.status(400).json({
        error: 'repoOwner and repoName are required in the request body'
      })
    }

    const result = await createOrUpdateSync({
      repoOwner,
      repoName,
      branch: branch || 'main',
      path: path || '',
      collectionName
    })

    res.json({ success: true, result })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/github-sync/trigger
 * Trigger a manual sync for a repository
 */
githubSyncRouter.post('/trigger', async (req, res, next) => {
  try {
    const { repoOwner, repoName } = req.body

    if (!repoOwner || !repoName) {
      return res.status(400).json({
        error: 'repoOwner and repoName are required in the request body'
      })
    }

    const result = await triggerSync(repoOwner, repoName)
    res.json({ success: true, result })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/github-sync
 * Delete a GitHub sync configuration
 */
githubSyncRouter.delete('/', async (req, res, next) => {
  try {
    const { owner, repo } = req.query

    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Repository owner and name (repo) are required as query parameters'
      })
    }

    const result = await deleteSync(owner, repo)
    res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
})

