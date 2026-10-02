import { NavLink, Route, Routes } from 'react-router-dom'
import { BriefcaseBusiness, CircleUserRound, Compass, GraduationCap, LayoutDashboard, Network } from 'lucide-react'
import Dashboard from './pages/Dashboard.jsx'
import Marketplace from './pages/Marketplace.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import SkillGraph from './pages/SkillGraph.jsx'
import TalentSearch from './pages/TalentSearch.jsx'
import Upskilling from './pages/Upskilling.jsx'
import './workspace.css'

const navigation = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Talent Search', path: '/talent-search', icon: Compass },
  { label: 'Skill Graph', path: '/skill-graph', icon: Network },
  { label: 'Upskilling', path: '/upskilling', icon: GraduationCap },
  { label: 'Marketplace', path: '/marketplace', icon: BriefcaseBusiness },
]

const pageTitles = {
  '/talent-search': 'Talent Search',
}

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="HRM-03 home">
          <span className="brand-mark"><Network size={19} strokeWidth={2.5} /></span>
          <span className="brand-copy"><strong>HRM-03</strong><small>Talent Intelligence</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-card"><span className="workspace-dot" /><div><strong>Northstar Labs</strong><small>People team</small></div></div>
          <div className="profile-button"><span className="profile-avatar"><CircleUserRound size={19} /></span><span><strong>Olivia Parker</strong><small>People partner</small></span></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>HRM-03</strong></div>
          <div className="topbar-right"><span className="environment-tag">MVP workspace</span><span className="topbar-avatar">OP</span></div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/talent-search" element={<TalentSearch />} />
            <Route path="/skill-graph" element={<SkillGraph />} />
            <Route path="/upskilling" element={<Upskilling />} />
            <Route path="/marketplace" element={<Marketplace />} />
            {Object.entries(pageTitles).map(([path, title]) => <Route key={path} path={path} element={<PlaceholderPage title={title} />} />)}
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App