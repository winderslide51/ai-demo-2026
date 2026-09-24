import { formatRelativeDate } from './relativeDate'

const now = new Date('2026-09-22T12:00:00Z')

function ago(seconds: number) {
  return new Date(now.getTime() - seconds * 1000).toISOString()
}

test.each([
  [10, "à l'instant"],
  [59, "à l'instant"],
  [5 * 60, 'il y a 5 minutes'],
  [3 * 3600, 'il y a 3 heures'],
  [26 * 3600, 'hier'],
  [2 * 86400, 'avant-hier'],
  [3 * 86400, 'il y a 3 jours'],
])('%i seconds ago → "%s"', (seconds, expected) => {
  expect(formatRelativeDate(ago(seconds), now)).toBe(expected)
})

test('falls back to an absolute French date past a week', () => {
  expect(formatRelativeDate('2026-08-23T12:00:00Z', now)).toBe('23 août 2026')
})

test('a date in the future reads as "à l\'instant"', () => {
  expect(formatRelativeDate('2026-09-22T12:00:30Z', now)).toBe("à l'instant")
})
