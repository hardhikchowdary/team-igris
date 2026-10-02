import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 5000 })

export const getHealth = () => api.get('/health')
export const getEmployees = () => api.get('/employees')
export const getRoles = () => api.get('/roles')
export const getSkills = () => api.get('/skills')
export const getProjects = () => api.get('/projects')
export const searchTalent = (payload) => api.post('/talent/search', payload)