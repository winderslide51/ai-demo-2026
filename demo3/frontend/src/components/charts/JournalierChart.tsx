import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate, formatJour, formatKwh } from '../../format'
import { plageLabels } from '../../labels'
import type { Journalier } from '../../types/dto'
import { axisStyle, chartColors, tooltipLabelStyle, tooltipStyle } from './chartTheme'

type Props = { journalier: Journalier[] }

export function JournalierChart({ journalier }: Props) {
  const data = journalier.map((j) => ({ ...j, jour: formatJour(j.date) }))
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -8 }} barCategoryGap="25%">
          <CartesianGrid vertical={false} stroke={chartColors.line()} />
          <XAxis dataKey="jour" tick={axisStyle} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
          <Tooltip
            cursor={{ fill: 'rgb(11 23 48 / 5%)' }}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(value: number, name: string) => [formatKwh(value), name === 'hpKwh' ? plageLabels.HP : plageLabels.HC]}
            labelFormatter={(_label, payload) => {
              const item = payload?.[0]?.payload as Journalier | undefined
              return item ? formatDate(item.date) : ''
            }}
          />
          <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, fontFamily: axisStyle.fontFamily }} formatter={(value: string) => (value === 'hpKwh' ? plageLabels.HP : plageLabels.HC)} />
          <Bar dataKey="hcKwh" stackId="a" fill={chartColors.hc()} />
          <Bar dataKey="hpKwh" stackId="a" fill={chartColors.hp()} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
