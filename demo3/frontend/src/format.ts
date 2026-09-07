const integer = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const eurosPrecis = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})
const moisLong = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const moisCourt = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dateHeure = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const jourCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' })

export function formatNombre(value: number): string {
  return integer.format(value)
}

export function formatKwh(value: number): string {
  return `${integer.format(value)} kWh`
}

export function formatMwh(kwh: number): string {
  return `${oneDecimal.format(kwh / 1000)} MWh`
}

export function formatKw(value: number): string {
  return `${integer.format(value)} kW`
}

export function formatKva(value: number): string {
  return `${integer.format(value)} kVA`
}

export function formatEuros(value: number): string {
  return euros.format(value)
}

/** Unit prices keep up to 4 decimals (0,1842 €). */
export function formatPrixUnitaire(value: number): string {
  return eurosPrecis.format(value)
}

export function formatPct(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const fixed = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value))
  return `${sign}${fixed} %`
}

export function formatTaux(value: number): string {
  return `${integer.format(value * 100)} %`
}

function parseMois(mois: string): Date {
  const [year, month] = mois.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

/** "2026-08" → "août 2026" */
export function formatMois(mois: string): string {
  return moisLong.format(parseMois(mois))
}

/** "2026-08" → "août" */
export function formatMoisCourt(mois: string): string {
  return moisCourt.format(parseMois(mois)).replace('.', '')
}

function parseDate(value: string): Date {
  // Date-only strings are parsed as UTC by the platform; anchor them to local midday instead.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day, 12)
  }
  return new Date(value)
}

/** "2026-08-03" → "03/08/2026" */
export function formatDate(value: string): string {
  return dateCourte.format(parseDate(value))
}

/** "2026-08-03T14:00:00+02:00" → "03/08/2026 14:00" */
export function formatDateHeure(value: string): string {
  return dateHeure.format(parseDate(value))
}

/** "2026-08-03" → "3" — for chart axes */
export function formatJour(value: string): string {
  return jourCourt.format(parseDate(value))
}

/** 14 → "14 h" */
export function formatHeure(heure: number): string {
  return `${heure} h`
}
