const relativeFormatter = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
const absoluteFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/**
 * "à l'instant", "il y a 5 minutes", "hier", "il y a 3 jours", then an absolute date past a week
 * ("il y a 143 jours" is not a useful landmark). `now` is injectable so tests stay deterministic.
 */
export function formatRelativeDate(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // a client clock running behind the server must not produce "dans 3 secondes"
  if (seconds < MINUTE) return "à l'instant"
  if (seconds < HOUR) return relativeFormatter.format(-Math.floor(seconds / MINUTE), 'minute')
  if (seconds < DAY) return relativeFormatter.format(-Math.floor(seconds / HOUR), 'hour')
  if (seconds < WEEK) return relativeFormatter.format(-Math.floor(seconds / DAY), 'day')
  return absoluteFormatter.format(date)
}
