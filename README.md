# Netflix Viewing Explorer

A comprehensive, interactive analytics dashboard for exploring Netflix viewing history. Built with React, Tailwind CSS, and Recharts, featuring advanced data visualization, filtering capabilities, and a modern dark/light theme system.

![Dashboard Preview](./public/previewImages/image4.png)

## 📸 Screenshots

### Light Theme

#### Main Dashboard
![Light Theme Dashboard](./public/previewImages/image5.png)

#### Charts and Visualizations
![Light Theme Charts](./public/previewImages/image7.png)

#### Data Table
![Light Theme Table](./public/previewImages/image8.png)

### Dark Theme

#### Main Dashboard
![Dark Theme Dashboard](./public/previewImages/imageDark1.png)

#### Charts and Visualizations
![Dark Theme Charts](./public/previewImages/imageDark2.png)

#### Interactive Features
![Dark Theme Interactive](./public/previewImages/imageDark3.png)

#### Data Table
![Dark Theme Table](./public/previewImages/imageDark4.png)

#### Full View
![Dark Theme Full View](./public/previewImages/imageDark5.png)

## 🎯 Features

### Core Functionality
- **Interactive Search**: Real-time search filtering with debounced input (300ms delay)
- **Date Range Filters**: Custom date picker with quick filter presets (Last 3 Months, Last 6 Months, Last 1 Year)
- **Profile Selector**: Toggle between individual profiles (1-5) or view combined activity
- **Donut Chart Interaction**: Click on chart slices to filter the table by specific titles
- **Multiple Visualizations**:
  - Timeline chart showing viewing activity over time
  - Bar charts for top titles and day-of-week analysis
  - Line charts for monthly trends
  - Composed charts with average lines
  - Interactive donut chart with legend

### Advanced Features
- **Shimmer Loading Effects**: Beautiful loading animations while CSV data is being parsed
- **Dark/Light Theme**: Full theme system with persistent user preference
- **Virtualized Table**: High-performance table using TanStack Virtual for handling large datasets
- **State Persistence**: Filters persist across page refreshes via localStorage
- **URL Sharing**: All filter states are mirrored to URL parameters for easy sharing
- **Responsive Design**: Fully responsive layout that works on all screen sizes
- **Insights Dialog**: One-click modal summarizing yearly, monthly, weekly, and franchise insights
- **Real-time AI Streaming**: AI-generated insights stream in real-time for immediate feedback and better user experience
- **RAG Smart Search**: AI-powered natural language search using ChromaDB Cloud and Google Gemini embeddings

## 🛠️ Tech Stack

### Core Technologies
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS 3**: Utility-first CSS framework
- **Recharts**: Composable charting library built on React and D3

### Data & Parsing
- **PapaParse**: Fast CSV parsing library
- **date-fns**: Modern date utility library for date manipulation

### UI Components & Styling
- **shadcn/ui**: High-quality component library (buttons, inputs, cards, dialog, table primitives)
- **TanStack Virtual**: Efficient virtualization for large lists
- **react-day-picker**: Accessible date picker component
- **react-markdown**: Markdown rendering for AI insights
- **class-variance-authority**: For component variants
- **clsx & tailwind-merge**: Utility functions for className management

### AI Integration
- **Google Gemini API**: AI-powered viewing insights using `@google/generative-ai` SDK (gemini-2.5-flash-lite model)
- **Real-time Streaming**: AI insights stream in real-time as they're generated, providing immediate feedback
- **react-markdown**: Markdown rendering for AI-generated insights with proper formatting
- **RAG System**: Retrieval-Augmented Generation for smart search using:
  - **ChromaDB Cloud**: Vector database for storing embeddings
  - **Google Gemini Embeddings**: For generating vector embeddings from viewing history
  - **Semantic Search**: Natural language queries with context-aware responses
- **Note**: ChatGPT integration is temporarily disabled

### Development Tools
- **ESLint**: Code linting with standard configuration
- **PostCSS & Autoprefixer**: CSS processing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)

### Setup

1. **Clone the repository** (or download the project):
   ```bash
   git clone <repository-url>
   cd netflix-analytics-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Add your data files**:
   - Place your CSV files in `public/data/`:
     - `NetflixViewingHistory_1.csv` through `NetflixViewingHistory_5.csv` for individual profiles
     - `NetflixViewingHistory.csv` (optional, for merged data)
   - The CSV should have columns: `Title` and `Date`
   - Date format: `M/D/YY` or `MM/DD/YY` (US-style dates)

4. **Configure API Keys (Optional - for AI Insights and RAG Smart Search)**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your API keys to `.env`:
     - `VITE_GEMINI_API_KEY`: Your Google Gemini API key for AI insights and embeddings
     - `CHROMA_API_KEY`: Your ChromaDB Cloud API key (required for RAG smart search)
     - `CHROMA_TENANT`: Your ChromaDB Cloud tenant ID
     - `CHROMA_DATABASE`: Your ChromaDB Cloud database name
     - `VITE_RAG_API_URL`: Backend API URL (default: `http://localhost:3001/api`)
     - **Note**: ChatGPT integration is temporarily disabled. Only Gemini is currently available.
   - **Note**: AI insights are optional. The dashboard works without API keys, but AI-powered insights and smart search won't be available.

5. **Set up Backend Server (Required for RAG Smart Search)**:
   - Navigate to the server directory:
     ```bash
     cd server
     ```
   - Install backend dependencies:
     ```bash
     npm install
     ```
   - Make sure your `.env` file in the root directory has ChromaDB credentials configured
   - Start the backend server:
     ```bash
     npm start
     # Or for development with auto-reload:
     npm run dev
     ```
   - The backend will run on `http://localhost:3001` by default

6. **Index Your Data (Required for RAG Smart Search)**:
   - Once the backend is running, index your viewing history data:
     ```bash
     # From the root directory
     curl -X POST http://localhost:3001/api/index -H "Content-Type: application/json" -d '{"clear": true}'
     ```
   - Or use the API directly from your frontend after starting the backend
   - This will:
     - Load all CSV files from `public/data/`
     - Generate embeddings using Google Gemini
     - Store vectors in ChromaDB Cloud
     - This process may take a few minutes depending on data size

7. **Start the frontend development server** (in a new terminal, from root directory):
   ```bash
   npm run dev
   ```

8. **Open your browser**:
   - Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## 🚀 Deployment

### Netlify Deployment

The project is configured for easy deployment on Netlify:

1. **Automatic Configuration**:
   - `netlify.toml` is configured with:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: 18

2. **Manual Deployment Steps**:
   ```bash
   # Build the project locally first to verify
   npm run build
   
   # The dist folder will be created with production files
   ```

3. **Netlify Settings** (if not using netlify.toml):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 (or use `.nvmrc` file)

4. **Environment Variables**:
   - For basic deployment: No environment variables required
   - For AI insights: Add `VITE_GEMINI_API_KEY` in Netlify's environment variables settings
   - **Note**: ChatGPT integration is temporarily disabled
   - Data files should be in `public/data/` directory (NetflixViewingHistory_1.csv through NetflixViewingHistory_5.csv)

5. **Troubleshooting Netlify Builds**:
   - Ensure `package.json` has the `build` script
   - Verify all dependencies are in `package.json` (not just devDependencies)
   - Check that `package-lock.json` is committed
   - Ensure Node version matches (18+)
   - Verify `netlify.toml` exists in the root directory

## 🚀 Usage

### Basic Operations

1. **Search**: Type in the search bar to filter titles in real-time
2. **Date Filtering**: 
   - Use quick filter buttons for common ranges
   - Or select custom start and end dates using the date pickers
3. **Chart Interaction**: Click on any slice in the donut chart to filter by that title
4. **Clear Filters**: Click the "Clear All" button to reset all filters
5. **Theme Toggle**: Click the sun/moon icon in the top-right to switch themes

### Data Visualization

- **Timeline Chart**: Shows viewing activity over time with automatic weekly grouping for large datasets
- **Top 10 Titles Bar Chart**: Horizontal bar chart showing most-watched titles
- **Day of Week Chart**: Bar chart showing viewing patterns by day
- **Monthly Chart**: Line chart showing trends over months
- **Composed Chart**: Combined bar and line chart with average calculation
- **Donut Chart**: Interactive pie chart showing top 20 titles with "Others" bucket

### Insights Dialog

- Launch directly from the header to open a comprehensive modal
- **AI-Powered Insights**: Generate personalized analysis using Google Gemini (ChatGPT temporarily disabled)
- **Real-time Streaming**: AI insights stream in real-time as they're generated, with a visual cursor indicator showing active streaming
- Displays comprehensive charts and visualizations:
  - Yearly viewing activity chart
  - Monthly viewing patterns
  - Day-of-week viewing patterns
  - Top shows/franchises table and bar chart
- AI-generated insights are rendered as markdown with proper formatting
- All rendered with shadcn/ui components and react-markdown

### RAG Smart Search

- **Natural Language Queries**: Ask questions in plain English about your viewing history
- **Toggle Smart Search**: Click the "Smart" button in the search bar to enable AI-powered search
- **Example Queries**:
  - "Tell me the Christmas trend, what are things watched?"
  - "What shows did I watch in December?"
  - "What are my most watched genres?"
  - "Show me viewing patterns on weekends"
- **Features**:
  - Semantic search using vector embeddings
  - Context-aware responses with source citations
  - Displays relevant viewing entries based on query
  - Markdown-formatted answers
- **Requirements**: 
  - Backend server must be running
  - Data must be indexed in ChromaDB Cloud
  - ChromaDB Cloud credentials must be configured

### State Persistence

All filter states are automatically saved:
- **localStorage**: Persists across browser sessions
- **URL Parameters**: Enables sharing filtered views via URL
- **Theme Preference**: Dark/light mode preference is saved

## 📁 Project Structure

```
netflix-analytics-ui/
├── public/
│   └── data/
│       ├── NetflixViewingHistory_1.csv  # Profile 1 viewing history
│       ├── NetflixViewingHistory_2.csv  # Profile 2 viewing history
│       ├── NetflixViewingHistory_3.csv  # Profile 3 viewing history
│       ├── NetflixViewingHistory_4.csv  # Profile 4 viewing history
│       ├── NetflixViewingHistory_5.csv  # Profile 5 viewing history
│       └── NetflixViewingHistory.csv    # Optional: merged data
├── server/                              # Backend API server
│   ├── index.js                         # Express server entry point
│   ├── package.json                     # Backend dependencies
│   ├── routes/
│   │   ├── embed.js                     # Embedding generation endpoints
│   │   ├── index.js                     # Data indexing endpoints
│   │   └── search.js                    # RAG search endpoints
│   ├── services/
│   │   ├── chromadbService.js           # ChromaDB Cloud integration
│   │   ├── embeddingService.js          # Gemini embedding generation
│   │   └── ragService.js                # RAG query processing
│   └── scripts/
│       └── indexData.js                 # Data indexing script
├── src/
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── button.jsx               # Button component
│   │   │   ├── card.jsx                 # Card component
│   │   │   ├── dialog.jsx               # Dialog/Modal component
│   │   │   ├── input.jsx                # Input component
│   │   │   └── table.jsx                # Table component primitives
│   │   ├── BarChart.jsx                 # Horizontal bar chart
│   │   ├── ComposedChart.jsx            # Bar + line chart
│   │   ├── DatePicker.jsx               # Date selection component
│   │   ├── DayOfWeekChart.jsx           # Day-of-week analysis
│   │   ├── Dialog.jsx                   # Dialog wrapper component
│   │   ├── Donut.jsx                    # Interactive donut chart
│   │   ├── Filters.jsx                  # Filter container
│   │   ├── InsightsDialog.jsx           # AI-powered insights dialog
│   │   ├── MonthlyChart.jsx             # Monthly trends
│   │   ├── MonthlyPatternChart.jsx      # Monthly pattern analysis
│   │   ├── ProfileSelector.jsx          # Profile filter component
│   │   ├── QuickFilters.jsx             # Quick date range buttons
│   │   ├── SearchBar.jsx                # Search input with debouncing and smart search toggle
│   │   ├── SmartSearch.jsx              # RAG smart search component
│   │   ├── Shimmer.jsx                  # Loading skeleton components
│   │   ├── Table.jsx                    # Virtualized data table
│   │   ├── ThemeToggle.jsx              # Dark/light theme switcher
│   │   ├── Timeline.jsx                 # Time series chart
│   │   └── YearlyChart.jsx              # Yearly viewing chart
│   ├── hooks/
│   │   ├── usePersistentState.js        # localStorage + URL sync hook
│   │   └── useTheme.js                  # Theme management hook
│   ├── lib/
│   │   ├── aiService.js                 # Gemini API integration (using @google/generative-ai SDK)
│   │   ├── date.js                      # Date parsing utilities
│   │   ├── ragService.js                # Frontend RAG API client
│   │   └── utils.js                     # Utility functions (cn helper)
│   ├── App.jsx                          # Main application component
│   ├── main.jsx                         # Application entry point
│   └── styles.css                       # Global styles + theme variables
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore file
├── index.html                           # HTML template
├── package.json                         # Dependencies and scripts
├── tailwind.config.js                   # Tailwind configuration
├── vite.config.js                       # Vite configuration
└── README.md                            # This file
```

## 🎨 Theme System

The application includes a comprehensive dark/light theme system:

### Theme Variables
- **Background**: Main page background color
- **Foreground**: Primary text color
- **Card**: Card background color
- **Border**: Border colors throughout
- **Muted**: Secondary backgrounds and text
- **Accent**: Interactive element colors
- **Primary/Secondary**: Button and emphasis colors

### Theme Implementation
- Uses CSS custom properties (CSS variables)
- Automatically detects system preference on first load
- Persists user choice in localStorage
- All components use theme-aware colors
- Smooth transitions between themes

### Customization
Edit `src/styles.css` to modify theme colors:
- Light theme: `:root` selector
- Dark theme: `.dark` selector

## ⚡ Performance Optimizations

### Virtualization
- **Table**: Uses TanStack Virtual to render only visible rows
- Handles thousands of rows efficiently
- Configurable overscan for smooth scrolling

### Memoization
- All computed data (filtered results, chart data) uses `useMemo`
- Prevents unnecessary recalculations on re-renders
- Optimized for large datasets

### Code Splitting
- Components are organized for potential code splitting
- Lazy loading can be easily added for charts

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Style
- ESLint with standard configuration
- Functional components with hooks
- Prop validation via JSDoc (TypeScript recommended for future)
- Consistent naming conventions

### Adding New Features

1. **New Chart Component**:
   - Create component in `src/components/`
   - Use Recharts for visualization
   - Accept `data` and `isLoading` props
   - Add shimmer loading state

2. **New Filter**:
   - Add to `Filters.jsx` or create new component
   - Use `usePersistentState` hook for persistence
   - Update URL sync in `App.jsx`

3. **New Theme Colors**:
   - Add CSS variables in `src/styles.css`
   - Update Tailwind config if needed
   - Use in components via Tailwind classes

## 📊 Data Format

### CSV Structure
Your CSV files should have:
- **Title**: Name of the show/movie
- **Date**: Viewing date in US format (`M/D/YY` or `MM/DD/YY`)

**File naming**:
- `NetflixViewingHistory_1.csv` through `NetflixViewingHistory_5.csv` for individual profiles
- The application automatically loads all profile files and adds a `Profile` column

Example:
```csv
Title,Date
"Stranger Things","11/15/19"
"The Crown","12/20/19"
```

### Date Parsing
- Automatically handles various US date formats
- Normalizes to `YYYY-MM-DD` for consistency
- Filters invalid dates automatically

## 🎯 Key Components

### App.jsx
Main application component that:
- Loads and parses CSV data
- Manages all filter states
- Computes derived data for charts
- Handles URL/localStorage synchronization
- Initializes theme system

### Table.jsx
High-performance virtualized table:
- Uses TanStack Virtual for rendering
- Handles large datasets efficiently
- Sticky header for easy reference
- Row highlighting on hover
- Responsive column widths

### Donut.jsx
Interactive donut chart:
- Shows top 20 titles + "Others" bucket
- Click slices to filter table
- Shows percentages in tooltips
- Color-coded legend
- Active state highlighting

### ThemeToggle.jsx
Theme switcher component:
- Fixed position in top-right
- Sun/moon icons
- Smooth transitions
- Persists preference

## 🔐 State Management

### Persistence Strategy
1. **localStorage**: Primary storage for filter states
2. **URL Parameters**: Secondary storage for sharing
3. **Hydration Order**:
   - On load: Check URL first, then localStorage
   - On change: Update both localStorage and URL

### State Flow
```
User Action → Component State → usePersistentState → localStorage + URL
                                                      ↓
                                              App State Update
                                                      ↓
                                              Memoized Computations
                                                      ↓
                                              Component Re-render
```

## 🐛 Troubleshooting

### Common Issues

1. **Data not loading**:
   - Check CSV file is in `public/data/`
   - Verify CSV has `Title` and `Date` columns
   - Check browser console for errors

2. **Theme not applying**:
   - Clear browser cache
   - Check localStorage for theme value
   - Verify `dark` class is on `<html>` element

3. **Table not rendering**:
   - Check data format
   - Verify TanStack Virtual is installed
   - Check browser console

4. **Performance issues**:
   - Reduce dataset size for testing
   - Check virtualization is working
   - Verify memoization is in place

## 🔍 RAG Smart Search Architecture

The RAG (Retrieval-Augmented Generation) system enables natural language queries over your viewing history:

### How It Works

1. **Data Indexing**:
   - CSV data is transformed into structured documents with metadata (title, date, profile, main title)
   - Each document is embedded using Google Gemini's embedding model
   - Vectors are stored in ChromaDB Cloud with associated metadata

2. **Query Processing**:
   - User's natural language query is embedded using the same model
   - Vector similarity search retrieves the most relevant viewing history entries
   - Retrieved context is passed to Gemini for answer generation

3. **Response Generation**:
   - Gemini generates a contextual answer based on retrieved documents
   - Sources are cited with titles, dates, and profiles
   - Relevant viewing entries are displayed in a table

### Backend API Endpoints

- `GET /api/health` - Health check
- `POST /api/embed` - Generate embedding for text
- `POST /api/embed/batch` - Generate embeddings for multiple texts
- `POST /api/index` - Index CSV data into ChromaDB
- `GET /api/index/status` - Get indexing status
- `POST /api/search` - Perform RAG query

### Configuration

Ensure your `.env` file contains:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
CHROMA_API_KEY=your_chromadb_api_key
CHROMA_TENANT=your_tenant_id
CHROMA_DATABASE=your_database_name
VITE_RAG_API_URL=http://localhost:3001/api
```

## 📝 Future Enhancements

Potential improvements:
- [ ] Export filtered data to CSV
- [ ] Additional chart types (heatmaps, scatter plots)
- [ ] Advanced filtering (genre, year, etc.)
- [ ] Data aggregation options
- [ ] Custom date range presets
- [ ] Chart export (PNG/PDF)
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Unit and integration tests
- [ ] TypeScript migration
- [ ] Streaming responses for RAG queries
- [ ] Query history and suggestions
- [ ] Advanced metadata filtering in RAG search

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code follows existing style
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- Netflix for providing the data format
- Recharts team for excellent charting library
- shadcn for beautiful UI components
- TanStack for virtualization library

---

**Built with ❤️ using React, Tailwind CSS, and modern web technologies**
