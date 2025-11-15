import express from 'express'
import { addDocuments, getCollectionCount, clearCollection } from '../services/chromadbService.js'
import { generateEmbeddingsBatch } from '../services/embeddingService.js'
import Papa from 'papaparse'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const indexRouter = express.Router()

/**
 * Extract main title from episode titles (same logic as frontend)
 */
function extractMainTitle(fullTitle) {
  if (!fullTitle) return fullTitle

  let mainTitle = fullTitle.trim()

  if (/: Episodes?\s*\(/.test(mainTitle)) {
    const match = mainTitle.match(/^([^:]+: Episodes?)/)
    if (match) {
      return match[1].trim()
    }
  }

  if (/: Season\s+\d+/i.test(mainTitle)) {
    const match = mainTitle.match(/^([^:]+?)(?:\s*:\s*Season\s+\d+)/i)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  const parts = mainTitle.split(':').map(p => p.trim())
  if (parts.length >= 3) {
    const firstPart = parts[0]
    const secondPart = parts[1]
    if (firstPart && secondPart && firstPart.length > 2) {
      if (/: Season\s+\d+/.test(mainTitle)) {
        return `${firstPart}: ${secondPart}`.trim()
      }
      if (parts.length >= 4 && parts[1] === parts[2]) {
        return `${firstPart}: ${secondPart}`.trim()
      }
    }
  }

  const patterns = [
    /:\s*Season\s+\d+\s*:.*/i,
    /:\s*Episode\s+\d+.*/i,
    /:\s*Episodes?\s+\(\d+-\d+\).*/i,
    /:\s*\d{2}-\d{2}-\d{4}.*/i,
    /:\s*\d{4}:\s*.*/i,
    /:\s*\d{1,2}\/\d{1,2}\/\d{2,4}.*/i,
    /:\s*S\d+E\d+.*/i,
    /:\s*Part\s+\d+.*/i,
    /:\s*Chapter\s+\d+.*/i,
  ]

  for (const pattern of patterns) {
    const before = mainTitle
    mainTitle = mainTitle.replace(pattern, '').trim()
    if (mainTitle !== before && mainTitle.length >= 3) {
      break
    }
    mainTitle = before
  }

  mainTitle = mainTitle.replace(/:\s*$/, '').trim()

  if (!mainTitle || mainTitle.length < 3) {
    return fullTitle
  }

  return mainTitle
}

/**
 * Parse US date format
 */
function parseUSDate(str) {
  const [m, d, y] = str.split('/').map(Number)
  const year = y < 100 ? 2000 + y : y
  return new Date(year, m - 1, d)
}

/**
 * Format date to YYYY-MM-DD
 */
function formatYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * POST /api/index
 * Index CSV data into ChromaDB
 */
indexRouter.post('/', async (req, res, next) => {
  try {
    const { clear = false } = req.body

    // Clear collection if requested
    if (clear) {
      await clearCollection()
    }

    // Load CSV files
    const profileFiles = [1, 2, 3, 4, 5].map(num => 
      join(__dirname, '../../public/data', `NetflixViewingHistory_${num}.csv`)
    )

    const allRows = []
    
    for (let i = 0; i < profileFiles.length; i++) {
      const filePath = profileFiles[i]
      const profileNumber = i + 1
      
      try {
        const fileContent = readFileSync(filePath, 'utf-8')
        const parsed = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true
        })

        const rows = parsed.data
          .filter(r => r.Title && r.Date)
          .map(r => {
            try {
              const dt = parseUSDate(r.Date)
              return {
                title: r.Title,
                date: formatYMD(dt),
                profile: profileNumber,
                mainTitle: extractMainTitle(r.Title)
              }
            } catch (error) {
              console.warn(`Failed to parse date for row: ${r.Date}`, error)
              return null
            }
          })
          .filter(r => r !== null)

        allRows.push(...rows)
        console.log(`Loaded ${rows.length} rows from profile ${profileNumber}`)
      } catch (error) {
        console.warn(`Failed to load profile ${profileNumber} data:`, error.message)
      }
    }

    if (allRows.length === 0) {
      return res.status(400).json({ error: 'No data found to index' })
    }

    console.log(`Total rows to index: ${allRows.length}`)

    // Create documents for embedding
    const documents = allRows.map((row, index) => {
      // Create a rich document text that includes context
      const docText = `Title: ${row.title}\nDate: ${row.date}\nProfile: ${row.profile}\nMain Title: ${row.mainTitle || row.title}`
      
      return {
        id: `netflix_${row.profile}_${index}_${row.date}`,
        text: docText,
        metadata: {
          title: row.title,
          date: row.date,
          profile: row.profile,
          mainTitle: row.mainTitle || row.title
        }
      }
    })

    // Generate embeddings in batches
    console.log('Generating embeddings...')
    const texts = documents.map(doc => doc.text)
    const embeddings = await generateEmbeddingsBatch(texts, 20)

    if (embeddings.length !== documents.length) {
      return res.status(500).json({ 
        error: `Embedding generation failed: expected ${documents.length}, got ${embeddings.length}` 
      })
    }

    // Prepare documents for ChromaDB
    const chromaDocuments = documents.map((doc, index) => ({
      id: doc.id,
      embedding: embeddings[index],
      metadata: doc.metadata,
      document: doc.text
    }))

    // Add to ChromaDB
    console.log('Adding documents to ChromaDB...')
    await addDocuments(chromaDocuments)

    const count = await getCollectionCount()

    res.json({
      success: true,
      indexed: documents.length,
      totalInCollection: count
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/index/status
 * Get indexing status
 */
indexRouter.get('/status', async (req, res, next) => {
  try {
    const count = await getCollectionCount()
    res.json({ count })
  } catch (error) {
    next(error)
  }
})

