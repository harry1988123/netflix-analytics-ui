export function parseUSDate(str) {
  // Netflix CSV uses M/D/YY or MM/DD/YY; normalize to YYYY-MM-DD
  const [m, d, y] = str.split('/').map(Number)
  const year = y < 100 ? 2000 + y : y
  const dt = new Date(year, m - 1, d)
  return dt
}

export function formatYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
