import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Search,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react'
import { getEmployees } from '../services/api.js'
import '../styles/marketplace.css'

const CATEGORIES = ['All', 'Projects', 'Jobs', 'Courses', 'Mentorship']

const OPPORTUNITIES = [
  {
    id: 'project-ai-recruitment', category: 'Projects', title: 'AI Recruitment Assistant',
    description: 'Build an intelligent recruitment assistant that helps teams organize role requirements and candidate evidence.',
    skills: ['Python', 'Machine Learning', 'FastAPI', 'SQL', 'NLP'], team: 'People Technology', level: 'Cross-functional project', duration: '6 weeks', demoMatch: 86,
  },
  {
    id: 'project-customer-analytics', category: 'Projects', title: 'Customer Analytics Platform',
    description: 'Unify customer events and deliver a trusted analytics experience for product and business teams.',
    skills: ['SQL', 'Data Analysis', 'Python', 'React'], team: 'Business Intelligence', level: 'Project team', duration: '8 weeks', demoMatch: 82,
  },
  {
    id: 'project-computer-vision', category: 'Projects', title: 'Computer Vision System',
    description: 'Create an image classification service and review workflow for quality operations.',
    skills: ['Python', 'Machine Learning', 'Computer Vision', 'FastAPI'], team: 'Applied AI', level: 'Applied AI project', duration: '8 weeks', demoMatch: 79,
  },
  {
    id: 'project-sales-forecasting', category: 'Projects', title: 'Sales Forecasting Platform',
    description: 'Explore historical sales patterns and help planning teams compare forecast scenarios.',
    skills: ['Python', 'SQL', 'Data Analysis', 'Machine Learning'], team: 'Decision Science', level: 'Project team', duration: '6 weeks', demoMatch: 78,
  },
  {
    id: 'job-ai-engineer', category: 'Jobs', title: 'AI Engineer',
    description: 'Prototype applied AI workflows and help move promising ideas into useful internal tools.',
    skills: ['Python', 'Machine Learning', 'SQL', 'FastAPI', 'AWS'], team: 'Applied AI', level: '3+ years · Full time', duration: 'Ongoing', demoMatch: 84,
  },
  {
    id: 'job-ml-engineer', category: 'Jobs', title: 'ML Engineer',
    description: 'Build and evaluate reliable model services with the applied machine learning team.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Docker'], team: 'Applied AI', level: '2+ years · Full time', duration: 'Ongoing', demoMatch: 81,
  },
  {
    id: 'job-cloud-engineer', category: 'Jobs', title: 'Cloud Engineer',
    description: 'Improve cloud foundations, deployment practices, and service operations across product teams.',
    skills: ['AWS', 'Docker', 'Python', 'Java'], team: 'Infrastructure', level: '4+ years · Full time', duration: 'Ongoing', demoMatch: 76,
  },
  {
    id: 'job-data-analyst', category: 'Jobs', title: 'Data Analyst',
    description: 'Turn customer and operational data into trusted metrics and actionable insights.',
    skills: ['SQL', 'Data Analysis', 'Python', 'Machine Learning'], team: 'Business Intelligence', level: '2+ years · Full time', duration: 'Ongoing', demoMatch: 80,
  },
  {
    id: 'course-aws', category: 'Courses', title: 'AWS Cloud Fundamentals',
    description: 'Learn core cloud concepts, AWS services, and the foundations for deploying an application.',
    skills: ['AWS', 'Docker'], team: 'Learning & Development', level: 'Beginner', duration: '2 weeks', demoMatch: 82,
  },
  {
    id: 'course-ml', category: 'Courses', title: 'Machine Learning Fundamentals',
    description: 'Practice feature preparation, model evaluation, and baseline machine learning workflows.',
    skills: ['Python', 'Machine Learning', 'Data Analysis'], team: 'Learning & Development', level: 'Intermediate', duration: '3 weeks', demoMatch: 85,
  },
  {
    id: 'course-python', category: 'Courses', title: 'Advanced Python',
    description: 'Improve Python design, testing, typing, and service development skills through practical exercises.',
    skills: ['Python', 'FastAPI'], team: 'Learning & Development', level: 'Intermediate', duration: '2 weeks', demoMatch: 79,
  },
  {
    id: 'course-nlp', category: 'Courses', title: 'NLP Fundamentals',
    description: 'Explore text processing, embeddings, and evaluation for language-based applications.',
    skills: ['Python', 'NLP', 'Machine Learning'], team: 'Learning & Development', level: 'Intermediate', duration: '2 weeks', demoMatch: 77,
  },
  {
    id: 'mentor-ai-ml', category: 'Mentorship', title: 'AI/ML Career Mentorship',
    description: 'Get practical guidance on applied AI projects, model evaluation, and internal career pathways.',
    skills: ['Python', 'Machine Learning', 'Artificial Intelligence'], team: 'Innovation Lab', level: 'Early to mid-career', duration: '4 sessions', demoMatch: 83,
  },
  {
    id: 'mentor-cloud', category: 'Mentorship', title: 'Cloud Engineering Mentorship',
    description: 'Learn from infrastructure engineers about cloud architecture, containers, and deployment practice.',
    skills: ['AWS', 'Docker', 'Python'], team: 'Cloud Operations', level: 'All levels', duration: '4 sessions', demoMatch: 74,
  },
  {
    id: 'mentor-data', category: 'Mentorship', title: 'Data Analytics Mentorship',
    description: 'Develop stronger analysis habits, metric design, and stakeholder communication with an analyst mentor.',
    skills: ['SQL', 'Data Analysis', 'Python'], team: 'Business Intelligence', level: 'Early career', duration: '6 sessions', demoMatch: 80,
  },
  {
    id: 'mentor-fullstack', category: 'Mentorship', title: 'Full Stack Development Mentorship',
    description: 'Pair on practical web application design, frontend delivery, and API integration.',
    skills: ['React', 'Java', 'SQL', 'Docker'], team: 'Digital Products', level: 'Early to mid-career', duration: '4 sessions', demoMatch: 76,
  },
]

function normalizeSkill(name) {
  return name.trim().toLocaleLowerCase()
}

function Marketplace() {
  const [employees, setEmployees] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [employeeLoading, setEmployeeLoading] = useState(true)
  const [employeeError, setEmployeeError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [savedOpportunityId, setSavedOpportunityId] = useState('')

  useEffect(() => {
    let active = true
    getEmployees()
      .then(({ data }) => {
        if (!active) return
        setEmployees(data.employees)
        const defaultEmployee = data.employees.find((employee) => employee.name === 'Ananya Sharma') ?? data.employees[0]
        setEmployeeId(defaultEmployee ? String(defaultEmployee.id) : '')
      })
      .catch(() => { if (active) setEmployeeError('Employee data is unavailable. Showing demo opportunity matches.') })
      .finally(() => { if (active) setEmployeeLoading(false) })
    return () => { active = false }
  }, [])

  const selectedEmployee = employees.find((employee) => String(employee.id) === employeeId)
  const employeeSkills = new Set((selectedEmployee?.skills ?? []).map((skill) => normalizeSkill(skill.name)))
  const scoredOpportunities = OPPORTUNITIES.map((opportunity) => {
    const matchedSkills = opportunity.skills.filter((skill) => employeeSkills.has(normalizeSkill(skill)))
    return {
      ...opportunity,
      matchedSkills,
      missingSkills: opportunity.skills.filter((skill) => !employeeSkills.has(normalizeSkill(skill))),
      matchPercentage: selectedEmployee
        ? Math.round(matchedSkills.length / opportunity.skills.length * 100)
        : opportunity.demoMatch,
    }
  })
  const query = search.trim().toLocaleLowerCase()
  const filteredOpportunities = scoredOpportunities
    .filter((item) => category === 'All' || item.category === category)
    .filter((item) => !query || [item.title, item.description, item.team, item.level, item.skills.join(' ')].join(' ').toLocaleLowerCase().includes(query))
  const recommendations = [...scoredOpportunities]
    .sort((first, second) => second.matchPercentage - first.matchPercentage || first.title.localeCompare(second.title))
    .slice(0, 4)

  function closeOpportunity() {
    setSelectedOpportunity(null)
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-heading">
        <div><div className="eyebrow">INTERNAL MOBILITY</div><h1>Talent Marketplace</h1><p>Discover projects, roles, learning opportunities and mentors based on your skills.</p></div>
        <span className="marketplace-heading-badge"><Sparkles size={15} />Skill-matched opportunities</span>
      </div>

      <section className="marketplace-kpis" aria-label="Marketplace opportunity totals">
        <MarketplaceKpi icon={Layers3} label="Available Projects" value={countCategory('Projects')} tone="mint" />
        <MarketplaceKpi icon={BriefcaseBusiness} label="Open Roles" value={countCategory('Jobs')} tone="blue" />
        <MarketplaceKpi icon={BookOpenCheck} label="Learning Opportunities" value={countCategory('Courses')} tone="yellow" />
        <MarketplaceKpi icon={HeartHandshake} label="Mentorship Opportunities" value={countCategory('Mentorship')} tone="purple" />
      </section>

      <section className="marketplace-toolbar">
        <label className="marketplace-employee-select"><span>View opportunities for</span><span className="marketplace-select-wrap"><select aria-label="View opportunities for" value={employeeId} disabled={employeeLoading || employees.length === 0} onChange={(event) => setEmployeeId(event.target.value)}><option value="">Demo match scores</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.current_role}</option>)}</select><ChevronDown size={15} /></span></label>
        <label className="marketplace-search"><Search size={16} /><input type="search" placeholder="Search opportunities..." value={search} onChange={(event) => setSearch(event.target.value)} /><span className="search-shortcut">TITLE · SKILLS · TEAM</span></label>
      </section>
      {employeeError && <div className="marketplace-info" role="status">{employeeError}</div>}

      <section className="marketplace-recommendations">
        <div className="marketplace-section-heading"><div><span className="marketplace-eyebrow">BASED ON {selectedEmployee ? `${selectedEmployee.name.toUpperCase()}’S SKILLS` : 'DEMO PROFILE'}</span><h2>Opportunities Matching Your Skills</h2></div><span className="recommendation-count">{recommendations.length} opportunities</span></div>
        <div className="recommendation-grid">{recommendations.map((item, index) => <RecommendedOpportunity key={item.id} opportunity={item} rank={index + 1} onView={() => setSelectedOpportunity(item)} />)}</div>
      </section>

      <section className="marketplace-browse">
        <div className="marketplace-section-heading browse-heading"><div><span className="marketplace-eyebrow">EXPLORE THE INTERNAL NETWORK</span><h2>Browse Opportunities</h2></div><span className="browse-result-count">{filteredOpportunities.length} results</span></div>
        <div className="marketplace-category-tabs" role="group" aria-label="Filter opportunities by category">{CATEGORIES.map((name) => <button type="button" className={category === name ? 'active' : ''} aria-pressed={category === name} onClick={() => setCategory(name)} key={name}>{name}<span>{name === 'All' ? OPPORTUNITIES.length : countCategory(name)}</span></button>)}</div>
        {filteredOpportunities.length ? <div className="opportunity-grid">{filteredOpportunities.map((item) => <OpportunityCard opportunity={item} onView={() => setSelectedOpportunity(item)} key={item.id} />)}</div> : <div className="marketplace-empty"><span><Search size={18} /></span><strong>No opportunities found</strong><p>Try a different search or select another category.</p><button type="button" onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button></div>}
      </section>

      {selectedOpportunity && <OpportunityModal opportunity={selectedOpportunity} employee={selectedEmployee} saved={savedOpportunityId === selectedOpportunity.id} onExplore={() => setSavedOpportunityId(selectedOpportunity.id)} onClose={closeOpportunity} />}
    </div>
  )
}

function countCategory(category) {
  return OPPORTUNITIES.filter((item) => item.category === category).length
}

function CategoryIcon({ category, size }) {
  switch (category) {
    case 'Projects': return <Layers3 size={size} />
    case 'Jobs': return <BriefcaseBusiness size={size} />
    case 'Courses': return <GraduationCap size={size} />
    case 'Mentorship': return <HeartHandshake size={size} />
    default: return <BriefcaseBusiness size={size} />
  }
}

function categoryLabel(category) {
  return { Projects: 'Project', Jobs: 'Job', Courses: 'Course', Mentorship: 'Mentorship' }[category] ?? category
}

function MarketplaceKpi({ icon: Icon, label, value, tone }) {
  return <article className="marketplace-kpi"><span className={`marketplace-kpi-icon ${tone}`}><Icon size={16} /></span><div><span>{label}</span><strong>{value}</strong></div></article>
}

function MatchMeter({ percentage, small = false }) {
  return <span className={`opportunity-match${small ? ' small' : ''}`}><span className="opportunity-match-value">{percentage}%<small>MATCH</small></span><i><b style={{ width: `${percentage}%` }} /></i></span>
}

function RecommendedOpportunity({ opportunity, rank, onView }) {
  return <article className="recommended-opportunity"><span className="recommendation-rank">{String(rank).padStart(2, '0')}</span><span className={`recommendation-icon ${opportunity.category.toLowerCase()}`}><CategoryIcon category={opportunity.category} size={15} /></span><div className="recommendation-main"><strong>{opportunity.title}</strong><small>{categoryLabel(opportunity.category)} · {opportunity.team}</small><span className="recommendation-skills">{opportunity.skills.slice(0, 3).map((skill) => <i key={skill}>{skill}</i>)}</span></div><MatchMeter percentage={opportunity.matchPercentage} small /><button type="button" className="recommendation-view" onClick={onView} aria-label={`View ${opportunity.title}`}><ArrowUpRight size={15} /></button></article>
}

function OpportunityCard({ opportunity, onView }) {
  return <article className="opportunity-card"><div className="opportunity-card-top"><span className={`opportunity-category ${opportunity.category.toLowerCase()}`}><CategoryIcon category={opportunity.category} size={12} />{categoryLabel(opportunity.category)}</span><MatchMeter percentage={opportunity.matchPercentage} /></div><h3>{opportunity.title}</h3><p className="opportunity-description">{opportunity.description}</p><div className="opportunity-skills">{opportunity.skills.map((skill) => <span className={opportunity.matchedSkills.some((matched) => normalizeSkill(matched) === normalizeSkill(skill)) ? 'has-skill' : ''} key={skill}>{skill}</span>)}</div><div className="opportunity-meta"><span><UsersRound size={13} />{opportunity.team}</span><span><Sparkles size={13} />{opportunity.level}</span><span><Clock3 size={13} />{opportunity.duration}</span></div><button type="button" className="view-opportunity-button" onClick={onView}>View Opportunity <ArrowRight size={14} /></button></article>
}

function OpportunityModal({ opportunity, employee, saved, onExplore, onClose }) {
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

  return <div className="marketplace-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="marketplace-modal" role="dialog" aria-modal="true" aria-labelledby="opportunity-modal-title"><div className="marketplace-modal-top"><span className={`opportunity-category ${opportunity.category.toLowerCase()}`}><CategoryIcon category={opportunity.category} size={12} />{categoryLabel(opportunity.category)}</span><button type="button" className="marketplace-modal-close" onClick={onClose} aria-label="Close opportunity details"><X size={17} /></button></div><div className="marketplace-modal-title-row"><div><span className="marketplace-eyebrow">INTERNAL OPPORTUNITY</span><h2 id="opportunity-modal-title">{opportunity.title}</h2></div><MatchMeter percentage={opportunity.matchPercentage} /></div><p className="marketplace-modal-description">{opportunity.description}</p><div className="marketplace-modal-facts"><span><UsersRound size={14} /><strong>{opportunity.team}</strong><small>Team</small></span><span><Sparkles size={14} /><strong>{opportunity.level}</strong><small>Level</small></span><span><Clock3 size={14} /><strong>{opportunity.duration}</strong><small>Duration</small></span></div><div className="marketplace-modal-section"><h3>Required skills</h3><div className="modal-skill-list">{opportunity.skills.map((skill) => { const hasSkill = opportunity.matchedSkills.some((matched) => normalizeSkill(matched) === normalizeSkill(skill)); return <span className={hasSkill ? 'modal-skill-present' : 'modal-skill-missing'} key={skill}>{hasSkill ? <Check size={12} /> : <span>•</span>}{skill}</span> })}</div></div>{employee ? <div className="marketplace-match-detail"><div className="marketplace-match-detail-heading"><span>SKILL FIT FOR {employee.name.toUpperCase()}</span><strong>{opportunity.matchPercentage}%</strong></div><div className="marketplace-match-track"><i style={{ width: `${opportunity.matchPercentage}%` }} /></div><div className="match-detail-columns"><div><h4>You have</h4>{opportunity.matchedSkills.length ? opportunity.matchedSkills.map((skill) => <span className="match-detail-skill" key={skill}><Check size={11} />{skill}</span>) : <small>No required skills matched yet.</small>}</div><div><h4>Skill gaps</h4>{opportunity.missingSkills.length ? opportunity.missingSkills.map((skill) => <span className="match-detail-gap" key={skill}><span>•</span>{skill}</span>) : <small>No skill gaps identified.</small>}</div></div></div> : <p className="marketplace-demo-note">Select an employee to see personalized matched and missing skills. This card uses a static demo match.</p>}{saved && <div className="opportunity-saved-message" role="status"><Check size={14} />Opportunity saved to your profile.</div>}<div className="marketplace-modal-actions"><button type="button" className="marketplace-secondary-button" onClick={onClose}>Close</button><button type="button" className="marketplace-explore-button" onClick={onExplore}>{saved ? 'Saved' : 'Explore'}{saved ? <Check size={14} /> : <ArrowUpRight size={14} />}</button></div></section></div>
}

export default Marketplace