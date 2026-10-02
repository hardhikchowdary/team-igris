import { useEffect, useState } from 'react'
import { getHealth } from '../services/api.js'

export function useHealthStatus() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true
    getHealth()
      .then(({ data }) => { if (active) setStatus(data.status === 'ok' ? 'connected' : 'unavailable') })
      .catch(() => { if (active) setStatus('unavailable') })
    return () => { active = false }
  }, [])

  return status
}