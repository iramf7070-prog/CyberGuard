import { useEffect, useState } from 'react'
import './App.css'

import Phishing from './Phishing'
import Network from './Network'
import Malware from './Malware'
import IncidentManagement from './IncidentManagement'
import SecurityReports from './SecurityReports'
import CentralizedMonitoring from './CentralizedMonitoring'
import SecurityDistribution from './SecurityDistribution'
import ThreatActivityTrend from './ThreatActivityTrend'
import SystemHealthMonitor from './SystemHealthMonitor'

function App() {
  const [dashboard, setDashboard] = useState(null)
  const [recentIncidents, setRecentIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        'https://cyberguard-backend-xybt.onrender.com/api/dashboard'
      )

      if (!response.ok) {
        throw new Error('Dashboard data load nahi ho paya.')
      }

      const data = await response.json()

      setDashboard(data.dashboard)
      setRecentIncidents(data.recentIncidents || [])
      setError('')
    } catch (err) {
      setError(
        'Backend se connection nahi ho pa raha. Backend server check karein.'
      )
    } finally {
      setLoading(false)
    }
  }

  fetchDashboard()

  const intervalId = setInterval(fetchDashboard, 10000)

  return () => clearInterval(intervalId)
}, [])
  return (
    <div className="app">

      <aside className="sidebar">
        <h2>🛡️ CyberGuard</h2>
        <p className="side-label">MAIN MENU</p>

        <nav>
  <a href="#dashboard">Dashboard</a>
  <a href="#phishing">Phishing Detection</a>
  <a href="#network">Network Intrusion</a>
  <a href="#malware">Malware Detection</a>
  <a href="#incidents">Incident Management</a>
  <a href="#reports">Security Reports</a>
  <a href="#monitoring">Centralized Monitoring</a>

  <a href="#recent-incidents">Recent Security Incidents</a>
  <a href="#distribution">Security Level Distribution</a>
  <a href="#threat-trend">Threat Activity Trend</a>
  <a href="#system-health">System Health Monitor</a>
</nav>

        <div className="sidebar-footer">
          <span>● System Online</span>
        </div>
      </aside>

      <main className="main-content" id="dashboard">

        <header className="topbar">
          <div>
            <h1>Security Dashboard</h1>
            <p>AI Based Cyber Threat Detection System</p>
          </div>
          <span className="admin">Administrator</span>
        </header>

        <section className="welcome">
          <h2>Welcome to CyberGuard</h2>
          <p>
            Monitor threats, analyze suspicious activity and manage
            your security incidents from one place.
          </p>
        </section>

        {error && <p className="error-message">{error}</p>}

        
<section className="stats">

  <button
    className={`stat-card ${selectedFilter === 'all' ? 'active' : ''}`}
    onClick={() => setSelectedFilter('all')}
  >
    <span className="stat-icon">📊</span>
    <p>Total Incidents</p>
    <h2>{loading ? '...' : dashboard?.total ?? 0}</h2>
    <span>All recorded incidents</span>
  </button>

  <button
    className={`stat-card ${selectedFilter === 'detected' ? 'active' : ''}`}
    onClick={() => setSelectedFilter('detected')}
  >
    <span className="stat-icon">🔍</span>
    <p>Detected Threats</p>
    <h2>{loading ? '...' : dashboard?.detected ?? 0}</h2>
    <span>Threats identified</span>
  </button>

  <button
    className={`stat-card ${selectedFilter === 'investigating' ? 'active' : ''}`}
    onClick={() => setSelectedFilter('investigating')}
  >
    <span className="stat-icon">🛡️</span>
    <p>Investigating</p>
    <h2>{loading ? '...' : dashboard?.investigating ?? 0}</h2>
    <span>Under investigation</span>
  </button>

  <button
    className={`stat-card ${selectedFilter === 'highRisk' ? 'active' : ''}`}
    onClick={() => setSelectedFilter('highRisk')}
  >
    <span className="stat-icon">⚠️</span>
    <p>High Risk</p>
    <h2>{loading ? '...' : dashboard?.highRisk ?? 0}</h2>
    <span>High priority incidents</span>
  </button>

</section>
        

        <section className="panel">
          <h2>Security Monitoring</h2>
          <p>Choose a security module to analyze activity.</p>

          <div className="modules">
            <div className="module-card">
              <h3>🔗 Phishing Detection</h3>
              <p>Analyze suspicious URLs.</p>
              <a href="#phishing">Open Module</a>
            </div>

            <div className="module-card">
              <h3>🌐 Network Intrusion</h3>
              <p>Analyze authorized network logs.</p>
              <a href="#network">Open Module</a>
            </div>

            <div className="module-card">
              <h3>🦠 Malware Detection</h3>
              <p>Inspect harmless test files safely.</p>
              <a href="#malware">Open Module</a>
            </div>
          </div>
        </section>

        <section className="panel" id="recent-incidents">
       <h2>Recent Security Incidents</h2>

          {loading ? (
            <p>Loading incidents...</p>
          ) : recentIncidents.length === 0 ? (
            <p>No security incidents found.</p>
          ) : (
            <div className="incident-list">
              {recentIncidents.map((incident) => (
                <div
  className={`incident-card risk-${incident.securityLevel?.toLowerCase()}`}
  key={incident._id}
>
  <h3>{incident.threatType}</h3>

  <p>{incident.description}</p>

  <p>
    <strong>Risk Score:</strong> {incident.riskScore}/100
  </p>

  <p>
    <strong>Security Level:</strong>
    <span className={`risk-badge ${incident.securityLevel?.toLowerCase()}`}>
      {incident.securityLevel}
    </span>
  </p>

  <p><strong>Status:</strong> {incident.status}</p>
  <p><strong>Source:</strong> {incident.source}</p>
</div>
              ))}
            </div>
          )}
        </section>
        {/* Security Level Distribution */}
<section className="panel" id="distribution">
  <SecurityDistribution />
</section>
{/* Threat Activity Trend */}
<section className="panel" id="threat-trend">
  <ThreatActivityTrend />
</section>
{/* System Health Monitor */}
<section className="panel" id="system-health">
  <SystemHealthMonitor />
</section>

        {/* Phishing Detection */}
        <section className="panel" id="phishing">
          <Phishing />
        </section>

        {/* Network Intrusion */}
        <section className="panel" id="network">
          <Network />
        </section>

        {/* Malware Detection */}
        <section className="panel" id="malware">
          <Malware />
        </section>

        {/* Incident Management */}
        <section className="panel" id="incidents">
          <IncidentManagement filter={selectedFilter} />
        </section>

        {/* Security Reports */}
        <section className="panel" id="reports">
          <SecurityReports />
        </section>

        {/* Centralized Monitoring */}
        <section className="panel" id="monitoring">
          <CentralizedMonitoring />
        </section>

        <footer>
          CyberGuard | AI Based Cyber Threat Detection System
        </footer>

      </main>
    </div>
  )
}

export default App