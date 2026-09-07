import type { CSSProperties } from 'react'

// Colours are read from the CSS tokens at render time so charts follow the design system.
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export const chartColors = {
  hp: () => token('--hp', '#e8962e'),
  hc: () => token('--hc', '#178f83'),
  ink: () => token('--ink-700', '#1c2f55'),
  overage: () => token('--overage', '#d4434b'),
  line: () => token('--line', '#e3dfd5'),
  faint: () => token('--text-faint', '#8a93a1'),
}

export const axisStyle = {
  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
  fontSize: 11,
  fill: '#8a93a1',
}

export const tooltipStyle: CSSProperties = {
  background: '#0b1730',
  color: '#f7f5f0',
  border: 'none',
  borderRadius: 6,
  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
  fontSize: 12,
  boxShadow: '0 8px 24px -12px rgb(11 23 48 / 40%)',
}

export const tooltipLabelStyle: CSSProperties = { color: '#c8f04d', fontWeight: 500, marginBottom: 4 }
