import { NavLink } from 'react-router-dom'
import { BarChart2, Database, LayoutDashboard, Telescope } from 'lucide-react'
import { useDataStore } from '../../stores/dataStore'

const NAV = [
  { to: '/explore',   icon: BarChart2,       label: 'Explorer'  },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/connect',   icon: Database,        label: 'Connect'   },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const { datasetName } = useDataStore()
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo"><Telescope size={22} strokeWidth={1.5} /><span>DataLens</span></div>
        {datasetName && <div style={{margin:'0 0.75rem 0.75rem',padding:'8px 10px',background:'var(--bg3)',borderRadius:'var(--radius)',border:'0.5px solid var(--border)'}}><span style={{display:'block',fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>Active dataset</span><span style={{display:'block',fontSize:12,fontFamily:'var(--mono)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{datasetName}</span></div>}
        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => 'nav-item ' + (isActive ? 'active' : '')}>
              <Icon size={16} strokeWidth={1.5} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="https://github.com/lrbudreau/data-lens" target="_blank" rel="noreferrer" className="sidebar-gh-link">Star on GitHub</a>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}