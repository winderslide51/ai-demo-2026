import type { ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import styles from './DataTable.module.css'

export type Column<Row> = {
  key: string
  header: ReactNode
  render: (row: Row) => ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
}

type Props<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  emptyMessage: string
  onRowClick?: (row: Row) => void
  rowLabel?: (row: Row) => string
  caption?: string
}

export function DataTable<Row>({ columns, rows, rowKey, emptyMessage, onRowClick, rowLabel, caption }: Props<Row>) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={styles[col.align ?? 'left']} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const clickable = Boolean(onRowClick)
            return (
              <tr
                key={rowKey(row)}
                className={clickable ? styles.clickable : undefined}
                onClick={clickable ? () => onRowClick?.(row) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick?.(row)
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
                role={clickable ? 'link' : undefined}
                aria-label={clickable && rowLabel ? rowLabel(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={styles[col.align ?? 'left']}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
