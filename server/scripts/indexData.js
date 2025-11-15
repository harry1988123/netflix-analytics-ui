import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Load environment variables
dotenv.config({ path: dirname(dirname(fileURLToPath(import.meta.url))) + '/.env' })

// This script can be used to index data via the API endpoint
// Or you can use: curl -X POST http://localhost:3001/api/index

console.log('To index data, use the API endpoint:')
console.log('POST http://localhost:3001/api/index')
console.log('Or use curl:')
console.log('curl -X POST http://localhost:3001/api/index -H "Content-Type: application/json" -d \'{"clear": true}\'')
console.log('\nMake sure the backend server is running first!')

