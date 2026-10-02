import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Compass,
  GraduationCap,
  Layers3,
  Network,
  Plus,
  Sparkles,
  UserCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ApiStatus from '../components/ApiStatus.jsx'
import { dashboardStats } from '../data/dashboardStats.js'
import { useHealthStatus } from '../hooks/useHealthStatus.js'
import { getEmployees, getProjects, getRoles, getSkills, searchTalent } from '../services/api.js'
import '../styles/dashboard.css'

const ACTIVITY = [
  { icon: UserPlus, title: 'New employee profile added', detail: 'Ananya Sharma · Applied AI', time: 'Today', tone: 'mint' },
  { icon: UserCheck, title: 'Candidate became available', detail: 'Meera Iyer · Data Analyst', time: 'Today', tone: 'blue' },
  { icon: Layers3, title: 'Project added to the portfolio', detail: 'Customer Analytics Platform', time: 'Yesterday', tone: 'blue' },
  { icon: CheckCircle2, title: 'Skill gap identified', detail: 'AWS · AI Engineer role', time: '2 days ago', tone: 'yellow' },
  { icon: GraduationCap, title: 'Learning path suggested', detail: 'Cloud Architecture Foundations', time: '2 days ago', tone: 'purple' },
  { icon: BriefcaseBusiness, title: 'New target role added', detail: 'AI Engineer · Applied AI', time: '3 days ago', tone: 'mint' },
]

const QUICK_ACTIONS = [
  { label: 'Find Talent', detail: 'Search internal candidates', to: '/talent-search', icon: Compass, tone: 'mint' },
  { label: 'Explore Skill Graph', detail: 'See connected capabilities', to: '/skill-graph', icon: Network, tone: 'blue' },
  { label: 'Create Learning Path', detail: 'Close a team skill gap', to: '/upskilling', icon: GraduationCap, tone: 'yellow' },
  { label: 'Explore Marketplace', detail: 'Browse internal roles', to: '/marketplace', icon: BriefcaseBusiness, tone: 'purple' },
]

function Dashboard() {
  const apiStatus = useHealthStatus()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([
      getEmployees(),
      getSkills(),
      getRoles(),
      getProjects(),
      searchTalent({ role: 'AI Engineer', skills: ['Python', 'Machine Learning'], minimum_experience: 1 }),
    ])
      .then(([employeeResponse, skillResponse, roleResponse, projectResponse, talentResponse]) => {
        if (!active) return
        setData({
          employees: employeeResponse.data.employees,
          skills: skillResponse.data.skills,
          roles: roleResponse.data.roles,
          projects: projectResponse.data.projects,
          candidates: talentResponse.data.candidates,
        })
      })
      .catch(() => { if (active) setError('Dashboard data could not be loaded. Check the backend connection and try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const employees = data?.employees ?? []
  const skills = data?.skills ?? []
  const roles = data?.roles ?? []
  const projects = data?.projects ?? []
  const candidates = (data?.candidates ?? []).slice(0, 4)
  const availableEmployees = employees.filter((employee) => employee.availability === 'Available')
  const activeProjects = projects.filter((project) => ['active', 'in progress'].includes(project.status.toLowerCase()))
  const metrics = {
    employees: employees.length,
    available: availableEmployees.length,
    skills: skills.length,
    projects: activeProjects.length,
    roles: roles.length,
  }

  const commonSkills = getCommonSkills(employees).slice(0, 5)
  const inDemandSkills = getInDemandSkills(roles).slice(0, 5)
  const highestCoverage = [...employees]
    .sort((first, second) => second.skills.length - first.skills.length || first.name.localeCompare(second.name))
    .slice(0, 3)
  const topGaps = getTopSkillGaps(employees, roles).slice(0, 5)

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <div className="eyebrow">PEOPLE INTELLIGENCE</div>
          <h1>HRM-03 <span className="heading-divider">/</span> Overview</h1>
          <p className="dashboard-subtitle">See the skills, experience and opportunities already inside your team.</p>
        </div>
        <ApiStatus status={apiStatus} />
      </div>

      {error && <div className="dashboard-error" role="alert"><CircleAlert size={16} />{error}</div>}

      <section className="dashboard-kpis" aria-label="HR intelligence key metrics">
        {dashboardStats.map(({ label, key, icon: Icon, tone, note }) => (
          <article className="dashboard-kpi" key={key}>
            <div className="dashboard-kpi-top"><span className="dashboard-kpi-label">{label}</span><span className={`dashboard-kpi-icon ${tone}`}><Icon size={17} /></span></div>
            <div className="dashboard-kpi-value">{loading ? '—' : metrics[key]}</div>
            <div className="dashboard-kpi-note">{note}</div>
          </article>
        ))}
      </section>

      <section className="intelligence-section">
        <div className="dashboard-section-heading">
          <div><div className="dashboard-section-eyebrow">YOUR WORKFORCE, CONNECTED</div><h2>Talent Intelligence</h2></div>
          <span className="live-data-label"><span />Live workforce data</span>
        </div>
        <div className="intelligence-grid">
          <article className="dashboard-panel skill-panel">
            <PanelHeading icon={Sparkles} title="Most common skills" detail="People with each skill" />
            <SkillBars items={commonSkills.map((item) => ({ label: item.name, value: item.people, total: employees.length, suffix: `${item.people} people` }))} loading={loading} empty="Skill data will appear once profiles are loaded." />
            <div className="panel-footnote">Based on employee skill profiles</div>
          </article>

          <article className="dashboard-panel demand-panel">
            <PanelHeading icon={Activity} title="Most in-demand skills" detail="Across open target roles" />
            <SkillBars items={inDemandSkills.map((item) => ({ label: item.name, value: item.roles, total: inDemandSkills[0]?.roles ?? 1, suffix: `${item.roles} ${item.roles === 1 ? 'role' : 'roles'}` }))} loading={loading} empty="No role requirements available." />
            <div className="panel-footnote">Demand is counted from role skill requirements</div>
          </article>

          <article className="dashboard-panel coverage-panel">
            <PanelHeading icon={UserCheck} title="Highest skill coverage" detail="Broadest profiles on the team" />
            <div className="coverage-list">
              {highestCoverage.map((employee) => {
                const percent = skills.length ? Math.round(employee.skills.length / skills.length * 100) : 0
                return (
                  <div className="coverage-person" key={employee.id}>
                    <Initials name={employee.name} />
                    <div className="coverage-person-info"><strong>{employee.name}</strong><span>{employee.current_role}</span><div className="coverage-track"><i style={{ width: `${percent}%` }} /></div></div>
                    <span className="coverage-count">{employee.skills.length}<small> skills</small></span>
                  </div>
                )
              })}
              {!loading && !highestCoverage.length && <EmptyLine text="No employee profiles yet." />}
            </div>
            <div className="panel-footnote">Profile coverage across {skills.length || '—'} unique skills</div>
          </article>

          <article className="dashboard-panel available-panel">
            <PanelHeading icon={UsersRound} title="Available talent" detail={`${availableEmployees.length} people ready for work`} />
            <div className="available-list">
              {availableEmployees.slice(0, 4).map((employee) => (
                <div className="available-person" key={employee.id}>
                  <Initials name={employee.name} />
                  <div><strong>{employee.name}</strong><span>{employee.current_role}</span></div>
                  <span className="available-indicator">Available</span>
                </div>
              ))}
              {!loading && !availableEmployees.length && <EmptyLine text="No available employees right now." />}
            </div>
            <Link to="/talent-search" className="panel-text-link">Browse all talent <ArrowRight size={14} /></Link>
          </article>
        </div>
      </section>

      <section className="dashboard-lower-grid">
        <div className="recommended-section">
          <div className="dashboard-section-heading compact-heading">
            <div><div className="dashboard-section-eyebrow">AI ENGINEER · DEFAULT ROLE</div><h2>Recommended Talent</h2></div>
            <Link to="/talent-search" className="section-action">View search <ArrowUpRight size={14} /></Link>
          </div>
          <div className="recommended-list">
            {candidates.map((candidate, index) => <RecommendedCard key={candidate.employee_id} candidate={candidate} rank={index + 1} onClick={() => setProfile(candidate)} />)}
            {!loading && !candidates.length && <EmptyPanel text="No candidates matched the example role." />}
            {loading && <div className="recommended-loading">Finding evidence-backed matches...</div>}
          </div>
        </div>

        <aside className="dashboard-side-column">
          <article className="dashboard-panel gaps-panel">
            <PanelHeading icon={CircleAlert} title="Top Skill Gaps" detail="Skills missing across target roles" />
            <div className="gap-list">
              {topGaps.map((item) => (
                <div className="gap-item" key={item.name}>
                  <div className="gap-label-row"><strong>{item.name}</strong><span>{item.gap}%</span></div>
                  <div className="gap-track"><i style={{ width: `${item.gap}%` }} /></div>
                  <small>{item.roleCount} {item.roleCount === 1 ? 'role' : 'roles'} require this skill</small>
                </div>
              ))}
              {!loading && !topGaps.length && <EmptyLine text="No target-role skill gaps found." />}
            </div>
            <Link to="/upskilling" className="panel-text-link">Explore upskilling <ArrowRight size={14} /></Link>
          </article>

          <article className="dashboard-panel activity-panel">
            <PanelHeading icon={Activity} title="Recent activity" detail="Sample workforce updates" />
            <div className="activity-list">
              {ACTIVITY.map(({ icon: Icon, title, detail, time, tone }) => (
                <div className="activity-item" key={title}>
                  <span className={`activity-icon ${tone}`}><Icon size={14} /></span>
                  <div className="activity-copy"><strong>{title}</strong><span>{detail}</span></div>
                  <time>{time}</time>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="quick-actions-section">
        <div className="dashboard-section-heading compact-heading"><div><div className="dashboard-section-eyebrow">KEEP MOVING</div><h2>Quick actions</h2></div></div>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map(({ label, detail, to, icon: Icon, tone }) => (
            <Link to={to} className="quick-action" key={to}><span className={`quick-action-icon ${tone}`}><Icon size={17} /></span><span className="quick-action-copy"><strong>{label}</strong><small>{detail}</small></span><ArrowUpRight size={15} className="quick-action-arrow" /></Link>
          ))}
        </div>
      </section>

      {profile && <DashboardCandidateModal candidate={profile} onClose={() => setProfile(null)} />}
    </div>
  )
}

function PanelHeading({ icon: Icon, title, detail }) {
  return <div className="panel-heading"><span className="panel-heading-icon"><Icon size={15} /></span><div><h3>{title}</h3><p>{detail}</p></div></div>
}

function SkillBars({ items, loading, empty }) {
  if (loading) return <div className="bars-skeleton"><i /><i /><i /><i /></div>
  if (!items.length) return <EmptyLine text={empty} />
  const maximum = Math.max(1, ...items.map((item) => item.total))
  return <div className="skill-bars">{items.map((item) => <div className="skill-bar-row" key={item.label}><div className="skill-bar-top"><span>{item.label}</span><small>{item.suffix}</small></div><div className="skill-bar-track"><i style={{ width: `${Math.max(5, item.value / maximum * 100)}%` }} /></div></div>)}</div>
}

function RecommendedCard({ candidate, rank, onClick }) {
  const topSkills = candidate.matched_skills.slice(0, 3)
  return (
    <button type="button" className="recommended-card" onClick={onClick}>
      <span className="recommended-rank">{String(rank).padStart(2, '0')}</span>
      <Initials name={candidate.name} />
      <span className="recommended-info"><strong>{candidate.name}</strong><small>{candidate.current_role} · {candidate.experience_years} yrs</small><span className="recommended-skills">{topSkills.map((skill) => <i key={skill.name}>{skill.name}</i>)}</span></span>
      <span className="recommended-match"><strong>{candidate.match_percentage}%</strong><small>MATCH</small></span>
      <ArrowUpRight size={14} className="recommended-arrow" />
    </button>
  )
}

function Initials({ name }) {
  return <span className="dashboard-initials" aria-hidden="true">{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
}

function EmptyLine({ text }) {
  return <p className="dashboard-empty-line">{text}</p>
}

function EmptyPanel({ text }) {
  return <div className="dashboard-empty-panel"><Plus size={16} /><span>{text}</span></div>
}

function DashboardCandidateModal({ candidate, onClose }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="dashboard-candidate-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-profile-name">
        <button type="button" className="dashboard-modal-close" onClick={onClose} aria-label="Close candidate details">×</button>
        <div className="dashboard-profile-top"><Initials name={candidate.name} /><div><span className="dashboard-section-eyebrow">RECOMMENDED TALENT</span><h2 id="dashboard-profile-name">{candidate.name}</h2><p>{candidate.current_role} · {candidate.department}</p></div><strong className="dashboard-profile-score">{candidate.match_percentage}%<small>MATCH</small></strong></div>
        <div className="dashboard-profile-meta"><span>{candidate.experience_years} years experience</span><span>{candidate.location}</span><span>{candidate.availability}</span></div>
        <p className="dashboard-profile-bio">{candidate.bio}</p>
        <div className="dashboard-profile-section"><h3>Skills</h3><div className="dashboard-profile-skills">{candidate.skills.map((skill) => <span key={skill.name} className={candidate.matched_skills.some((matched) => matched.name === skill.name) ? 'is-matched' : ''}>{skill.name}<small>{skill.proficiency}</small></span>)}</div></div>
        <div className="dashboard-profile-section"><h3>Relevant projects</h3>{candidate.relevant_projects.length ? <div className="dashboard-profile-projects">{candidate.relevant_projects.map((project) => <span key={project}><BriefcaseBusiness size={13} />{project}</span>)}</div> : <EmptyLine text="No directly relevant projects." />}</div>
        <div className="dashboard-profile-footer"><span>Skill gaps: {candidate.missing_skills.join(', ') || 'None'}</span><Link to="/talent-search" className="profile-search-link" onClick={onClose}>Open talent search <ArrowRight size={13} /></Link></div>
      </section>
    </div>
  )
}

function getCommonSkills(employees) {
  const counts = new Map()
  for (const employee of employees) {
    for (const skill of employee.skills) counts.set(skill.name, (counts.get(skill.name) ?? 0) + 1)
  }
  return [...counts].map(([name, people]) => ({ name, people })).sort((first, second) => second.people - first.people || first.name.localeCompare(second.name))
}

function getInDemandSkills(roles) {
  const counts = new Map()
  for (const role of roles) {
    for (const name of role.required_skills) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts].map(([name, roleCount]) => ({ name, roles: roleCount })).sort((first, second) => second.roles - first.roles || first.name.localeCompare(second.name))
}

function getTopSkillGaps(employees, roles) {
  if (!employees.length) return []
  const roleDemand = new Map()
  for (const role of roles) {
    for (const name of role.required_skills) roleDemand.set(name, (roleDemand.get(name) ?? 0) + 1)
  }
  return [...roleDemand].map(([name, roleCount]) => {
    const peopleWithSkill = employees.filter((employee) => employee.skills.some((skill) => skill.name === name)).length
    return { name, roleCount, gap: Math.round((employees.length - peopleWithSkill) / employees.length * 100) }
  }).sort((first, second) => second.gap - first.gap || second.roleCount - first.roleCount || first.name.localeCompare(second.name))
}

export default Dashboard