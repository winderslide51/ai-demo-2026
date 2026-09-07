type Props = {
  values: number[]
  tone?: 'ink' | 'hp' | 'hc' | 'overage'
  width?: number
  height?: number
  label?: string
}

const colors = {
  ink: 'var(--ink-700)',
  hp: 'var(--hp)',
  hc: 'var(--hc)',
  overage: 'var(--overage)',
}

export function Sparkline({ values, tone = 'ink', width = 96, height = 28, label }: Props) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = width / (values.length - 1)
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - 3 - ((v - min) / span) * (height - 6)
    return [x, y] as const
  })
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = points[points.length - 1]
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path d={path} fill="none" stroke={colors[tone]} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={colors[tone]} />
    </svg>
  )
}
