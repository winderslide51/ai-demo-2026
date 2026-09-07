import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes, useLocation, useRoutes } from 'react-router'
import { routes } from '../routes'

/** Render a page element at `path`, inside a MemoryRouter (no AppShell). */
export function renderWithRouter(ui: ReactNode, { path = '/', route = '/' }: { path?: string; route?: string } = {}) {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>,
    ),
  }
}

function AppRoutes() {
  return useRoutes(routes)
}

/** Exposes the current URL to tests, as `data-testid="location"`. */
function LocationSpy() {
  const { pathname, search } = useLocation()
  return <div data-testid="location" hidden>{`${pathname}${search}`}</div>
}

/** Render the whole application routing (AppShell + pages) at `route`. */
export function renderApp(route = '/') {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
        <LocationSpy />
      </MemoryRouter>,
    ),
  }
}
