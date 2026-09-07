import { matchPath, NavLink, Outlet, useLocation } from 'react-router'
import { useMoisParam } from '../../hooks/useMoisParam'
import { useAlertes, useClient, useMois } from '../../hooks/useResources'
import { labels } from '../../labels'
import { MonthPicker } from '../ui/MonthPicker'
import styles from './AppShell.module.css'

const pageTitles: { pattern: string; title: string }[] = [
  { pattern: '/', title: labels.pageTableauDeBord },
  { pattern: '/sites', title: labels.pageSites },
  { pattern: '/sites/:id', title: labels.pageSite },
  { pattern: '/alertes', title: labels.pageAlertes },
  { pattern: '/contrat', title: labels.pageContrat },
]

function titleFor(pathname: string): string {
  return pageTitles.find((p) => matchPath({ path: p.pattern, end: true }, pathname))?.title ?? labels.pageIntrouvable
}

const navItems = [
  { to: '/', label: labels.navTableauDeBord, icon: DashboardIcon, end: true },
  { to: '/sites', label: labels.navSites, icon: SitesIcon, end: false },
  { to: '/alertes', label: labels.navAlertes, icon: AlertIcon, end: false },
  { to: '/contrat', label: labels.navContrat, icon: ContractIcon, end: false },
]

export function AppShell() {
  const [mois, setMois] = useMoisParam()
  const { pathname, search } = useLocation()
  const client = useClient()
  const moisDisponibles = useMois()
  const alertes = useAlertes({ mois, acquittee: false })

  const pageTitle = titleFor(pathname)
  const nbAlertes = alertes.data?.length ?? 0
  const moisCourant = mois ?? moisDisponibles.data?.moisParDefaut ?? ''

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <BoltIcon />
          <div>
            <p className={styles.brandName}>{labels.appName}</p>
            <p className={styles.brandTagline}>{labels.appTagline}</p>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Navigation principale">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={{ pathname: to, search }}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <Icon />
              <span>{label}</span>
              {to === '/alertes' && nbAlertes > 0 && (
                <span className={styles.navCount} aria-label={`${nbAlertes} ${labels.alertesActives}`}>
                  {nbAlertes}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <footer className={styles.sidebarFooter}>
          {client.data && (
            <>
              <p className={styles.clientName}>{client.data.nom}</p>
              <p className={styles.clientRef}>{client.data.contrat.reference}</p>
            </>
          )}
        </footer>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.topbarRight}>
            <span className={`${styles.alertPill} ${nbAlertes > 0 ? styles.alertPillActive : ''}`} role="status">
              <span className={styles.alertDot} aria-hidden="true" />
              {nbAlertes} {nbAlertes === 1 ? labels.alerteActive : labels.alertesActives}
            </span>
            {moisDisponibles.data && moisCourant && (
              <MonthPicker value={moisCourant} options={moisDisponibles.data.mois} onChange={setMois} />
            )}
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function BoltIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" className={styles.bolt}>
      <rect width="32" height="32" rx="8" fill="var(--ink-700)" />
      <path d="M18 4 8 18h7l-1 10 10-14h-7z" fill="var(--lime)" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity=".55" />
      <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity=".55" />
      <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function SitesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2 16V7l5-3v4l5-3v11H2z" fill="currentColor" />
      <path d="M12 16V9h4v7h-4z" fill="currentColor" opacity=".55" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M9 2 16.5 15h-15L9 2z" fill="currentColor" />
      <path d="M9 7v4M9 12.5v1" stroke="var(--ink-900)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ContractIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 2h7l3 3v11H4V2z" fill="currentColor" />
      <path d="M6.5 8h5M6.5 11h5M6.5 14h3" stroke="var(--ink-900)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
