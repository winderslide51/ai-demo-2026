import type { RouteObject } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { AlertesPage } from './pages/AlertesPage'
import { ContratPage } from './pages/ContratPage'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SiteDetailPage } from './pages/SiteDetailPage'
import { SitesPage } from './pages/SitesPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'sites', element: <SitesPage /> },
      { path: 'sites/:id', element: <SiteDetailPage /> },
      { path: 'alertes', element: <AlertesPage /> },
      { path: 'contrat', element: <ContratPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
