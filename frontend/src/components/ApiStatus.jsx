const labels = { checking: 'Checking API', connected: 'API connected', unavailable: 'API unavailable' }

function ApiStatus({ status }) {
  return <div className={`api-status ${status}`} role="status"><span className="status-indicator" />{labels[status]}</div>
}

export default ApiStatus