# Netflix Viewing Explorer (React + Tailwind + Recharts)

A small assignment project that renders an interactive UI with:
- Search filter
- Date range filters
- Donut chart (Recharts) that filters the table on slice click
- Filters persist across refresh via `localStorage` and are mirrored to the URL for shareability

Data: `public/data/NetflixViewingHistory.csv` (copied from the provided sample).

## Tech
- React 18 (Vite)
- Tailwind CSS 3
- Recharts
- PapaParse (CSV parsing)
- ESLint

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## How persistence works
- We store `search`, `activeTitle`, `startDate`, `endDate` in `localStorage` using a `usePersistentState` hook.
- On first load, if the URL has any of these params, we hydrate from URL; otherwise we seed URL from localStorage.
- On every change, we mirror values back to the URL (without reloading) for easy sharing.

## Chart interaction
- The donut shows "Top 7" titles in current results plus an "Others" bucket.
- Clicking a slice toggles a title filter (ignored for "Others").
- The table updates immediately based on search + date + active slice.

## Clean code choices
- Small, focused components (`SearchBar`, `Filters`, `Donut`, `Table`).
- Utilities in `src/lib` and hooks in `src/hooks`.
- Linting with sensible rules; prop-types disabled (using JSDoc/TypeScript would be the next step).
- No global state library; local state + derived memoized values keeps it simple.

## Replace data (optional)
- Drop a different `NetflixViewingHistory.csv` in `public/data/` with two columns: `Title, Date` where `Date` is in `M/D/YY` or `MM/DD/YY` format.

## Suggested folder structure
```
src/
  components/
  hooks/
  lib/
  App.jsx
  main.jsx
public/
  data/NetflixViewingHistory.csv
```

## Share a GitHub repository
1. Create a new repo on GitHub (public is fine).
2. Run:
   ```bash
   git init
   git add .
   git commit -m "feat: netflix viewing explorer assignment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

---

_Notes:_
- The UI is intentionally minimal and clean.
- If needed, you can extend the donut to group by day-of-week or month; just change the aggregation in `topTitles`.
- Date parsing assumes US-style dates as found in Netflix downloads.
