import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { cloneElement, isValidElement, type ReactNode } from 'react'

afterEach(cleanup)

// Recharts measures its container with ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

// ResponsiveContainer never gets a size in jsdom: give the chart a fixed one instead.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>
        {isValidElement(children) ? cloneElement(children as React.ReactElement<{ width?: number; height?: number }>, { width: 800, height: 300 }) : children}
      </div>
    ),
  }
})
