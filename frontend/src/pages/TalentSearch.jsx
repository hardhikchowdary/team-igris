import { useEffect, useState } from 'react'
import {
  ArrowDownUp,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleAlert,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { getProjects, getRoles, getSkills, searchTalent } from '../services/api.js'
import '../styles/talent-search.css'

const MATCH_FACTORS = [
  { key: 'skills', label: 'Skills', maximum: 50 },
  { key: 'proficiency', label: 'Proficiency', maximum: 20 },
  { key: 'experience', label: 'Experience', maximum: 15 },
  { key: 'projects', label: 'Projects', maximum: 15 },
]
const SKILL_GAP_REASONS = {
  aws: 'Supports cloud deployment, infrastructure, and operating production services.',
  nlp: 'Useful for language-based AI applications and text processing.',
  'machine learning': 'Required to build, evaluate, and improve predictive models.',
  'computer vision': 'Supports image understanding and visual recognition workflows.',
  fastapi: 'Enables typed Python APIs for serving application and model workflows.',
  docker: 'Helps package and run services consistently across environments.',
  sql: 'Supports reliable access to structured data used by the role.',
  python: 'A core implementation skill for data and AI services in this role.',
  react: 'Supports interactive web experiences for the role’s product workflows.',
  java: 'Supports implementation in the organization’s Java service stack.',
  'data analysis': 'Turns source data into validated metrics and actionable insight.',
  'artificial intelligence': 'Builds foundational understanding of applied AI approaches.',
}

function TalentSearch() {
  const [roles, setRoles] = useState([])
  const [skills, setSkills] = useState([])
  const [projectCatalog, setProjectCatalog] = useState([])
  const [role, setRole] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [minimumExperience, setMinimumExperience] = useState(1)
  const [candidates, setCandidates] = useState([])
  const [requiredSkills, setRequiredSkills] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [searching, setSearching] = useState(false)
  const [sortBy, setSortBy] = useState('match')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getRoles(), getSkills()])
      .then(([roleResponse, skillResponse]) => {
        if (!active) return
        const nextRoles = roleResponse.data.roles
        setRoles(nextRoles)
        setSkills(skillResponse.data.skills)
        getProjects()
          .then(({ data }) => { if (active) setProjectCatalog(data.projects) })
          .catch(() => { if (active) setProjectCatalog([]) })
      })
      .catch(() => { if (active) setError('Could not load roles and skills. Check that the backend is running.') })
      .finally(() => { if (active) setLoadingOptions(false) })
    return () => { active = false }
  }, [])

  async function handleSearch(event) {
    event.preventDefault()
    if (!role) {
      setError('Please select a target role to search for talent.')
      return
    }
    setSearching(true)
    setError('')
    try {
      const { data } = await searchTalent({
        role,
        skills: selectedSkills,
        minimum_experience: Number(minimumExperience),
      })
      setCandidates(data.candidates)
      setRequiredSkills(data.required_skills)
      setHasSearched(true)
    } catch (requestError) {
      setError(requestError.response?.data?.detail ?? 'Talent search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  function toggleSkill(name) {
    setSelectedSkills((current) => current.includes(name)
      ? current.filter((skill) => skill !== name)
      : [...current, name])
  }

  const visibleCandidates = candidates
    .filter((candidate) => !availableOnly || candidate.availability === 'Available')
    .sort((first, second) => sortBy === 'experience'
      ? second.experience_years - first.experience_years || second.match_percentage - first.match_percentage
      : second.match_percentage - first.match_percentage || second.experience_years - first.experience_years)

  return (
    <div className="talent-search-page">
      <div className="page-heading talent-heading">
        <div>
          <div className="eyebrow">INTERNAL MOBILITY</div>
          <h1>Find your next teammate</h1>
          <p className="page-subtitle">Match people to opportunities using demonstrated skills and project work.</p>
        </div>
        <div className="talent-heading-mark"><Sparkles size={17} /><span>Evidence-based search</span></div>
      </div>

      <form className="talent-search-form" onSubmit={handleSearch}>
        <div className="search-form-heading">
          <div><span className="search-step">01</span><div><h2>Build your search</h2><p>Set a target role and the skills that matter most.</p></div></div>
          <span className="form-hint">Role requirements are included automatically</span>
        </div>
        <div className="search-fields">
          <label className="search-field role-field">
            <span className="field-label">TARGET ROLE</span>
            <span className="select-wrap"><select value={role} onChange={(event) => { setRole(event.target.value); setError('') }} disabled={loadingOptions}>
              <option value="">Select target role</option>
              {roles.map((item) => <option key={item.id} value={item.title}>{item.title}</option>)}
            </select><ChevronDown size={16} /></span>
          </label>
          <label className="search-field experience-field">
            <span className="field-label">MINIMUM EXPERIENCE</span>
            <span className="experience-control"><input type="number" min="0" max="60" step="0.5" value={minimumExperience} onChange={(event) => setMinimumExperience(event.target.value)} /><span>years</span></span>
          </label>
        </div>
        <div className="skills-field">
          <div className="skills-label-row"><span className="field-label">REQUIRED SKILLS</span><span className="skills-selected-count">{selectedSkills.length} selected</span></div>
          <div className="skill-selector" aria-label="Required skills">
            {skills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.name)
              const isRoleSkill = roles.find((item) => item.title === role)?.required_skills.includes(skill.name)
              return (
                <button key={skill.id} type="button" aria-pressed={isSelected} className={`skill-option${isSelected ? ' selected' : ''}`} onClick={() => toggleSkill(skill.name)}>
                  <span className="skill-check">{isSelected && <Check size={12} strokeWidth={2.5} />}</span>
                  {skill.name}{isRoleSkill && <span className="role-skill-dot" title="Required by selected role" />}
                </button>
              )
            })}
            {loadingOptions && <span className="loading-skills">Loading skills...</span>}
          </div>
        </div>
        <div className="search-form-footer">
          <span className="search-selection-note"><SlidersHorizontal size={14} /> Matching against {selectedSkills.length} selected skills and role requirements</span>
          <button className="search-submit" type="submit" disabled={loadingOptions || searching}>
            <Search size={16} />{searching ? 'Searching...' : 'Search talent'}
          </button>
        </div>
      </form>

      {error && <div className="search-error" role="alert"><CircleAlert size={17} />{error}</div>}

      {hasSearched && (
        <section className="search-results" aria-live="polite">
          <div className="results-toolbar">
            <div><div className="results-overline">02 / MATCH RESULTS</div><h2>{visibleCandidates.length} {visibleCandidates.length === 1 ? 'candidate' : 'candidates'} <span>for {role}</span></h2></div>
            <div className="results-controls">
              <label className="available-filter"><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} /><span className="toggle-track" /><span>Available only</span></label>
              <label className="sort-control"><ArrowDownUp size={14} /><span className="visually-hidden">Sort candidates</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="match">Best match</option><option value="experience">Most experience</option></select><ChevronDown size={13} /></label>
            </div>
          </div>
          <div className="active-requirements"><span>SEARCHING FOR</span>{requiredSkills.map((name) => <span key={name} className={`requirement-chip${selectedSkills.includes(name) ? ' emphasized' : ''}`}>{name}</span>)}</div>
          {visibleCandidates.length ? (
            <div className="candidate-list">
              {visibleCandidates.map((candidate, index) => <CandidateCard key={candidate.employee_id} candidate={candidate} role={role} projectCatalog={projectCatalog} rank={index + 1} onViewProfile={() => setSelectedCandidate(candidate)} />)}
            </div>
          ) : (
            <div className="no-results"><div className="no-results-mark"><UserRound size={21} /></div><h3>No candidates match these filters</h3><p>Try lowering the experience minimum or turning off “Available only”.</p></div>
          )}
        </section>
      )}

      {!hasSearched && !loadingOptions && !error && (
        <div className="search-prompt"><span className="prompt-icon"><Search size={17} /></span><span>Results will be ranked by skill fit, proficiency, experience, and project evidence.</span></div>
      )}

      {selectedCandidate && <CandidateProfile candidate={selectedCandidate} role={role} projectCatalog={projectCatalog} onClose={() => setSelectedCandidate(null)} />}
    </div>
  )
}

function CandidateCard({ candidate, role, projectCatalog, rank, onViewProfile }) {
  const initials = candidate.name.split(' ').map((part) => part[0]).join('').slice(0, 2)
  const relevantProjects = getRelevantProjectEvidence(candidate, projectCatalog)
  return (
    <article className="candidate-card">
      <div className="candidate-main">
        <div className="candidate-identity-row">
          <div className="candidate-avatar">{initials}</div>
          <div className="candidate-identity"><div className="candidate-name-line"><h3>{candidate.name}</h3><span className="candidate-rank">#{String(rank).padStart(2, '0')}</span></div><p>{candidate.current_role} <span>·</span> {candidate.department}</p></div>
          <div className={`match-ring${candidate.match_percentage >= 80 ? ' high' : ''}`} style={{ '--match': `${candidate.match_percentage}%` }}><div><strong>{candidate.match_percentage}%</strong><span>MATCH</span></div></div>
        </div>
        <div className="candidate-meta"><span><BriefcaseBusiness size={14} />{candidate.experience_years} years experience</span><span><MapPin size={14} />{candidate.location}</span><span className={`availability-tag${candidate.availability === 'Available' ? ' available' : ''}`}><i />{candidate.availability}</span></div>
        <div className="candidate-skill-groups">
          <div className="candidate-skill-group"><span className="candidate-group-label">MATCHED SKILLS</span><div className="candidate-tags">{candidate.matched_skills.length ? candidate.matched_skills.map((skill) => <span key={skill.name} className="matched-tag"><Check size={12} />{skill.name}<small>{skill.proficiency}</small></span>) : <span className="muted-inline">None yet</span>}</div></div>
          <div className="candidate-skill-group"><span className="candidate-group-label">SKILL GAPS</span><div className="candidate-tags">{candidate.missing_skills.length ? candidate.missing_skills.map((name) => <span key={name} className="missing-tag"><CircleAlert size={12} />{name}</span>) : <span className="complete-tag">All role skills matched</span>}</div></div>
        </div>
        <div className="candidate-projects"><span className="candidate-group-label">RELEVANT EXPERIENCE</span><div className="project-evidence-list">{candidate.relevant_projects.length ? candidate.projects.filter((project) => candidate.relevant_projects.includes(project.name)).map((project) => <span key={project.name} className="project-evidence"><BriefcaseBusiness size={13} /><span><strong>{project.name}</strong><small>{project.contribution}</small></span></span>) : <span className="muted-inline">No directly linked projects</span>}</div></div>
        <div className="candidate-explanation"><div className="explanation-heading"><Sparkles size={14} />WHY THIS CANDIDATE?</div><p>{candidate.explanation}</p></div>
        <CandidateEvidence candidate={candidate} role={role} relevantProjects={relevantProjects} />
        <div className="candidate-card-footer"><div className="score-breakdown"><span>SKILL FIT <b>{candidate.score_breakdown.skills}/50</b></span><span>PROFICIENCY <b>{candidate.score_breakdown.proficiency}/20</b></span><span>EXPERIENCE <b>{candidate.score_breakdown.experience}/15</b></span><span>PROJECTS <b>{candidate.score_breakdown.projects}/15</b></span></div><button type="button" className="profile-link" onClick={onViewProfile}>View profile <ChevronDown size={14} className="profile-link-arrow" /></button></div>
      </div>
    </article>
  )
}

function CandidateProfile({ candidate, role, projectCatalog, onClose }) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const matchedNames = new Set(candidate.matched_skills.map((skill) => skill.name))
  const relevantProjects = getRelevantProjectEvidence(candidate, projectCatalog)
  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="profile-modal-top"><span className="modal-overline">INTERNAL TALENT PROFILE</span><button type="button" className="modal-close" onClick={onClose} aria-label="Close profile"><X size={18} /></button></div>
        <div className="profile-hero"><span className="profile-large-avatar">{candidate.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><h2 id="profile-title">{candidate.name}</h2><p>{candidate.current_role} · {candidate.department}</p><div className="profile-hero-meta">{candidate.experience_years} years <span>·</span> {candidate.location} <span>·</span> {candidate.availability}</div></div><div className="profile-match"><strong>{candidate.match_percentage}%</strong><span>MATCH</span></div></div>
        <p className="profile-bio">{candidate.bio}</p>
        <div className="profile-modal-section"><h3>Skill profile</h3><div className="profile-skill-list">{candidate.skills.map((skill) => <span key={skill.name} className={`profile-skill${matchedNames.has(skill.name) ? ' role-match' : ''}`}><span>{skill.name}</span><small>{skill.proficiency}</small>{matchedNames.has(skill.name) && <Check size={13} />}</span>)}</div></div>
        <div className="profile-modal-section"><h3>Project experience <span>{candidate.projects.length}</span></h3><div className="profile-project-list">{candidate.projects.map((project) => <div className="profile-project" key={project.name}><span className="project-bullet"><BriefcaseBusiness size={14} /></span><div><strong>{project.name}</strong><p>{project.contribution}</p></div>{candidate.relevant_projects.includes(project.name) && <span className="project-relevant">RELEVANT</span>}</div>)}</div></div>
        <div className="profile-modal-section profile-fit-section"><h3>Role fit: {candidate.match_percentage}%</h3><div className="profile-fit-details"><div><span>Matched skills</span><strong>{candidate.matched_skills.map((skill) => skill.name).join(', ') || 'None'}</strong></div><div><span>Skill gaps</span><strong>{candidate.missing_skills.join(', ') || 'None'}</strong></div></div><p className="profile-explanation">{candidate.explanation}</p></div>
        <CandidateEvidence candidate={candidate} role={role} relevantProjects={relevantProjects} inProfile />
      </section>
    </div>
  )
}

function CandidateEvidence({ candidate, role, relevantProjects, inProfile = false }) {
  return (
    <details className={`candidate-evidence${inProfile ? ' in-profile' : ''}`}>
      <summary><span><Sparkles size={13} />Why this candidate?</span><span className="evidence-toggle">Show evidence <ChevronDown size={13} /></span></summary>
      <div className="candidate-evidence-content">
        <div className="evidence-summary"><strong>Overall match: {candidate.match_percentage}%</strong><p>{candidate.explanation}</p></div>
        <section className="evidence-factor-section"><h4>Match factors <small>Existing matching model</small></h4><div className="evidence-factor-list">{MATCH_FACTORS.map((factor) => { const score = candidate.score_breakdown[factor.key] ?? 0; const percent = Math.min(100, score / factor.maximum * 100); return <div className="evidence-factor" key={factor.key}><div><span>{factor.label} <small>{factor.maximum}% weight</small></span><strong>{score}/{factor.maximum}</strong></div><i><b style={{ width: `${percent}%` }} /></i></div> })}</div></section>
        <section className="evidence-skill-section"><h4>Matched skills</h4><div className="evidence-skill-chips">{candidate.matched_skills.length ? candidate.matched_skills.map((skill) => <span key={skill.name}><Check size={11} />{skill.name}<small>{skill.proficiency}</small></span>) : <small>No required skills matched.</small>}</div></section>
        <section className="evidence-skill-section"><h4>Skill gaps</h4><div className="evidence-gap-list">{candidate.missing_skills.length ? candidate.missing_skills.map((skill) => <div key={skill}><span><CircleAlert size={12} />{skill}</span><small>{SKILL_GAP_REASONS[skill.toLocaleLowerCase()] ?? `Required for the ${role} role.`}</small></div>) : <small>No required skills missing.</small>}</div></section>
        <section className="evidence-project-section"><h4>Relevant project evidence</h4>{relevantProjects.length ? relevantProjects.map((project) => <article className="evidence-project" key={project.name}><div><BriefcaseBusiness size={12} /><strong>{project.name}</strong></div><p>{project.contribution}</p><span>Relevant skills</span><div className="evidence-project-skills">{project.relevantSkills.length ? project.relevantSkills.map((skill) => <i key={skill}>{skill}</i>) : <small>Project skill detail unavailable</small>}</div></article>) : <small>No directly relevant project evidence.</small>}</section>
        <section className="evidence-experience"><h4>Experience evidence</h4><strong>{candidate.experience_years} years</strong><p>{candidate.current_role} · {candidate.department}</p><small>Relevant project work: {candidate.relevant_projects.length} {candidate.relevant_projects.length === 1 ? 'project' : 'projects'} linked to role skills.</small></section>
      </div>
    </details>
  )
}

function getRelevantProjectEvidence(candidate, projectCatalog) {
  const matchedNames = new Set(candidate.matched_skills.map((skill) => skill.name.toLocaleLowerCase()))
  return candidate.relevant_projects.map((name) => {
    const candidateProject = candidate.projects.find((project) => project.name === name)
    const projectRecord = projectCatalog.find((project) => project.name === name)
    return {
      name,
      contribution: candidateProject?.contribution ?? 'Project contribution recorded in employee profile.',
      relevantSkills: (projectRecord?.required_skills ?? []).filter((skill) => matchedNames.has(skill.toLocaleLowerCase())),
    }
  })
}

export default TalentSearch