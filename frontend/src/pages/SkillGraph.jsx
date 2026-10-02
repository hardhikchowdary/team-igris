import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleAlert,
  Layers3,
  MapPin,
  Network,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { getEmployees, getProjects, getRoles, getSkills } from '../services/api.js'
import '../styles/skill-graph.css'

const PROFICIENCY_PROGRESS = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
}

function normalizeSkill(name) {
  return name.trim().toLocaleLowerCase()
}

function SkillGraph() {
  const [data, setData] = useState(null)
  const [employeeId, setEmployeeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([getEmployees(), getSkills(), getProjects(), getRoles()])
      .then(([employeesResponse, skillsResponse, projectsResponse, rolesResponse]) => {
        if (!active) return
        const nextEmployees = employeesResponse.data.employees
        setData({
          employees: nextEmployees,
          skills: skillsResponse.data.skills,
          projects: projectsResponse.data.projects,
          roles: rolesResponse.data.roles,
        })
        setEmployeeId((currentId) => currentId || String(
          nextEmployees.find((employee) => employee.name === 'Ananya Sharma')?.id ?? nextEmployees[0]?.id ?? '',
        ))
        setError('')
      })
      .catch(() => { if (active) setError('Unable to load workforce relationships. Check the backend connection and retry.') })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [retryKey])

  const employees = data?.employees ?? []
  const employee = employees.find((item) => String(item.id) === employeeId)
  const projectsById = useMemo(() => new Map((data?.projects ?? []).map((project) => [project.id, project])), [data?.projects])
  const employeeSkills = employee?.skills ?? []
  const employeeSkillMap = new Map(employeeSkills.map((skill) => [normalizeSkill(skill.name), skill]))

  const employeeProjects = (employee?.projects ?? []).map((link) => ({
    ...link,
    project: projectsById.get(link.id),
  })).filter((link) => link.project)

  const relatedRoles = (data?.roles ?? []).map((role) => {
    const matchedSkills = role.required_skills.filter((name) => employeeSkillMap.has(normalizeSkill(name)))
    const missingSkills = role.required_skills.filter((name) => !employeeSkillMap.has(normalizeSkill(name)))
    return {
      ...role,
      matchedSkills,
      missingSkills,
      compatibility: role.required_skills.length
        ? Math.round(matchedSkills.length / role.required_skills.length * 100)
        : 0,
    }
  }).filter((role) => role.matchedSkills.length >= Math.min(2, role.required_skills.length))
    .sort((first, second) => second.compatibility - first.compatibility || first.title.localeCompare(second.title))

  const strongSkills = employeeSkills.filter((skill) => ['Advanced', 'Expert'].includes(skill.proficiency))
  const developingSkills = employeeSkills.filter((skill) => ['Beginner', 'Intermediate'].includes(skill.proficiency))

  return (
    <div className="skill-graph-page">
      <div className="skill-graph-heading">
        <div>
          <div className="eyebrow">WORKFORCE RELATIONSHIPS</div>
          <h1>Skill Graph</h1>
          <p className="skill-graph-subtitle">Explore how employee experience connects to projects and future roles.</p>
        </div>
        <div className="graph-heading-badge"><Network size={16} /><span>Talent relationship map</span></div>
      </div>

      {error && <div className="graph-error" role="alert"><CircleAlert size={17} /><span>{error}</span><button type="button" onClick={() => { setLoading(true); setRetryKey((key) => key + 1) }}>Retry</button></div>}

      <section className="graph-employee-toolbar">
        <div className="employee-selector-label"><span className="graph-section-index">01</span><span><strong>Select an employee</strong><small>Start with a person to map their relationships</small></span></div>
        <label className="employee-select-wrap"><span className="sr-only">Select employee</span><select value={employeeId} disabled={loading || !employees.length} onChange={(event) => setEmployeeId(event.target.value)}>
          {employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.current_role}</option>)}
        </select><ChevronDown size={16} /></label>
      </section>

      {loading ? <GraphLoading /> : employee ? (
        <>
          <section className="employee-profile-strip">
            <div className="graph-profile-avatar"><UserRound size={21} /></div>
            <div className="graph-profile-main"><div className="graph-profile-name-row"><h2>{employee.name}</h2><span className={`graph-availability${employee.availability === 'Available' ? ' available' : ''}`}><i />{employee.availability}</span></div><p>{employee.current_role} <span>·</span> {employee.department}</p></div>
            <div className="graph-profile-details"><span><Sparkles size={14} />{employee.experience_years} years experience</span><span><MapPin size={14} />{employee.location}</span></div>
          </section>

          <section className="graph-summary-grid" aria-label="Skill coverage summary">
            <SummaryCard label="Total skills" value={employeeSkills.length} note={`of ${data.skills.length} in workspace`} icon={Sparkles} tone="mint" />
            <SummaryCard label="Strong skills" value={strongSkills.length} note="Advanced or expert" icon={Check} tone="green" />
            <SummaryCard label="In development" value={developingSkills.length} note="Beginner or intermediate" icon={Layers3} tone="yellow" />
            <SummaryCard label="Related projects" value={employeeProjects.length} note="With contribution evidence" icon={BriefcaseBusiness} tone="blue" />
            <SummaryCard label="Potential roles" value={relatedRoles.length} note="At least 2 skills matched" icon={UsersRound} tone="purple" />
          </section>

          <section className="relationship-section">
            <div className="graph-section-heading">
              <div><div className="graph-section-eyebrow">EMPLOYEE → SKILLS → PROJECTS → ROLES</div><h2>Relationship map</h2></div>
              <div className="graph-legend"><span><i className="legend-strong" />Strong skill</span><span><i className="legend-developing" />In development</span><span><i className="legend-missing" />Skill gap</span></div>
            </div>

            <div className="relationship-board">
              <GraphStage number="01" title="Employee" icon={UserRound}>
                <div className="graph-employee-node"><span className="employee-node-avatar">{employee.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{employee.name}</strong><span>{employee.current_role}</span><small>{employee.experience_years} years · {employee.availability}</small></div>
              </GraphStage>
              <FlowConnector />
              <GraphStage number="02" title={`Skills · ${employeeSkills.length}`} icon={Sparkles}>
                <div className="graph-node-list skill-node-list">
                  {employeeSkills.map((skill) => <SkillNode skill={skill} key={skill.name} />)}
                  {!employeeSkills.length && <EmptyNode text="No skills recorded for this employee." />}
                </div>
              </GraphStage>
              <FlowConnector />
              <GraphStage number="03" title={`Projects · ${employeeProjects.length}`} icon={BriefcaseBusiness}>
                <div className="graph-node-list project-node-list">
                  {employeeProjects.map((link) => {
                    const relevantSkills = link.project.required_skills.filter((name) => employeeSkillMap.has(normalizeSkill(name)))
                    return <ProjectNode key={link.id} link={link} relevantSkills={relevantSkills} />
                  })}
                  {!employeeProjects.length && <EmptyNode text="No project contributions recorded." />}
                </div>
              </GraphStage>
              <FlowConnector />
              <GraphStage number="04" title={`Related roles · ${relatedRoles.length}`} icon={UsersRound}>
                <div className="graph-node-list role-node-list">
                  {relatedRoles.map((role) => <RoleNode role={role} key={role.id} />)}
                  {!relatedRoles.length && <EmptyNode text="No roles share this employee's current skills." />}
                </div>
              </GraphStage>
            </div>
          </section>

          <section className="employee-skills-detail">
            <div className="graph-section-heading">
              <div><div className="graph-section-eyebrow">DEMONSTRATED CAPABILITIES</div><h2>Skill proficiency</h2></div>
              <span className="skills-count-label">{employeeSkills.length} skills in profile</span>
            </div>
            <div className="proficiency-card-grid">
              {employeeSkills.map((skill) => <ProficiencyCard skill={skill} key={skill.name} />)}
              {!employeeSkills.length && <EmptyNode text="No skills recorded for this employee." />}
            </div>
          </section>
        </>
      ) : !loading && !error ? <EmptyNode text="No employees found. Seed demo data to explore the skill graph." /> : null}
    </div>
  )
}

function SummaryCard({ label, value, note, icon: Icon, tone }) {
  return <article className="graph-summary-card"><span className={`summary-icon ${tone}`}><Icon size={16} /></span><div><span className="summary-label">{label}</span><strong>{value}</strong><small>{note}</small></div></article>
}

function GraphStage({ number, title, icon: Icon, children }) {
  return <section className="graph-stage"><div className="graph-stage-heading"><span>{number}</span><Icon size={14} /><h3>{title}</h3></div>{children}</section>
}

function FlowConnector() {
  return <div className="graph-flow-connector" aria-hidden="true"><ArrowRight size={15} /><ArrowDown size={15} /></div>
}

function SkillNode({ skill }) {
  const level = PROFICIENCY_PROGRESS[skill.proficiency] ?? 25
  const strength = ['Advanced', 'Expert'].includes(skill.proficiency) ? 'strong' : 'developing'
  return <div className={`graph-skill-node ${strength}`}><span className="graph-node-status" /><span className="graph-skill-node-copy"><strong>{skill.name}</strong><small>{skill.proficiency}</small><i><b style={{ width: `${level}%` }} /></i></span><span className="graph-skill-percent">{level}%</span></div>
}

function ProjectNode({ link, relevantSkills }) {
  return <article className="graph-project-node"><div className="project-node-heading"><span className="project-node-icon"><BriefcaseBusiness size={13} /></span><div><strong>{link.project.name}</strong><small>{link.project.department} · {link.project.status}</small></div></div><p>{link.project.description}</p><div className="project-contribution"><span>CONTRIBUTION</span>{link.contribution}</div><div className="project-skill-tags">{relevantSkills.length ? relevantSkills.map((name) => <span key={name}>{name}</span>) : <small>No matching skill listed</small>}</div></article>
}

function RoleNode({ role }) {
  return <article className="graph-role-node"><div className="role-node-title"><strong>{role.title}</strong><span>{role.compatibility}%</span></div><small>{role.department} · {role.minimum_experience}+ years</small><div className="role-compat-track"><i style={{ width: `${role.compatibility}%` }} /></div><div className="role-matched-skills"><span className="role-skill-caption">MATCHED</span>{role.matchedSkills.map((name) => <span className="role-match-chip" key={name}><Check size={10} />{name}</span>)}</div><div className="role-missing-skills"><span className="role-skill-caption">GAPS</span>{role.missingSkills.length ? role.missingSkills.map((name) => <span className="role-gap-chip" key={name}><CircleAlert size={10} />{name}</span>) : <span className="role-no-gaps">All required skills</span>}</div></article>
}

function ProficiencyCard({ skill }) {
  const level = PROFICIENCY_PROGRESS[skill.proficiency] ?? 25
  const strong = ['Advanced', 'Expert'].includes(skill.proficiency)
  return <article className={`proficiency-card ${strong ? 'strong' : 'developing'}`}><div className="proficiency-card-top"><span className="proficiency-category">{skill.category}</span><span className={`proficiency-status ${strong ? 'status-strong' : 'status-developing'}`}><i />{strong ? 'Strong skill' : 'In development'}</span></div><h3>{skill.name}</h3><div className="proficiency-level-row"><span>{skill.proficiency}</span><strong>{level}%</strong></div><div className="proficiency-track"><i style={{ width: `${level}%` }} /></div></article>
}

function EmptyNode({ text }) {
  return <div className="graph-empty-node">{text}</div>
}

function GraphLoading() {
  return <div className="graph-loading" role="status"><span /><span /><span /><strong>Loading employee relationships...</strong></div>
}

export default SkillGraph