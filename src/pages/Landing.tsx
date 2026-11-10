import { ArrowRight, Camera, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Landing(){
 const navigate=useNavigate()
 return <div className="landing"><nav className="landing-nav"><Link to="/" className="brand"><span className="brand-mark">R</span><span className="brand-name">ResQEdge</span></Link><div className="landing-nav-links"><Link to="/field">Field app</Link><Link className="btn btn-primary btn-sm" to="/dashboard">Open console <ArrowRight size={14}/></Link></div></nav><main className="landing-main"><section className="landing-hero"><p className="landing-eyebrow">Offline first disaster response</p><h1 className="landing-title">Assess damage.<br/>Coordinate response.</h1><p>Run on-device image assessment, triage local response priorities, and sync when connectivity returns.</p><div className="capture-actions"><Link className="btn btn-primary" to="/field"><Camera size={15}/>Start assessment</Link><button className="btn btn-secondary" onClick={()=>navigate('/dashboard?demo=1')}><Sparkles size={15}/>Watch guided demo</button></div></section><section id="capabilities" className="landing-capabilities"><h2>Designed for disrupted networks</h2><p>Assessments are decision support, not structural safety judgments. Review all results with trained responders.</p></section></main></div>
}
