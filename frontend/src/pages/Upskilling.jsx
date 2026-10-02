import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'
import { getEmployees, getRoles } from '../services/api.js'
import '../styles/upskilling.css'

const PROFICIENCY_PERCENT = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 }

const LEARNING_CATALOG = {
  AWS: {
    topic: 'Cloud & deployment fundamentals',
    duration: '2 weeks',
    why: 'Builds the cloud foundations needed to deploy and operate role-aligned services.',
    steps: ['Cloud concepts and shared responsibility', 'Core AWS compute, storage, and networking', 'Deploy a small service and review its permissions'],
  },
  NLP: {
    topic: 'NLP fundamentals and text processing',
    duration: '2 weeks',
    why: 'Adds practical language-processing experience for text-based AI workflows.',
    steps: ['Tokenization and text normalization', 'Embeddings and simple text classification', 'Evaluate an NLP task with a labeled sample'],
  },
  Python: {
    topic: 'Python for production applications',
    duration: '2 weeks',
    why: 'Strengthens Python implementation skills for maintainable role-related services.',
    steps: ['Modular Python and type hints', 'Testing and error handling', 'Package a small service with tests'],
  },
  'Machine Learning': {
    topic: 'Applied machine learning practice',
    duration: '3 weeks',
    why: 'Builds confidence turning data into evaluated, repeatable model workflows.',
    steps: ['Prepare features and establish a baseline', 'Train and compare a small set of models', 'Evaluate results and document limitations'],
  },
  'Artificial Intelligence': {
    topic: 'Applied AI foundations',
    duration: '2 weeks',
    why: 'Connects core AI concepts to a practical, measurable product problem.',
    steps: ['Review common AI problem types', 'Select an approach for a bounded use case', 'Prototype and evaluate a small solution'],
  },
  React: {
    topic: 'React application fundamentals',
    duration: '2 weeks',
    why: 'Builds the interface skills needed to deliver interactive product experiences.',
    steps: ['Components, props, and state', 'Forms and data loading', 'Build a responsive feature view'],
  },
  FastAPI: {
    topic: 'FastAPI service development',
    duration: '1 week',
    why: 'Adds API design and validation experience for Python-backed applications.',
    steps: ['Define typed request and response models', 'Add routes and dependency handling', 'Test an API endpoint locally'],
  },
  Java: {
    topic: 'Java application development',
    duration: '2 weeks',
    why: 'Strengthens implementation skills for services in the organization’s Java stack.',
    steps: ['Review object-oriented Java patterns', 'Build a small service module', 'Add unit tests and error handling'],
  },
  Docker: {
    topic: 'Container build and deployment basics',
    duration: '1 week',
    why: 'Makes services easier to package and run consistently across environments.',
    steps: ['Write a focused Dockerfile', 'Build and run a local image', 'Apply configuration and health checks'],
  },
  SQL: {
    topic: 'SQL querying and data modeling',
    duration: '1 week',
    why: 'Improves the ability to retrieve and shape reliable data for the target role.',
    steps: ['Practice joins and aggregations', 'Review indexes and query plans', 'Model a small reporting dataset'],
  },
  'Data Analysis': {
    topic: 'Practical data analysis',
    duration: '2 weeks',
    why: 'Develops the ability to turn raw data into useful, evidence-backed decisions.',
    steps: ['Check data quality and distributions', 'Explore trends and segment results', 'Summarize findings with clear metrics'],
  },
  'Computer Vision': {
    topic: 'Computer vision project practice',
    duration: '3 weeks',
    why: 'Builds experience preparing and evaluating image-based model workflows.',
    steps: ['Prepare and inspect labeled images', 'Train a simple image classifier', 'Review errors and document model limits'],
  },
}

function normalizeSkill(name) {
  return name.trim().toLocaleLowerCase()
}

function Upskilling() {
  const [employees, setEmployees] = useState([])
  const [roles, setRoles] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [expandedSkills, setExpandedSkills] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([getEmployees(), getRoles()])
      .then(([employeeResponse, roleResponse]) => {
        if (!active) return
        const nextEmployees = employeeResponse.data.employees
        const nextRoles = roleResponse.data.roles
        setEmployees(nextEmployees)
        setRoles(nextRoles)
        setEmployeeId((current) => current || String(nextEmployees.find((item) => item.name === 'Ananya Sharma')?.id ?? nextEmployees[0]?.id ?? ''))
        setRoleId((current) => current || String(nextRoles.find((item) => item.title === 'AI Engineer')?.id ?? nextRoles[0]?.id ?? ''))
        setError('')
      })
      .catch(() => { if (active) setError('Unable to load employees and roles. Check the backend connection and retry.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retryKey])

  const employee = employees.find((item) => String(item.id) === employeeId)
  const role = roles.find((item) => String(item.id) === roleId)
  const employeeSkillMap = new Map((employee?.skills ?? []).map((skill) => [normalizeSkill(skill.name), skill]))
  const requiredSkills = role?.required_skills ?? []
  const matchedSkills = requiredSkills.filter((name) => employeeSkillMap.has(normalizeSkill(name)))
  const missingSkills = requiredSkills.filter((name) => !employeeSkillMap.has(normalizeSkill(name)))
  const developingSkills = requiredSkills.filter((name) => {
    const proficiency = employeeSkillMap.get(normalizeSkill(name))?.proficiency
    return proficiency && !['Advanced', 'Expert'].includes(proficiency)
  })
  const compatibility = requiredSkills.length ? Math.round(matchedSkills.length / requiredSkills.length * 100) : 0
  const skillGaps = [
    ...missingSkills.map((name) => ({ name, priority: 'High', missing: true })),
    ...developingSkills.map((name) => ({ name, priority: 'Medium', missing: false })),
  ].sort((first, second) => priorityRank(first.priority) - priorityRank(second.priority) || first.name.localeCompare(second.name))
  const learningPath = skillGaps.map((gap) => ({
    ...gap,
    ...(LEARNING_CATALOG[gap.name] ?? createGenericLearning(gap.name)),
  }))
  const expectedCompatibility = requiredSkills.length ? 100 : compatibility
  const otherRoles = roles
    .filter((item) => String(item.id) !== roleId)
    .map((item) => {
      const matched = item.required_skills.filter((name) => employeeSkillMap.has(normalizeSkill(name)))
      return { ...item, compatibility: item.required_skills.length ? Math.round(matched.length / item.required_skills.length * 100) : 0 }
    })
    .filter((item) => item.compatibility > 0)
    .sort((first, second) => second.compatibility - first.compatibility || first.title.localeCompare(second.title))
    .slice(0, 3)

  function toggleLearning(name) {
    setExpandedSkills((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  return (
    <div className="upskilling-page">
      <div className="upskilling-heading">
        <div><div className="eyebrow">INTERNAL CAREER GROWTH</div><h1>Upskilling &amp; Learning Path</h1><p>Turn demonstrated skills into a practical path toward the next role.</p></div>
        <span className="upskilling-heading-mark"><GraduationCap size={17} />Evidence-led growth</span>
      </div>

      {error && <div className="upskilling-error" role="alert"><CircleAlert size={16} /><span>{error}</span><button type="button" onClick={() => { setLoading(true); setRetryKey((key) => key + 1) }}>Retry</button></div>}

      <section className="upskilling-selectors">
        <label className="upskilling-selector"><span className="upskilling-selector-icon"><UserRound size={16} /></span><span className="upskilling-selector-copy"><strong>Select employee</strong><small>{employee ? `${employee.current_role} · ${employee.department}` : 'Choose a profile'}</small></span><span className="upskilling-select-wrap"><select aria-label="Select employee" value={employeeId} disabled={loading || employees.length === 0} onChange={(event) => setEmployeeId(event.target.value)}><option value="">Select an employee</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={14} /></span></label>
        <span className="selector-connector"><ArrowRight size={16} /></span>
        <label className="upskilling-selector"><span className="upskilling-selector-icon target"><Target size={16} /></span><span className="upskilling-selector-copy"><strong>Target role</strong><small>{role ? `${role.minimum_experience}+ years · ${role.department}` : 'Choose a destination role'}</small></span><span className="upskilling-select-wrap"><select aria-label="Target role" value={roleId} disabled={loading || roles.length === 0} onChange={(event) => setRoleId(event.target.value)}><option value="">Select a target role</option>{roles.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><ChevronDown size={14} /></span></label>
      </section>

      {loading ? <UpskillingLoading /> : !employees.length ? (
        <EmptyState title="No employee profiles yet" detail="Seed the demo database to build an upskilling path from employee skills." />
      ) : !employeeId ? (
        <EmptyState title="Select an employee" detail="Choose an employee to see their current skills and role fit." />
      ) : !employee ? (
        <EmptyState title="Employee profile unavailable" detail="Choose another employee from the list." />
      ) : !roleId ? (
        <EmployeeSummary employee={employee}><EmptyState title="Select a target role" detail="Choose a role to calculate skill coverage and create a learning path." /></EmployeeSummary>
      ) : !role ? (
        <EmptyState title="Target role unavailable" detail="Choose another role from the list." />
      ) : (
        <>
          <EmployeeSummary employee={employee} />

          <section className="upskilling-overview-grid">
            <article className="current-skills-panel">
              <SectionHeading eyebrow="STARTING POINT" title="Current skills" detail={`${employee.skills.length} demonstrated skills`} />
              {employee.skills.length ? <div className="current-skill-grid">{employee.skills.map((skill) => <CurrentSkillCard skill={skill} required={requiredSkills.some((name) => normalizeSkill(name) === normalizeSkill(skill.name))} key={skill.name} />)}</div> : <EmptyState title="No skills on this profile" detail="There are no skill records to compare with the target role." />}
            </article>

            <article className="compatibility-panel">
              <div className="compatibility-panel-top"><SectionHeading eyebrow="TARGET ROLE" title={role.title} detail={`${role.department} · ${requiredSkills.length} required skills`} /><span className="compatibility-target-icon"><Target size={17} /></span></div>
              <div className="compatibility-score-row"><span className="compatibility-current-score">{compatibility}<small>%</small></span><span className="compatibility-score-caption">CURRENT<br />COMPATIBILITY</span></div>
              <div className="compatibility-track"><i style={{ width: `${compatibility}%` }} /></div>
              <div className="compatibility-foot"><span>Skill coverage</span><strong>{matchedSkills.length} of {requiredSkills.length} required skills</strong></div>
              <div className="compatibility-status-line"><span className="coverage-dot" />{missingSkills.length ? `${missingSkills.length} skill ${missingSkills.length === 1 ? 'gap' : 'gaps'} to close` : 'All required skills present'}</div>
              <div className="role-requirement-chips">{requiredSkills.map((name) => <span className={employeeSkillMap.has(normalizeSkill(name)) ? 'requirement-present' : 'requirement-missing'} key={name}>{employeeSkillMap.has(normalizeSkill(name)) ? <Check size={11} /> : <CircleAlert size={11} />}{name}</span>)}</div>
            </article>
          </section>

          <section className="skill-gap-section">
            <SectionHeading eyebrow="ROLE REQUIREMENTS − CURRENT SKILLS" title="Skill Gap Analysis" detail={`${skillGaps.length} learning ${skillGaps.length === 1 ? 'priority' : 'priorities'} identified for ${role.title}`} />
            {skillGaps.length ? <div className="skill-gap-grid">{skillGaps.map((gap) => <SkillGapCard gap={gap} key={gap.name} />)}</div> : <div className="no-skill-gaps"><Check size={16} /><span>All target role skills are at Advanced or Expert proficiency.</span></div>}
          </section>

          <section className="learning-section">
            <div className="learning-heading-row"><SectionHeading eyebrow="A PRACTICAL NEXT STEP" title="Recommended Learning Path" detail="Structured around this employee’s specific role gaps" /><span className="learning-path-duration"><Clock3 size={13} />{formatTotalDuration(learningPath)}</span></div>
            {learningPath.length ? <div className="learning-card-list">{learningPath.map((item, index) => <LearningCard key={item.name} item={item} index={index} targetRole={role.title} expanded={expandedSkills.includes(item.name)} onToggle={() => toggleLearning(item.name)} />)}<PracticeProjectCard role={role} gaps={learningPath.map((item) => item.name)} /></div> : <div className="no-skill-gaps learning-complete"><Check size={16} /><span>No skill gaps to plan for. Review the employee’s experience with the target team.</span></div>}
          </section>

          <section className="expected-section">
            <div className="expected-copy"><div className="upskilling-eyebrow">A PLANNING ESTIMATE, NOT A GUARANTEE</div><h2>Estimated After Upskilling</h2><p>Assumes all listed skill priorities are successfully completed.</p></div>
            <div className="expected-journey"><div className="expected-score current"><span>CURRENT</span><strong>{compatibility}%</strong><small>{matchedSkills.length}/{requiredSkills.length} skills</small></div><div className="expected-arrow"><span>{learningPath.length ? `${learningPath.length} priorities` : 'No gaps'}</span><ArrowRight size={18} /></div><div className="expected-score future"><span>ESTIMATED</span><strong>{expectedCompatibility}%</strong><small>{requiredSkills.length}/{requiredSkills.length} skills</small></div></div>
          </section>

          <section className="roadmap-section">
            <SectionHeading eyebrow="FROM CURRENT STATE TO ROLE READINESS" title="Learning Roadmap" detail="A simple progression from current capabilities to applied practice" />
            <div className="roadmap-track">
              <RoadmapStep number="01" icon={UserRound} title="Current skills" detail={`${employee.skills.length} proficiencies`} state="complete" />
              <RoadmapStep number="02" icon={CircleAlert} title="Skill gap analysis" detail={`${skillGaps.length} priorities`} state={skillGaps.length ? 'active' : 'complete'} />
              <RoadmapStep number="03" icon={Target} title="Priority skills" detail={skillGaps.length ? skillGaps.map((item) => item.name).slice(0, 2).join(', ') : 'No gaps'} state={skillGaps.length ? 'next' : 'complete'} />
              <RoadmapStep number="04" icon={BookOpenCheck} title="Learning path" detail={`${learningPath.length} learning steps`} state={learningPath.length ? 'next' : 'complete'} />
              <RoadmapStep number="05" icon={BriefcaseBusiness} title="Practice project" detail="Apply skills in context" state="next" />
              <RoadmapStep number="06" icon={Target} title="Target role" detail={role.title} state="target" />
            </div>
          </section>

          {otherRoles.length > 0 && <section className="other-roles-section"><SectionHeading eyebrow="SKILL OVERLAP" title="Other Compatible Roles" detail="Compatibility is based on required-skill coverage" /><div className="other-role-grid">{otherRoles.map((item) => <article className="other-role-card" key={item.id}><span className="other-role-icon"><BriefcaseBusiness size={15} /></span><div className="other-role-info"><strong>{item.title}</strong><small>{item.department}</small></div><strong className="other-role-score">{item.compatibility}%</strong><div className="other-role-track"><i style={{ width: `${item.compatibility}%` }} /></div></article>)}</div></section>}
        </>
      )}
    </div>
  )
}

function EmployeeSummary({ employee, children }) {
  return <section className="upskilling-employee-summary"><span className="upskilling-employee-avatar">{employee.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="upskilling-employee-main"><div className="upskilling-employee-title"><h2>{employee.name}</h2><span className={`upskilling-availability${employee.availability === 'Available' ? ' available' : ''}`}><i />{employee.availability}</span></div><p>{employee.current_role} <span>·</span> {employee.department}</p></div><div className="upskilling-employee-meta"><span>{employee.experience_years} years experience</span><span><MapPin size={13} />{employee.location}</span></div>{children}</section>
}

function SectionHeading({ eyebrow, title, detail }) {
  return <div className="upskilling-section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{detail && <p>{detail}</p>}</div>
}

function CurrentSkillCard({ skill, required }) {
  const percent = PROFICIENCY_PERCENT[skill.proficiency] ?? 25
  const strong = ['Advanced', 'Expert'].includes(skill.proficiency)
  return <article className={`current-skill-card${required ? ' role-required' : ''}`}><div className="current-skill-top"><span className="skill-category-label">{skill.category}</span><span className={`skill-status-pill ${strong ? 'strong' : 'developing'}`}><i />{strong ? 'Strong' : 'Developing'}</span></div><h3>{skill.name}</h3><div className="current-skill-level"><span>{skill.proficiency}</span><strong>{percent}%</strong></div><div className="current-skill-track"><i className={strong ? 'strong' : ''} style={{ width: `${percent}%` }} /></div>{required && <span className="required-skill-note"><Check size={10} />Required for target role</span>}</article>
}

function SkillGapCard({ gap }) {
  const content = LEARNING_CATALOG[gap.name] ?? createGenericLearning(gap.name)
  return <article className={`skill-gap-card priority-${gap.priority.toLowerCase()}`}><div className="skill-gap-top"><span className={`priority-badge ${gap.priority.toLowerCase()}`}><i />{gap.priority} priority</span><span className="gap-state-label">{gap.missing ? 'Missing' : 'Needs practice'}</span></div><h3>{gap.name}</h3><p>{content.why}</p><div className="gap-recommendation"><Sparkles size={13} /><span>{content.topic}</span></div></article>
}

function LearningCard({ item, index, targetRole, expanded, onToggle }) {
  return <article className={`learning-card priority-${item.priority.toLowerCase()}`}><div className="learning-card-step"><span>{String(index + 1).padStart(2, '0')}</span><i /></div><div className="learning-card-body"><div className="learning-card-meta"><span className="learning-skill-name">{item.name}</span><span className={`priority-badge ${item.priority.toLowerCase()}`}><i />{item.priority}</span><span className="learning-duration"><Clock3 size={12} />{item.duration}</span></div><h3>{item.topic}</h3><p className="learning-why"><strong>Why it matters</strong>{item.why}</p><div className="learning-card-bottom"><span>Target: {targetRole}</span><button type="button" aria-expanded={expanded} onClick={onToggle}>{expanded ? 'Hide steps' : 'View learning steps'}{expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button></div>{expanded && <ol className="learning-steps">{item.steps.map((step) => <li key={step}><Check size={12} />{step}</li>)}</ol>}</div></article>
}

function PracticeProjectCard({ role, gaps }) {
  return <article className="practice-project-card"><span className="practice-project-icon"><BriefcaseBusiness size={16} /></span><div><span className="practice-project-overline">FINAL PRACTICE</span><h3>Build a {role.title} portfolio project</h3><p>Apply {gaps.join(', ')} in a small project tied to real role requirements.</p></div><span className="practice-duration">1 week</span></article>
}

function RoadmapStep({ number, icon: Icon, title, detail, state }) {
  return <div className={`roadmap-step ${state}`}><span className="roadmap-node"><Icon size={15} /></span><span className="roadmap-number">{number}</span><strong>{title}</strong><small>{detail}</small></div>
}

function UpskillingLoading() {
  return <div className="upskilling-loading" role="status"><span /><span /><span /><strong>Loading employee and role data...</strong></div>
}

function EmptyState({ title, detail }) {
  return <div className="upskilling-empty"><span><GraduationCap size={18} /></span><strong>{title}</strong><p>{detail}</p></div>
}

function priorityRank(priority) {
  return { High: 0, Medium: 1, Low: 2 }[priority] ?? 3
}

function createGenericLearning(skill) {
  return {
    topic: `${skill} foundations and applied practice`,
    duration: '2 weeks',
    why: `Develops practical ${skill} experience that supports the target role’s requirements.`,
    steps: [`Review ${skill} fundamentals`, `Complete a guided ${skill} exercise`, `Apply ${skill} in a small role-related project`],
  }
}

function formatTotalDuration(path) {
  const weeks = path.reduce((total, item) => total + (Number.parseInt(item.duration, 10) || 0), 1)
  return `${weeks} week${weeks === 1 ? '' : 's'} incl. practice`
}

export default Upskilling