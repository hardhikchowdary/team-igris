import { BriefcaseBusiness, Layers3, Sparkles, UserCheck, UsersRound } from 'lucide-react'

export const dashboardStats = [
  { label: 'Total employees', key: 'employees', icon: UsersRound, tone: 'mint', note: 'Across the organization' },
  { label: 'Available talent', key: 'available', icon: UserCheck, tone: 'blue', note: 'Ready for new work' },
  { label: 'Total skills', key: 'skills', icon: Sparkles, tone: 'yellow', note: 'Unique skills on record' },
  { label: 'Active projects', key: 'projects', icon: Layers3, tone: 'mint', note: 'In progress or active' },
  { label: 'Open roles', key: 'roles', icon: BriefcaseBusiness, tone: 'blue', note: 'Target roles to fill' },
]