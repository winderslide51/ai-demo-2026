import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate, formatJour, formatKva, formatKw } from '../../format'
import { labels } from '../../labels'
import type { Journalier } from '../../types/dto'
import { axisStyle, chartColors, tooltipLabelStyle, tooltipStyle } from './chartTheme'

type Props = { journalier: Journalier[]; puissanceSouscriteKva: number }

export function PuissanceChart({ journalier, puissanceSouscriteKva }: Props) {
  const data = journalier.map((j) => ({ ...j, jour: formatJour(j.date) }))
  const maxValue = Math.max(puissanceSouscriteKva, ...journalier.map((j) => j.puissanceMaxKw))
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke={chartColors.line()} />
          <XAxis dataKey="jour" tick={axisStyle} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} domain={[0, Math.ceil(maxValue * 1.1)]} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value: number) => [formatKw(value), labels.puissanceMax]}
            labelFormatter={(_label, payload) => {
              const item = payload?.[0]?.payload as Journalier | undefined
              return item ? formatDate(item.date) : ''
            }}
          />
          <ReferenceLine
            y={puissanceSouscriteKva}
            stroke={chartColors.overage()}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{ value: `${labels.puissanceSouscrite} : ${formatKva(puissanceSouscriteKva)}`, position: 'insideTopRight', fill: chartColors.overage(), fontSize: 11, fontFamily: axisStyle.fontFamily }}
          />
          <Line type="monotone" dataKey="puissanceMaxKw" stroke={chartColors.ink()} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
