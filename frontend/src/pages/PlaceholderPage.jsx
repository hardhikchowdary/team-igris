import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

function PlaceholderPage({ title }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon"><Construction size={22} /></div>
      <div className="eyebrow">HRM-03 WORKSPACE</div>
      <h1>{title}</h1>
      <p>This area is ready for the next build step.</p>
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to dashboard</Link>
    </section>
  )
}

export default PlaceholderPage